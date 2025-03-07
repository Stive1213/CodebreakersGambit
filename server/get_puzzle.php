<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$core = filter_input(INPUT_GET, 'core', FILTER_SANITIZE_STRING) ?? 'edge';
$timer = $core === 'edge' ? 180 : ($core === 'deep' ? 120 : 60);

$stmt = $pdo->prepare("SELECT solved_puzzles FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$solved = explode(',', trim($stmt->fetchColumn(), ','));
$solved = empty($solved[0]) ? [] : $solved;

$stmt = $pdo->prepare("SELECT * FROM puzzles WHERE core = ? AND id NOT IN (" . (empty($solved) ? '0' : implode(',', $solved)) . ") ORDER BY RAND() LIMIT 1");
$stmt->execute([$core]);
$puzzle = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$puzzle) {
    echo json_encode(['message' => 'No new puzzles available in this core']);
    exit;
}

$countermeasure = rand(1, 5) === 1 ? 'reverse_input' : null;

echo json_encode([
    'puzzle' => $puzzle,
    'timer' => $timer,
    'countermeasure' => $countermeasure
]);
?>