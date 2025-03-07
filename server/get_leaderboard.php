<?php
require 'db_connect.php';
$stmt = $pdo->query("SELECT username, credits FROM users ORDER BY credits DESC LIMIT 10");
$leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($leaderboard);
?>