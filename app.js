// Backend API URL - Updated to match your server's port 5000!
const API_BASE_URL = "http://localhost:5000/api";

/* ---------------- LOGIN ---------------- */
class LoginManager {
    constructor() {
        this.loginBtn = document.getElementById("login-btn");
        this.passwordInput = document.getElementById("password");
        this.errorMsg = document.getElementById("login-error");

        this.loginBtn.addEventListener("click", () => this.handleLogin());
    }

    handleLogin() {
        if (this.passwordInput.value.trim() === "") {
            this.errorMsg.classList.remove("hidden");
            return;
        }
        document.getElementById("login-view").classList.add("hidden");
        document.getElementById("app-view").classList.remove("hidden");
    }
}

/* ---------------- UI MANAGER ---------------- */
class UIManager {
    constructor() {
        this.contrastBtn = document.getElementById("contrast-toggle");
        this.navLinks = document.querySelectorAll(".nav-links li");
        this.tabs = document.querySelectorAll(".tab-content");

        this.setup();
    }

    setup() {
        this.navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                this.navLinks.forEach(l => l.classList.remove("active"));
                this.tabs.forEach(tab => {
                    tab.classList.add("hidden");
                    tab.classList.remove("active-tab");
                });

                e.target.classList.add("active");
                const id = e.target.dataset.target;
                const section = document.getElementById(id);
                section.classList.remove("hidden");
                section.classList.add("active-tab");
            });
        });

        this.contrastBtn.addEventListener("click", () => {
            document.documentElement.toggleAttribute("data-theme", "high-contrast");
        });
    }
}

/* ---------------- MAP MANAGER ---------------- */
class MapManager {
    constructor() {
        this.mapContainer = document.getElementById("visual-map-placeholder");
        this.loadMap();
    }

    async loadMap() {
        try {
            const res = await fetch(`${API_BASE_URL}/map`);
            const data = await res.json();
            this.renderGraph(data[0]);
            document.getElementById("system-status").innerText = "Backend Connected";
        } catch (err) {
            this.mapContainer.innerHTML = "<p style='color:red'>Backend connection failed</p>";
        }
    }

    renderGraph(graph) {
        let html = "<h3>Campus Connections</h3><ul>";
        graph.edges.forEach(edge => {
            html += `
                <li>
                    ${edge.fromNode} → ${edge.toNode} 
                    (${edge.distance}m) - 
                    Accessible: ${edge.isAccessible ? "Yes" : "No"}
                </li>`;
        });
        html += "</ul>";
        this.mapContainer.innerHTML = html;
    }
}

/* ---------------- DIRECTORY MANAGER ---------------- */
class DirectoryManager {
    constructor() {
        this.searchInput = document.getElementById("place-search");
        this.results = document.getElementById("search-results-list");
        this.locations = [];

        this.loadLocations();

        this.searchInput.addEventListener("input", (e) => this.filter(e.target.value));
    }

    async loadLocations() {
        try {
            const res = await fetch(`${API_BASE_URL}/map`);
            const data = await res.json();
            this.locations = data[0].nodes;
            this.render(this.locations);
        } catch (err) {
            this.results.innerHTML = "<li>Error loading locations</li>";
        }
    }

    filter(term) {
        const t = term.toLowerCase();
        const filtered = this.locations.filter(loc => loc.toLowerCase().includes(t));
        this.render(filtered);
    }

    render(list) {
        this.results.innerHTML = "";
        if (list.length === 0) {
            this.results.innerHTML = "<li>No results</li>";
            return;
        }
        list.forEach(place => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="location-name">${place}</span>`;
            this.results.appendChild(li);
        });
    }
}

/* ---------------- STAFF LOCATOR ---------------- */
class StaffLocator {
    constructor() {
        this.container = document.getElementById("staff-list");
        this.loadStaff();
    }

    async loadStaff() {
        try {
            const res = await fetch(`${API_BASE_URL}/staff`);
            const data = await res.json();
            this.render(data);
        } catch {
            this.container.innerHTML = "<p>No staff API available yet</p>";
        }
    }

    render(staff) {
        this.container.innerHTML = "";
        staff.forEach(person => {
            const div = document.createElement("div");
            div.className = "staff-profile";
            div.innerHTML = `
                <div class="profile-pic">${person.name.charAt(0)}</div>
                <div>
                    <h4>${person.name}</h4>
                    <p>${person.department}</p>
                    <p>Status: ${person.currentStatus}</p>
                    <p>Location: ${person.location}</p>
                </div>
            `;
            this.container.appendChild(div);
        });
    }
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    new LoginManager();
    new UIManager();
    new MapManager();
    new DirectoryManager();
    new StaffLocator();
});