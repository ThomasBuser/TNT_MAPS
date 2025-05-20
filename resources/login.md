# Authentication

Hier befindet sich Zusatzmaterial zu den Slides mit dem Thema "Authentication".

## Code zur Authentifizierung

### Folie 1) Login Request

login.js

```js
fetch("api/login.php", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ email, password }),
});
```

### Folie 2) Setzen der Session-Cookies

login.php

```php
if ($user && password_verify($password, $user['password'])) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $email;
}
```

### Folie 3a) Zugriff auf geschützte Inhalte (Protected Pages)

protected.php

```php
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit();
}
```

```PHP
// If they are logged in, return user data

echo json_encode([

"status" => "success",
"user_id" => $_SESSION['user_id'],
"email" => $_SESSION['email']

]);
```

### Folie 3b) und der Frontend Teil

protected.js

```JavaScript
async function checkAuth() {
    const response = await fetch("/api/protected.php", {
        credentials: "include" // sorgt dafür, dass Cookies mitgesendet werden
    });

    if (response.status === 401) {
        window.location.href = "/login.html";
        return;
    }

    const result = await response.json();
    document.getElementById("protectedContent").innerHTML = `
        <h2>Willkommen, ${result.email}!</h2>
        <p>Ihre Benutzer-ID: ${result.user_id}</p>
    `;
}

```

### Folie 4) Logout

```php
// logout.php
session_start();
$_SESSION = [];
session_destroy();

exit;
```

### Folie 5) Logout Button

```php
session_start();
$_SESSION = [];
session_destroy();

// Return a success response instead of redirecting
header('Content-Type: application/json');
echo json_encode(["status" => "success"]);
exit;
```
