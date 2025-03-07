<?php
require 'db_connect.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$core = filter_input(INPUT_GET, 'core', FILTER_SANITIZE_STRING) ?? 'edge';
$language = filter_input(INPUT_GET, 'language', FILTER_SANITIZE_STRING);
$timer = $core === 'edge' ? 180 : ($core === 'deep' ? 120 : 60);

$stmt = $pdo->prepare("SELECT solved_puzzles FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$solved = array_filter(explode(',', $stmt->fetchColumn()));
$solved = empty($solved) ? [0] : $solved;

$query = "SELECT * FROM puzzles WHERE core = ? AND id NOT IN (" . implode(',', $solved) . ")";
$params = [$core];
if ($language && $language !== 'all') {
    $query .= " AND (language = ? OR language IS NULL)";
    $params[] = $language;
}
$query .= " ORDER BY RAND() LIMIT 1";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$puzzle = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$puzzle) {
    echo json_encode(['message' => 'No new puzzles available in this core/language']);
    exit;
}

$countermeasure = rand(1, 5) === 1 ? 'reverse_input' : null;

echo json_encode([
    'puzzle' => $puzzle,
    'timer' => $timer,
    'countermeasure' => $countermeasure
]);
?>