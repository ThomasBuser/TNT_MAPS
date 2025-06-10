async function checkAuth() {
  try {
    const response = await fetch("/api/protected.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return false;
    }

    const result = await response.json();

    // Begrüssung + Benutzer-ID
    const protectedContent = document.getElementById("protectedContent");
    protectedContent.innerHTML = `
      <h2>Willkommen, ${result.email}!</h2>
      <p>Deine Benutzer-ID ist: ${result.user_id}</p>
    `;

    // Orte unten einfügen
    const placesSection = document.getElementById("placesSection");
    if (result.names && result.names.length > 0) {
      placesSection.innerHTML = `<p>Orte: ${result.names.join(", ")}</p>`;
    } else {
      placesSection.innerHTML = `<p>Keine gespeicherten Orte.</p>`;
    }

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

window.addEventListener("load", checkAuth);
