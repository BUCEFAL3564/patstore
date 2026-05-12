<?php
require_once 'config.php';
session_start();

$user_id = $_COOKIE['user_id'] ?? 1;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Получить корзину
    $stmt = $pdo->prepare('
        SELECT c.id AS cart_id, c.quantity, g.id, g.title, g.price, g.discount_price, g.image, p.name AS platform, g.category
        FROM cart c
        JOIN games g ON c.game_id = g.id
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE c.user_id = ?
    ');
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($items as &$item) {
        $item['id'] = (int) $item['id'];
        $item['cart_id'] = (int) $item['cart_id'];
        $item['quantity'] = (int) $item['quantity'];
        $item['price'] = (float) $item['price'];
        $item['discount_price'] = $item['discount_price'] ? (float) $item['discount_price'] : null;
    }
    
    echo json_encode($items);
    
} elseif ($method === 'POST') {
    // Добавить в корзину
    $data = json_decode(file_get_contents('php://input'), true);
    $game_id = (int) ($data['game_id'] ?? 0);
    $quantity = (int) ($data['quantity'] ?? 1);
    
    if (!$game_id) {
        echo json_encode(['success' => false, 'message' => 'Не указан ID игры']);
        exit;
    }
    
    // Проверить, есть ли уже
    $stmt = $pdo->prepare('SELECT id, quantity FROM cart WHERE user_id = ? AND game_id = ?');
    $stmt->execute([$user_id, $game_id]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        $stmt = $pdo->prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?');
        $stmt->execute([$quantity, $existing['id']]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO cart (user_id, game_id, quantity) VALUES (?, ?, ?)');
        $stmt->execute([$user_id, $game_id, $quantity]);
    }
    
    echo json_encode(['success' => true, 'message' => 'Добавлено в корзину']);
    
} elseif ($method === 'PUT') {
    // Обновить количество
    $data = json_decode(file_get_contents('php://input'), true);
    $cart_id = (int) ($data['cart_id'] ?? 0);
    $quantity = (int) ($data['quantity'] ?? 1);
    
    if ($quantity <= 0) {
        $stmt = $pdo->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
        $stmt->execute([$cart_id, $user_id]);
    } else {
        $stmt = $pdo->prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?');
        $stmt->execute([$quantity, $cart_id, $user_id]);
    }
    
    echo json_encode(['success' => true]);
    
} elseif ($method === 'DELETE') {
    // Удалить из корзины
    $cart_id = isset($_GET['cart_id']) ? (int) $_GET['cart_id'] : 0;
    
    $stmt = $pdo->prepare('DELETE FROM cart WHERE id = ? AND user_id = ?');
    $stmt->execute([$cart_id, $user_id]);
    
    echo json_encode(['success' => true]);
}
?>