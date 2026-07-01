// LoginManager.js
// Handles the login form — checks password and shows the app


class LoginManager {
    constructor() {
        this.loginBtn = document.getElementById("login-btn");
        this.guestBtn = document.getElementById("guest-btn");
        this.usernameInput = document.getElementById("username");
        this.passwordInput = document.getElementById("password");
        this.errorMsg = document.getElementById("login-error");

        if(this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLogin());
        }
        if(this.guestBtn) {
            this.guestBtn.addEventListener('click', () => this.handleGuestLogin());
        }
    }

    async handleLogin() {
        this.errorMsg.classList.add("hidden");
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();

        if (username === "" || password === "") {
            this.errorMsg.textContent = "Please enter username and password";
            this.errorMsg.classList.remove("hidden");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.currentUserRole = data.role || 'user';
                this.showApp();
            } else {
                this.errorMsg.textContent = data.message || "Invalid username or password";
                this.errorMsg.classList.remove("hidden");
            }
        } catch (error) {
            console.error("Login request failed:", error);
            this.errorMsg.textContent = "Unable to connect to server";
            this.errorMsg.classList.remove("hidden");
        }
    }

    handleGuestLogin() {
        window.currentUserRole = 'guest';
        localStorage.removeItem('token');
        this.showApp();
    }

    showApp() {
        document.getElementById("login-view").classList.add("hidden");
        document.getElementById("app-view").classList.remove("hidden");
        
        // Dispatch event so other components know login finished
        window.dispatchEvent(new Event('appReady'));
    }
}