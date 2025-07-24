// TODO: Redo the whole script once account page is ready

import { login, register, checkSession } from "./API.js";
import { showNotification } from "./utils.js";

window.addEventListener("DOMContentLoaded", async () => {
  console.log("[account.js] Loaded account.js file");
  let username = document.getElementById("username");
  let password = document.getElementById("password");

  document
    .getElementById("loginButton")
    .addEventListener("click", login(username, password));
  document
    .getElementById("registerButton")
    .addEventListener("click", register(username, password));

  const sessionToken = localStorage.getItem("sessionToken");
  const rememberedUsername = localStorage.getItem("rememberedUsername");

  if (sessionToken) {
    try {
      const isSessionValid = await checkSession();
      if (isSessionValid) {
        console.log("✅ Session valid, redirecting to dashboard");
        // TODO: Unlock Dashboard
        return;
      } else {
        console.warn("⚠️ Session invalid, clearing token");
        localStorage.removeItem("sessionToken");
      }
    } catch (error) {
      console.error("❌ Error checking session:", error);
      showNotification("Error checking session.", "error");
    }
  }

  // If we get here, session was invalid or missing
  if (rememberedUsername) {
    document.getElementById("username").value = rememberedUsername;
    document.getElementById("rememberMeCheckbox").checked = true;
  }
});
