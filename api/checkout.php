<?php
require_once 'config.php';

$user_id = $_COOKIE['user_id'] ?? 1;

$stmt = $pdo->prepare('SELECT c.*, g.price, g.discount_price FROM cart c JOIN games g ON c.game_id = g.id WHERE c.user_id = ?');
$stmt->execute([$user_id]);
$cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($cartItems)) {
    echo json_encode(['success' => false, 'message' => 'Корзина пуста']);
    exit;
}

$subtotal = 0;
foreach ($cartItems as $item) {
    $price = $item['discount_price'] ?? $item['price'];
    $subtotal += $price * $item['quantity'];
}

$orderNumber = 'ORD-' . strtoupper(substr(uniqid(), -8));

$stmt = $pdo->prepare('INSERT INTO orders (user_id, order_number, subtotal, total, status) VALUES (?, ?, ?, ?, "pending")');
$stmt->execute([$user_id, $orderNumber, $subtotal, $subtotal]);
$orderId = $pdo->lastInsertId();

foreach ($cartItems as $item) {
    $price = $item['discount_price'] ?? $item['price'];
    
    $stmtKey = $pdo->prepare('SELECT id, key_code FROM game_keys WHERE game_id = ? AND status = "available" LIMIT 1');
    $stmtKey->execute([$item['game_id']]);
    $key = $stmtKey->fetch();
    
    if (!$key) {
    echo json_encode(['success' => false, 'message' => 'Нет доступных ключей для игры #' . $item['game_id']]);
    exit;
    }
    $gameKey = $key['key_code'];
    
    $stmt = $pdo->prepare('INSERT INTO order_items (order_id, game_id, quantity, price, game_key) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$orderId, $item['game_id'], $item['quantity'], $price, $gameKey]);
    
    if ($key) {
        $stmt = $pdo->prepare('UPDATE game_keys SET status = "sold", order_item_id = ? WHERE id = ?');
        $stmt->execute([$pdo->lastInsertId(), $key['id']]);
    }
}

$stmt = $pdo->prepare('DELETE FROM cart WHERE user_id = ?');
$stmt->execute([$user_id]);

echo json_encode(['success' => true, 'message' => 'Заказ оформлен!', 'order_number' => $orderNumber]);
?>