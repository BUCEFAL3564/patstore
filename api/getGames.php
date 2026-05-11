<?php
require_once 'config.php';

$stmt = $pdo->query('
    SELECT 
        g.id, g.title, g.description, g.price, g.discount_price, 
        g.rating, g.image, g.platform, g.category
    FROM games g
    WHERE g.is_active = 1
    ORDER BY g.created_at DESC
');

$games = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($games as &$game) {
    $game['id'] = (int) $game['id'];
    $game['price'] = (float) $game['price'];
    $game['discount_price'] = $game['discount_price'] ? (float) $game['discount_price'] : null;
    $game['rating'] = (float) $game['rating'];
}

echo json_encode($games);
?>