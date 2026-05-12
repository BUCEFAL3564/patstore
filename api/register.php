<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';
$confirm = $data['confirm'] ?? '';

// Проверки
if (!$username || !$email || !$password || !$confirm) {
    echo json_encode(['success' => false, 'message' => 'Все поля обязательны']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Некорректный email']);
    exit;
}

if ($password !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Пароли не совпадают']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Пароль должен быть не менее 6 символов']);
    exit;
}

// Проверка уникальности
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
$stmt->execute([$username, $email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Пользователь или email уже занят']);
    exit;
}

// Хешируем пароль
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Добавляем пользователя
$stmt = $pdo->prepare('INSERT INTO users (username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, "user")');
$stmt->execute([$username, $email, $phone, $password_hash]);

echo json_encode(['success' => true, 'message' => 'Регистрация успешна!']);
?>