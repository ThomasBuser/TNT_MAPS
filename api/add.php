<?php
session_start();
require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $lon = $_POST['lon'] ?? null;
    $lat = $_POST['lat'] ?? null;

    if (!empty($name) && $lon && $lat) {
        $sql = "INSERT INTO places (userid, name, lon, lat) VALUES (:userid, :name, :lon, :lat)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':userid' => $_SESSION['user_id'],
            ':name' => $name,
            ':lon' => $lon,
            ':lat' => $lat
        ]);
        echo "Place added successfully.";
    } else {
        http_response_code(400);
        echo "Missing or invalid data.";
    }
}
?>