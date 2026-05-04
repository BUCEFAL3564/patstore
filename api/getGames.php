<?php
require_once 'config.php';

$stmt = $pdo->query('
    SELECT 
        g.id, g.title, g.description, g.price, g.discount_price, 
        g.rating, g.image, 
        p.name AS platform,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ", ") AS categories
    FROM games g
    LEFT JOIN platforms p ON g.platform_id = p.id
    LEFT JOIN game_categories gc ON g.id = gc.game_id
    LEFT JOIN categories c ON gc.category_id = c.id
    WHERE g.is_active = 1
    GROUP BY g.id
    ORDER BY g.created_at DESC
');

$games = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Преобразуем типы данных
foreach ($games as &$game) {
    $game['id'] = (int) $game['id'];
    $game['price'] = (float) $game['price'];
    $game['discount_price'] = $game['discount_price'] ? (float) $game['discount_price'] : null;
    $game['rating'] = (float) $game['rating'];
}

echo json_encode($games);
?>