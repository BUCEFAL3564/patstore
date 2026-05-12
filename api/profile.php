<?php
require_once 'config.php';

$user_id = $_COOKIE['user_id'] ?? 0;

if (!$user_id) {
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

// Данные пользователя
$stmt = $pdo->prepare('SELECT id, username, email, phone, role, created_at FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// История заказов
$stmt = $pdo->prepare('
    SELECT o.id, o.order_number, o.total, o.status, o.created_at,
           COUNT(oi.id) as items_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ? AND o.status != "deleted"
    GROUP BY o.id
    ORDER BY o.created_at DESC
');
$stmt->execute([$user_id]);
$user['orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($user);
?>