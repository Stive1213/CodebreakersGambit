<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$puzzle_id = filter_input(INPUT_POST, 'puzzle_id', FILTER_SANITIZE_NUMBER_INT);
$solution = filter_input(INPUT_POST, 'solution', FILTER_SANITIZE_STRING);

$stmt = $pdo->prepare("SELECT solution, core, difficulty FROM puzzles WHERE id = ?");
$stmt->execute([$puzzle_id]);
$puzzle = $stmt->fetch(PDO::FETCH_ASSOC);

if (strtolower($solution) === strtolower($puzzle['solution'])) {
    $credits = $puzzle['difficulty'] * 20;
    $stmt = $pdo->prepare("UPDATE users SET credits = credits + ?, solved_puzzles = CONCAT(solved_puzzles, ',', ?), level = FLOOR(credits / 100) + 1 WHERE id = ?");
    $stmt->execute([$credits, $puzzle_id, $_SESSION['user_id']]);
    
    $fragment = rand(1, 3) === 1 ? $pdo->query("SELECT * FROM fragments ORDER BY RAND() LIMIT 1")->fetch(PDO::FETCH_ASSOC) : null;
    if ($fragment) {
        $stmt = $pdo->prepare("UPDATE users SET fragments_collected = CONCAT(fragments_collected, ',', ?) WHERE id = ?");
        $stmt->execute([$fragment['id'], $_SESSION['user_id']]);
    }
    
    $stmt = $pdo->prepare("SELECT achievements FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $achievements = explode(',', trim($stmt->fetchColumn(), ','));
    if (empty($achievements[0])) $achievements = [];
    
    if (!in_array('1', $achievements)) {
        $stmt = $pdo->prepare("UPDATE users SET achievements = CONCAT(achievements, ',1') WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
    }
    if ($puzzle['core'] === 'core' && !in_array('3', $achievements)) {
        $stmt = $pdo->prepare("UPDATE users SET achievements = CONCAT(achievements, ',3') WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
    }
    
    echo json_encode(['success' => true, 'credits' => $credits, 'fragment' => $fragment]);
} else {
    echo json_encode(['success' => false, 'message' => 'Incorrect solution']);
}
?>