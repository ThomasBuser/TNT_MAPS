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

    // Display user data in the protected content div
    const protectedContent = document.getElementById("protectedContent");
    protectedContent.innerHTML = `
      <h2>Welcome, ${result.email}!</h2>
      <p>Your user ID is: ${result.user_id}</p>
      <p>Places: ${result.names}</p>
    `;

    return true;
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/login.html";
    return false;
  }
}

// Check auth when page loads
window.addEventListener("load", checkAuth);