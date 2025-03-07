<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM sabotage_log WHERE target_id = ? AND timestamp > NOW() - INTERVAL 5 SECOND");
$stmt->execute([$_SESSION['user_id']]);
$sabotage = $stmt->fetchAll(PDO::FETCH_ASSOC);

$chaos = rand(1, 60) === 1 ? 'double_timers' : null;

echo json_encode(['sabotage' => $sabotage, 'chaos' => $chaos]);
?>