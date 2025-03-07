<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT dc.*, p.question, p.solution FROM daily_challenges dc JOIN puzzles p ON dc.puzzle_id = p.id WHERE dc.date = ?");
$stmt->execute([$today]);
$challenge = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($challenge ?: ['message' => 'No challenge today']);
?>