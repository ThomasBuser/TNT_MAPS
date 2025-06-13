async function checkAuth() {
  try {
    const response = await fetch("/api/protected.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login";
      return false;
    }

    const result = await response.json();

    // Begrüssung + Benutzer-ID
    const protectedContent = document.getElementById("protectedContent");
    protectedContent.innerHTML = `
      <p>Hallo, ${result.email}</p></h2>
      <!--<p>Deine Benutzer-ID ist: ${result.user_id}</p>-->
    `;

    // Orte unten einfügen & löschen
    const placesSection = document.getElementById("placesSection");
    if (result.names && result.names.length > 0) {
      // Erstelle Buttons für jeden Ort
      const buttonsHtml = result.names.map(place =>
        `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
           <button class="place-button" id="${place.placeid}" data-placeid="${place.placeid}">${place.name}</button>
           <button class="delete-button hidden" data-placeid="${place.placeid}">Löschen</button>
         </div>`
      ).join("");
      
      placesSection.innerHTML = buttonsHtml;

      // Add click event listeners to place buttons to fetch and display coordinates
      document.querySelectorAll('.place-button').forEach(button => {
        button.addEventListener('click', async () => {
          const placeId = button.dataset.placeid;
          try {
            const response = await fetch(`/api/get_coordinates.php?placeid=${placeId}`, {
              credentials: "include"
            });
            if (!response.ok) throw new Error("Failed to fetch coordinates");

            const data = await response.json();
            if (window.drawRouteToDestination && typeof window.drawRouteToDestination === "function") {
              window.drawRouteToDestination(data.lat, data.lon);
            } else {
              console.warn("drawRouteToDestination function is not available.");
            }
          } catch (err) {
            console.error("Fehler beim Abrufen der Koordinaten:", err);
            alert("Fehler beim Abrufen der Koordinaten.");
          }
        });
      });


      // Add global delete trigger for .initial-delete-button
      const globalDeleteTrigger = document.querySelector('.initial-delete-button');
      if (globalDeleteTrigger) {
        globalDeleteTrigger.addEventListener('click', () => {
          document.querySelectorAll('.delete-button').forEach(button => {
            button.classList.remove('hidden');
            button.style.setProperty('display', 'block', 'important');
          });
        });
      }

      // Add delete button event listeners
      document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", async () => {
          const placeId = button.dataset.placeid;
          try {
            const response = await fetch("/api/delete.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ placeid: placeId }),
            });

            if (response.ok) {
              // Remove the place and delete button from the DOM
              const placeButton = document.getElementById(placeId);
              if (placeButton) placeButton.remove();
              button.remove();
            } else {
              console.error("Delete failed");
            }
          } catch (err) {
            console.error("Error deleting place:", err);
          }
        });
      });
    } else {
      placesSection.innerHTML = "";
    }


    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

window.addEventListener("load", checkAuth);
