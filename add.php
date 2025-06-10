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
            ':lon' => $_POST['lon'],
            ':lat' => $_POST['lat']
        ]);
        echo "Place added successfully.";
        header('Location: index.html');
        exit;
    } else {
        echo "Name cannot be empty.";
    }
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Neuen Standort hinzufügen</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="overlay">
        <form method="post" action="">
            <h2>Neuen Standort hinzufügen</h2>

            <div class="form-group">
                <label for="name">Name des Ortes:</label>
                <input type="text" id="name" name="name" placeholder="Beispiel: Restaurant Wieder" required>
            </div>

            <div class="form-group">
                <label for="pac-input">Standort:</label>
                <input type="text" id="pac-input" placeholder="z. B. Restaurant">
            </div>

            <input type="hidden" id="lon" name="lon">
            <input type="hidden" id="lat" name="lat">

            <button type="submit">Hinzufügen</button>
        </form>
    </div>

    <div id="map"></div>

    <script>
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                document.getElementById('lon').value = position.coords.longitude;
                document.getElementById('lat').value = position.coords.latitude;
            });
        }

        function initMap() {
            const map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: 47.2, lng: 8.8 }, // Beispielkoordinaten
                zoom: 16,
                disableDefaultUI: true
            });

            const input = document.getElementById("pac-input");
            const autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo("bounds", map);
        }
    </script>
    <script async
        src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap">
    </script>
</body>
</html>
