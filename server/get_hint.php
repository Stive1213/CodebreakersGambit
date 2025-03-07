<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$puzzle_id = filter_input(INPUT_POST, 'puzzle_id', FILTER_SANITIZE_NUMBER_INT);
$stmt = $pdo->prepare("SELECT credits FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$credits = $stmt->fetchColumn();

if ($credits >= 10) {
    $stmt = $pdo->prepare("UPDATE users SET credits = credits - 10 WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $stmt = $pdo->prepare("SELECT solution FROM puzzles WHERE id = ?");
    $stmt->execute([$puzzle_id]);
    $solution = $stmt->fetchColumn();
    $hint = substr($solution, 0, 1) . '...';
    echo json_encode(['success' => true, 'hint' => $hint, 'remaining_credits' => $credits - 10]);
} else {
    echo json_encode(['error' => 'Not enough credits']);
}
?>