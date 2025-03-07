<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$stmt = $pdo->prepare("SELECT username, credits, level, fragments_collected, solved_puzzles, badge, last_login, streak FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$today = date('Y-m-d');
if ($user['last_login'] !== $today) {
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    $streak = ($user['last_login'] === $yesterday) ? $user['streak'] + 1 : 1;
    $stmt = $pdo->prepare("UPDATE users SET last_login = ?, streak = ? WHERE id = ?");
    $stmt->execute([$today, $streak, $_SESSION['user_id']]);
    $user['streak'] = $streak;
    if ($streak >= 3 && !$pdo->query("SELECT FIND_IN_SET(4, achievements) FROM users WHERE id = {$_SESSION['user_id']}")->fetchColumn()) {
        $stmt = $pdo->prepare("UPDATE users SET achievements = CONCAT(achievements, ',4') WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
    }
}

$fragments = [];
if ($user['fragments_collected']) {
    $ids = array_filter(explode(',', $user['fragments_collected']));
    if (!empty($ids)) {
        $stmt = $pdo->prepare("SELECT * FROM fragments WHERE id IN (" . implode(',', array_fill(0, count($ids), '?')) . ")");
        $stmt->execute($ids);
        $fragments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

$solved = [];
if ($user['solved_puzzles']) {
    $ids = array_filter(explode(',', $user['solved_puzzles']));
    if (!empty($ids)) {
        $stmt = $pdo->prepare("SELECT id, type, question, core, difficulty, language FROM puzzles WHERE id IN (" . implode(',', array_fill(0, count($ids), '?')) . ")");
        $stmt->execute($ids);
        $solved = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

$stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
$total = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) as rank FROM users WHERE credits > ?");
$stmt->execute([$user['credits']]);
$rank = $stmt->fetchColumn() + 1;

echo json_encode([
    'username' => $user['username'],
    'credits' => $user['credits'],
    'level' => $user['level'],
    'fragments' => $fragments,
    'solved_puzzles' => $solved,
    'badge' => $user['badge'],
    'streak' => $user['streak'],
    'rank' => $rank,
    'total_players' => $total
]);
?>