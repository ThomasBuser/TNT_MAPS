<?php
// Start the session to track user login and other data
session_start();

// Include the configuration file which connects to the database
require_once '../system/config.php'; // Ensure this sets up the DB connection as $conn

// Check if the user is logged in by verifying if user_id is in the session
if (!isset($_SESSION['user_id'])) {
    // If not logged in, send a 401 Unauthorized response
    http_response_code(401);

    // Set the response format to JSON
    header('Content-Type: application/json');

    // Send a JSON response indicating the user is not authorized
    echo json_encode(["error" => "Unauthorized"]);

    // Stop further execution of the script
    exit;
}

// Retrieve the user ID from the session
$user_id = $_SESSION['user_id'];

// SQL query to select the names of places belonging to the logged-in user
$sql = "SELECT name FROM places WHERE userid = :user_id";

// Prepare the SQL statement to safely insert the user ID
$stmt = $pdo->prepare($sql);

// Execute the prepared statement with the actual user ID
$stmt->execute([
    ':user_id' => $user_id
]);

// Fetch all results of the query as an associative array (key-value pairs)
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Create an empty array to store the place names
$names = [];

// Loop through the fetched results and add the 'name' value to the names array
foreach ($results as $row) {
    $names[] = $row['name'];
}

// Set the response format to JSON
header('Content-Type: application/json');

// Send a JSON response with success status, email, user ID, and list of place names
echo json_encode([
    "status" => "success",           // Indicates the request was successful
    "email" => $_SESSION['email'],   // Includes the user's email from the session
    "user_id" => $user_id,           // Includes the user's ID from the session
    "names" => $names                // Includes the list of place names for the user
]);
