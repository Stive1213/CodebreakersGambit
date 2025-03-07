<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$target_id = filter_input(INPUT_POST, 'target_id', FILTER_SANITIZE_NUMBER_INT);
$type = filter_input(INPUT_POST, 'type', FILTER_SANITIZE_STRING);
$cost = ['scramble' => 20, 'fake_hint' => 30, 'netmind_alert' => 50][$type] ?? 0;

$stmt = $pdo->prepare("SELECT credits FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$credits = $stmt->fetchColumn();

if ($credits >= $cost) {
    $stmt = $pdo->prepare("UPDATE users SET credits = credits - ? WHERE id = ?");
    $stmt->execute([$cost, $_SESSION['user_id']]);
    
    $stmt = $pdo->prepare("INSERT INTO sabotage_log (sender_id, target_id, type) VALUES (?, ?, ?)");
    $stmt->execute([$_SESSION['user_id'], $target_id, $type]);
    
    echo json_encode(['success' => true, 'remaining_credits' => $credits - $cost]);
} else {
    echo json_encode(['error' => 'Insufficient credits']);
}
?>