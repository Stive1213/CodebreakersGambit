<?php
require 'db_connect.php';
$stmt = $pdo->query("SELECT * FROM achievements");
$achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($achievements);
?>