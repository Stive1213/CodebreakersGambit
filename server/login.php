<?php
require 'db_connect.php';
session_start();
header('Content-Type: application/json');

$username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
$password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);

if (isset($_POST['register-btn'])) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(['error' => 'Username already exists']);
        exit;
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    $stmt->execute([$username, $hash]);
    $user_id = $pdo->lastInsertId();
    $_SESSION['user_id'] = $user_id;
    echo json_encode(['success' => true, 'user' => ['username' => $username, 'credits' => 0, 'level' => 1]]);
} else {
    $stmt = $pdo->prepare("SELECT id, password_hash, credits, level FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(['success' => true, 'user' => ['username' => $username, 'credits' => $user['credits'], 'level' => $user['level']]]);
    } else {
        echo json_encode(['error' => 'Invalid credentials']);
    }
}
?>