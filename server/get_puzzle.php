<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$core = filter_input(INPUT_GET, 'core', FILTER_SANITIZE_STRING) ?? 'edge';
$timer = $core === 'edge' ? 180 : ($core === 'deep' ? 120 : 60);

$stmt = $pdo->prepare("SELECT * FROM puzzles WHERE core = ? ORDER BY RAND() LIMIT 1");
$stmt->execute([$core]);
$puzzle = $stmt->fetch(PDO::FETCH_ASSOC);

$countermeasure = rand(1, 5) === 1 ? 'reverse_input' : null;

echo json_encode([
    'puzzle' => $puzzle,
    'timer' => $timer,
    'countermeasure' => $countermeasure
]);
?>