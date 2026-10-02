<?php
require_once 'config.php';

try {
    $stmt = $pdo->query('
        SELECT 
            g.id, g.title, g.description, g.price, g.discount_price, 
            g.rating, g.image, g.category,
            p.name AS platform
        FROM games g
        LEFT JOIN platforms p ON g.platform_id = p.id
        WHERE g.is_active = 1
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка запроса: ' . $e->getMessage()]);
}
