<?php
require_once 'config.php';

$order_id = (int) ($_GET['order_id'] ?? 0);
$user_id = $_COOKIE['user_id'] ?? 1;

$stmt = $pdo->prepare('
    SELECT oi.*, g.title 
    FROM order_items oi 
    JOIN games g ON oi.game_id = g.id 
    WHERE oi.order_id = ? AND oi.order_id IN (SELECT id FROM orders WHERE user_id = ?)
');
$stmt->execute([$order_id, $user_id]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($items);
?>