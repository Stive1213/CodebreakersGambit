<?php
require 'db_connect.php';
$stmt = $pdo->query("SELECT date, content FROM news ORDER BY date DESC LIMIT 5");
$news = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($news);
?>