<?php
require_once 'config.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

// Игра
$stmt = $pdo->prepare('
    SELECT g.*, p.name AS platform
    FROM games g
    LEFT JOIN platforms p ON g.platform_id = p.id
    WHERE g.id = ?
');
$stmt->execute([$id]);
$game = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$game) {
    echo json_encode(['error' => 'Игра не найдена']);
    exit;
}

// Категории
$stmt = $pdo->prepare('
    SELECT c.name FROM game_categories gc
    JOIN categories c ON gc.category_id = c.id
    WHERE gc.game_id = ?
');
$stmt->execute([$id]);
$game['categories'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Характеристики
$stmt = $pdo->prepare('SELECT label, value FROM game_specs WHERE game_id = ?');
$stmt->execute([$id]);
$game['specs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Особенности
$stmt = $pdo->prepare('SELECT text FROM game_highlights WHERE game_id = ? ORDER BY sort_order');
$stmt->execute([$id]);
$game['highlights'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Приводим типы
$game['id'] = (int) $game['id'];
$game['price'] = (float) $game['price'];
$game['discount_price'] = $game['discount_price'] ? (float) $game['discount_price'] : null;
$game['rating'] = (float) $game['rating'];

echo json_encode($game);
?>