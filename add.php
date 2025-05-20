

<?php
session_start();
require_once 'system/config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';

    if (!empty($name)) {
        $sql = "INSERT INTO places (userid, name, lon, lat) VALUES (:userid, :name, :lon, :lat)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':userid' => $_SESSION['user_id'],
            ':name' => $name,
            ':lon' => 150,
            ':lat' => 150
        ]);
        echo "Place added successfully.";
    } else {
        echo "Name cannot be empty.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add New Place</title>
</head>
<body>
    <h1>Add a New Place</h1>
    <form method="post" action="">
        <label for="name">Place Name:</label>
        <input type="text" id="name" name="name" required>
        <button type="submit">Add Place</button>
    </form>
</body>
</html>