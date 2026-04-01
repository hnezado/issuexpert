// Handle login form submit
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  // Prevent page reloading
  e.preventDefault();

  const identifier = document.getElementById("identifier").value;
  const password = document.getElementById("password").value;

  try {
    // Login request to API
    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login error");
      return;
    }

    // Save JWT token for future requests
    localStorage.setItem("auth_token", data.token);

    // Redirect to dashboard
    goTo(ROUTES.dashboard);
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
});
