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
    <style>
        body {
            background-color: white !important;
            color: black !important;
        }

        .overlay {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: transparent;
            padding: 0;
            border-radius: 20px;
            width: 90%;
            max-width: 400px;
            z-index: 1;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .overlay form {
            background-color: #355e3b;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 0 30px rgba(0,0,0,0.4);
            width: 100%;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
        }

        .overlay h2 {
            text-align: center;
            margin-bottom: 1.5rem;
            font-size: 1.8rem;
            font-weight: 700;
            color: white;
            width: 100%;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.07rem;
            width: 320px;
            max-width: 90vw;
        }

        .overlay label {
            font-weight: 700;
            font-size: 1.1rem;
            color: white;
            text-align: left;
        }

        .overlay input[type="text"] {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            border: none;
            font-size: 1.1rem;
            font-weight: 500;
            box-sizing: border-box;
        }

        .overlay button {
            width: 180px;
            max-width: 90vw;
            padding: 1rem;
            background-color: #ffd700;
            color: black;
            font-weight: 700;
            font-size: 1.1rem;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            margin-top: 1rem;
            align-self: center;
        }

        .overlay button:hover {
            background-color: #e6c200;
        }
    </style>
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
                center: { lat: 47.2, lng: 8.8 },
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
