<?php
// register.php
ini_set('session.cookie_httponly', 1);
// ini_set('session.cookie_secure', 1); // if using HTTPS
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $lastname = trim($_POST['lastname'] ?? '');

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "message" => "Email and password are required"]);
        exit;
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "error", "message" => "Email is already in use"]);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new user
    $insert = $pdo->prepare("INSERT INTO users (email, password, lastname) VALUES (:email, :pass, :lastname)");
    $insert->execute([
        ':email' => $email,
        ':pass'  => $hashedPassword,
        ':lastname' => $lastname
    ]);

    // Get the newly created user's ID
    $newUserId = $pdo->lastInsertId();

    // Automatically log in the user after successful registration
    session_regenerate_id(true);
    $_SESSION['user_id'] = $newUserId;
    $_SESSION['email']   = $email;

    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
?>