// register.js
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const lastname = document.getElementById("lastname").value.trim();

    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
      alert("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      const response = await fetch("../api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password, lastname }),
      });
      const result = await response.json();
      //console.log(result);

      if (result.status === "success") {
        alert("Registration successful! You can now log in.");
        window.location.href = "../login";
      } else {
        alert(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
