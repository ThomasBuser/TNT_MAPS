 // Modal functionality
 let modalAutocomplete;

function openAddLocationModal() {
  const modal = document.getElementById('addLocationModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Use fallback approach directly (no navigator.geolocation)
  if (window.locationDetected && window.currentLocation) {
    document.getElementById('locationLon').value = window.currentLocation.lng;
    document.getElementById('locationLat').value = window.currentLocation.lat;
  } else {
    alert("Position nicht gefunden. Wähelen Sie bitte einen Standort manuell aus.");
  }

  // Initialize modal autocomplete after a short delay to ensure the modal is visible
  setTimeout(() => {
    initModalMap();
  }, 100);
}

 function closeAddLocationModal() {
   const modal = document.getElementById('addLocationModal');
   modal.classList.remove('active');
   document.body.style.overflow = ''; // Restore background scrolling
   
   // Clear form
   document.getElementById('addLocationForm').reset();
   document.getElementById('locationLon').value = '';
   document.getElementById('locationLat').value = '';
 }

 function initModalMap() {
   // Initialize autocomplete for location search
   modalAutocomplete = new google.maps.places.Autocomplete(
     document.getElementById('locationSearch'),
     { types: ['establishment'] }
   );

   // If there's a main map, bind the autocomplete to its bounds
   if (typeof map !== 'undefined' && map) {
     modalAutocomplete.bindTo("bounds", map);
   }

   modalAutocomplete.addListener('place_changed', function() {
     const place = modalAutocomplete.getPlace();
     
     if (!place.geometry || !place.geometry.location) {
       alert("Kein Standort gefunden.");
       return;
     }

     // Only update coordinates when user actively selects a place
     document.getElementById('locationLat').value = place.geometry.location.lat();
     document.getElementById('locationLon').value = place.geometry.location.lng();
   });
 }

 // Form submission handler
 document.getElementById('addLocationForm').addEventListener('submit', function(e) {
   e.preventDefault();
   
   const formData = new FormData(this);

   fetch("api/add.php", {
     method: "POST",
     body: formData
   })
   .then(response => {
     if (!response.ok) throw new Error("Server error");
     return response.text();
   })
   .then(result => {
     alert(result);
     closeAddLocationModal();
     sessionStorage.clear();
     localStorage.clear();
     window.location.reload();
   })
   .catch(error => {
     alert("Fehler beim Hinzufügen des Standorts: " + error.message);
   });
 });

 // Close modal when clicking outside of it
 document.getElementById('addLocationModal').addEventListener('click', function(e) {
   if (e.target === this) {
     closeAddLocationModal();
   }
 });

 // Close modal with Escape key
 document.addEventListener('keydown', function(e) {
   if (e.key === 'Escape') {
     const modal = document.getElementById('addLocationModal');
     if (modal.classList.contains('active')) {
       closeAddLocationModal();
     }
   }
 });