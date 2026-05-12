<?php
require_once 'config.php';
$stmt = $pdo->query('SELECT id, name FROM platforms ORDER BY id');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>