<?php
require_once 'config.php';

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

$stmt = $pdo->prepare('SELECT * FROM games WHERE id = ?');
$stmt->execute([$id]);
$game = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$game) {
    echo json_encode(['error' => 'Игра не найдена']);
    exit;
}

// Характеристики
$stmt = $pdo->prepare('SELECT label, value FROM game_specs WHERE game_id = ? AND label != "Особенность"');
$stmt->execute([$id]);
$game['specs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Особенности (highlights)
$stmt = $pdo->prepare('SELECT value FROM game_specs WHERE game_id = ? AND label = "Особенность"');
$stmt->execute([$id]);
$game['highlights'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

// Картинки для слайдера
$stmt = $pdo->prepare('SELECT image FROM game_images WHERE game_id = ? ORDER BY sort_order');
$stmt->execute([$id]);
$game['images'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
if (empty($game['images'])) {
    $game['images'] = [$game['image']];
}

$game['id'] = (int) $game['id'];
$game['price'] = (float) $game['price'];
$game['discount_price'] = $game['discount_price'] ? (float) $game['discount_price'] : null;
$game['rating'] = (float) $game['rating'];

echo json_encode($game);
?>