// LoginManager.js
// Handles the login form, sign-up form, checks passwords, and shows the app

class LoginManager {
    constructor() {
        // Login elements
        this.loginBtn = document.getElementById("login-btn");
        this.guestBtn = document.getElementById("guest-btn");
        this.usernameInput = document.getElementById("username");
        this.passwordInput = document.getElementById("password");
        this.errorMsg = document.getElementById("login-error");

        // Sign-up elements
        this.signupForm = document.getElementById("signup-form");
        this.signupUsernameInput = document.getElementById("signup-username");
        this.signupPasswordInput = document.getElementById("signup-password");

        // Event Listeners
        if(this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLogin());
        }
        if(this.guestBtn) {
            this.guestBtn.addEventListener('click', () => this.handleGuestLogin());
        }
        if(this.signupForm) {
            this.signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
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

    async handleSignUp(e) {
        e.preventDefault(); // Stop the page from reloading on form submit

        const username = this.signupUsernameInput.value.trim();
        const password = this.signupPasswordInput.value.trim();

        if (username === "" || password === "") {
            alert("Please enter a username and password");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Sign up successful! You are now logged in.");
                
                // Store the token and role just like a normal login
                localStorage.setItem('token', data.token); 
                window.currentUserRole = data.role || 'user';
                
                this.showApp();
            } else {
                alert("Error: " + (data.message || data.error));
            }
        } catch (error) {
            console.error("Sign up request failed:", error);
            alert("Unable to connect to server");
        }
    }

    handleGuestLogin() {
        window.currentUserRole = 'guest';
        localStorage.removeItem('token');
        this.showApp();
    }

    showApp() {
        // Ensure the main login wrapper is hidden, regardless of if they used Login or Sign Up
        document.getElementById("login-view").classList.add("hidden");
        document.getElementById("app-view").classList.remove("hidden");
        
        // Dispatch event so other components know login finished
        window.dispatchEvent(new Event('appReady'));
    }

    // Helper method: Other files (like StaffLocatorBoard) can call LoginManager.isGuest()
    static isGuest() {
        return window.currentUserRole === 'guest';
    }
}