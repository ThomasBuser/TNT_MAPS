

<?php
session_start();
require_once '../system/config.php'; // Ensure this connects to the database as $pdo

// Set response content type to JSON
header('Content-Type: application/json');

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

// Read raw POST data and decode JSON
$data = json_decode(file_get_contents("php://input"), true);
$placeid = $data['placeid'] ?? null;
$userid = $_SESSION['user_id'];

if (!$placeid) {
    http_response_code(400);
    echo json_encode(["error" => "Missing place ID"]);
    exit;
}

try {
    // Prepare and execute the deletion query
    $stmt = $pdo->prepare("DELETE FROM places WHERE placeid = :placeid AND userid = :userid");
    $stmt->execute([
        ':placeid' => $placeid,
        ':userid' => $userid
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Place not found or not owned by user"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error", "details" => $e->getMessage()]);
}