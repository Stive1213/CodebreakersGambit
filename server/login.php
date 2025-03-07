<?php
require 'db_connect.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_STRING);
    
    if (empty($username) || empty($password)) {
        echo json_encode(['error' => 'Username and password required']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        if (password_verify($password, $user['password_hash'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['success' => true, 'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'credits' => $user['credits']
            ]]);
        } else {
            echo json_encode(['error' => 'Invalid password']);
        }
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        $stmt->execute([$username, $hash]);
        $user_id = $pdo->lastInsertId();
        session_start();
        $_SESSION['user_id'] = $user_id;
        echo json_encode(['success' => true, 'user' => [
            'id' => $user_id,
            'username' => $username,
            'credits' => 0
        ]]);
    }
}
?>