<?php

session_start();

header('Access-Control-Allow-Credentials: true');

require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$login = trim($data['login'] ?? '');
$password = $data['password'] ?? '';

if (!$login || !$password) {
    echo json_encode(['success' => false, 'message' => 'Введите логин и пароль']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, username, password_hash, role FROM users WHERE username = ? OR email = ?');
$stmt->execute([$login, $login]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Неверный логин или пароль']);
    exit;
}



$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role'] = $user['role'];

echo json_encode([
    'success' => true,
    'message' => 'Вход выполнен!',
    'user_id' => $user['id'],
    'username' => $user['username'],
    'role' => $user['role']
]);
?>