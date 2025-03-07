<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$puzzle_id = filter_input(INPUT_POST, 'puzzle_id', FILTER_SANITIZE_NUMBER_INT);
$solution = filter_input(INPUT_POST, 'solution', FILTER_SANITIZE_STRING);

$stmt = $pdo->prepare("SELECT solution FROM puzzles WHERE id = ?");
$stmt->execute([$puzzle_id]);
$correct = $stmt->fetchColumn();

if (strtolower($solution) === strtolower($correct)) {
    $credits = rand(10, 50);
    $stmt = $pdo->prepare("UPDATE users SET credits = credits + ? WHERE id = ?");
    $stmt->execute([$credits, $_SESSION['user_id']]);
    
    $fragment = rand(1, 3) === 1 ? $pdo->query("SELECT * FROM fragments ORDER BY RAND() LIMIT 1")->fetch(PDO::FETCH_ASSOC) : null;
    if ($fragment) {
        $stmt = $pdo->prepare("UPDATE users SET fragments_collected = CONCAT(fragments_collected, ',', ?) WHERE id = ?");
        $stmt->execute([$fragment['id'], $_SESSION['user_id']]);
    }
    
    echo json_encode(['success' => true, 'credits' => $credits, 'fragment' => $fragment]);
} else {
    echo json_encode(['success' => false, 'message' => 'Incorrect solution']);
}
?>