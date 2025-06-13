document.addEventListener("DOMContentLoaded", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      document.getElementById('lon').value = position.coords.longitude;
      document.getElementById('lat').value = position.coords.latitude;
    });
  }

  document.getElementById("addForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch("../api/add.php", {
      method: "POST",
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error("Server error");
      return response.text();
    })
    .then(result => {
      alert(result);
      window.location.href = "../add/index.html";
    })
    .catch(error => {
      alert("Fehler beim Hinzufügen des Standorts: " + error.message);
    });
  });
});

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.2, lng: 8.8 },
    zoom: 16,
    disableDefaultUI: true
  });

  const input = document.getElementById("pac-input");
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo("bounds", map);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert("Kein Standort gefunden.");
      return;
    }

    // Center map on selected place
    map.setCenter(place.geometry.location);
    map.setZoom(17);

    // Update hidden lat/lon inputs
    document.getElementById('lat').value = place.geometry.location.lat();
    document.getElementById('lon').value = place.geometry.location.lng();
  });
}