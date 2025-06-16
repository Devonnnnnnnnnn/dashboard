document.addEventListener("DOMContentLoaded", () => {
  // Handle login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const userOrEmail = document.getElementById("userOrEmail").value;
      const password = document.getElementById("password").value;
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userOrEmail, password })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        document.getElementById("error").textContent = data.error;
      }
    };
  }

  // Handle signup
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        document.getElementById("error").textContent = data.error;
      }
    };
  }
});
