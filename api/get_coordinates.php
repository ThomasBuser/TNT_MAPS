<?php
session_start();
require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$placeid = $_GET['placeid'] ?? null;

if (!$placeid) {
    http_response_code(400);
    echo json_encode(["error" => "Missing placeid"]);
    exit;
}

$sql = "SELECT lat, lon FROM places WHERE placeid = :placeid AND userid = :userid";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':placeid' => $placeid,
    ':userid' => $_SESSION['user_id']
]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if ($data) {
    echo json_encode($data);
} else {
    http_response_code(404);
    echo json_encode(["error" => "Place not found"]);
}