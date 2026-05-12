<?php
require_once 'config.php';

$rating = isset($_GET['rating']) ? $_GET['rating'] : '';
$min_price = isset($_GET['min_price']) ? (float) $_GET['min_price'] : 0;
$max_price = isset($_GET['max_price']) ? (float) $_GET['max_price'] : 1000;
$platforms = isset($_GET['platforms']) ? $_GET['platforms'] : '';

$sql = 'SELECT g.id, g.title, g.description, g.price, g.discount_price, g.rating, g.image, g.category, p.name AS platform
        FROM games g
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE g.is_active = 1';

if ($rating !== '') {
    $ratings = explode(',', $rating);
    $conditions = [];
    foreach ($ratings as $r) $conditions[] = 'g.rating >= ' . (int) $r;
    $sql .= ' AND (' . implode(' OR ', $conditions) . ')';
}

$sql .= ' AND g.price BETWEEN ' . $min_price . ' AND ' . $max_price;

if ($platforms !== '') {
    $ids = explode(',', $platforms);
    $ids = array_map('intval', $ids);
    $sql .= ' AND g.platform_id IN (' . implode(',', $ids) . ')';
}

$sql .= ' ORDER BY g.created_at DESC';

$stmt = $pdo->query($sql);
$games = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($games as &$game) {
    $game['id'] = (int) $game['id'];
    $game['price'] = (float) $game['price'];
    $game['discount_price'] = $game['discount_price'] ? (float) $game['discount_price'] : null;
    $game['rating'] = (float) $game['rating'];
}

echo json_encode($games);
?>