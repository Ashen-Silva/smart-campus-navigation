// LoginManager.js
// Handles the login form — checks password and shows the app


class LoginManager {
    constructor() {
        this.loginBtn = document.getElementById("login-btn");
        this.passwordInput = document.getElementById("password");
        this.errorMsg = document.getElementById("login-error");

        // Ensure elements exist before adding event listeners
        if(this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLogin());
        }
    }

    handleLogin() {
        if (this.passwordInput.value.trim() === "") {
            this.errorMsg.classList.remove("hidden");
        }else {
          document.getElementById("login-view").classList.add("hidden");
          document.getElementById("app-view").classList.remove("hidden");
    
        }
    }
}