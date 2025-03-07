<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$stmt = $pdo->prepare("SELECT username, credits, fragments_collected FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$fragments = [];
if ($user['fragments_collected']) {
    $ids = explode(',', trim($user['fragments_collected'], ','));
    $stmt = $pdo->prepare("SELECT * FROM fragments WHERE id IN (" . implode(',', array_fill(0, count($ids), '?')) . ")");
    $stmt->execute($ids);
    $fragments = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
$total = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) as rank FROM users WHERE credits > ?");
$stmt->execute([$user['credits']]);
$rank = $stmt->fetchColumn() + 1;

echo json_encode([
    'username' => $user['username'],
    'credits' => $user['credits'],
    'fragments' => $fragments,
    'rank' => $rank,
    'total_players' => $total
]);
?>