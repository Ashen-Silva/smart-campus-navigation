// 1. Login Manager
class LoginManager {
    constructor() {
        this.loginBtn = document.getElementById('login-btn');
        this.passwordInput = document.getElementById('password');
        this.errorMsg = document.getElementById('login-error');
        
        // Ensure elements exist before adding event listeners
        if(this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLogin());
        }
    }

    handleLogin() {
        if (this.passwordInput.value.trim() === "") {
            this.errorMsg.classList.remove('hidden');
        } else {
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('app-view').classList.remove('hidden');
        }
    }
}

// 2. UI Manager (Tabs and Themes)
class UIManager {
    constructor() {
        this.contrastBtn = document.getElementById('contrast-toggle');
        this.isHighContrast = false;
        this.navLinks = document.querySelectorAll('.nav-links li');
        this.tabContents = document.querySelectorAll('.tab-content');

        this.setupEvents();
    }

    setupEvents() {
        if(this.contrastBtn) {
            this.contrastBtn.addEventListener('click', () => this.toggleHighContrast());
        }

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Find the closest li element (in case they click the SVG icon inside the li)
                const targetLi = e.target.closest('li');
                if (!targetLi) return;

                this.navLinks.forEach(nav => nav.classList.remove('active'));
                this.tabContents.forEach(tab => {
                    tab.classList.add('hidden');
                    tab.classList.remove('active-tab');
                });

                targetLi.classList.add('active');
                const targetID = targetLi.getAttribute('data-target');
                
                const targetSection = document.getElementById(targetID);
                if(targetSection) {
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('active-tab');
                }
            });
        });
    }

    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        if (this.isHighContrast) document.documentElement.setAttribute('data-theme', 'high-contrast');
        else document.documentElement.removeAttribute('data-theme');
    }
}

// 3. Map Graph Manager (Draws the SVG Campus Map instead of showing an error)
class MapGraphManager {
    constructor() {
        this.mapContainer = document.getElementById('visual-map-placeholder');
        if (this.mapContainer) {
            this.renderSVGMap();
        }
    }

    renderSVGMap() {
        // We inject raw SVG code into the container. 
        // This simulates a successful backend map load.
        this.mapContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style="background-color: var(--card-bg); border-radius: 8px;">
                
                <line x1="100" y1="200" x2="250" y2="80" stroke="var(--uom-bright-blue)" stroke-width="5" stroke-dasharray="8,8">
                    <title>Accessible Path</title>
                </line>
                
                <line x1="100" y1="200" x2="250" y2="320" stroke="var(--border-color)" stroke-width="5" />
                
                <line x1="250" y1="80" x2="400" y2="200" stroke="var(--border-color)" stroke-width="5" />
                
                <line x1="250" y1="320" x2="400" y2="200" stroke="red" stroke-width="3">
                    <title>Stairs (Not Accessible)</title>
                </line>

                <line x1="250" y1="80" x2="250" y2="320" stroke="var(--border-color)" stroke-width="5" />

                <circle cx="100" cy="200" r="18" fill="var(--uom-blue)" />
                <text x="65" y="240" fill="var(--text-main)" font-size="14" font-weight="bold">Main Gate</text>

                <circle cx="250" cy="80" r="18" fill="var(--uom-blue)" />
                <text x="210" y="50" fill="var(--text-main)" font-size="14" font-weight="bold">Civil Complex</text>

                <circle cx="250" cy="320" r="18" fill="var(--uom-blue)" />
                <text x="205" y="360" fill="var(--text-main)" font-size="14" font-weight="bold">Steel Building</text>

                <circle cx="400" cy="200" r="18" fill="var(--uom-blue)" />
                <text x="375" y="240" fill="var(--text-main)" font-size="14" font-weight="bold">Library</text>
            </svg>
        `;
        
        // Remove any error styles if they were left over
        this.mapContainer.style.border = "2px dashed var(--uom-bright-blue)";
        this.mapContainer.style.color = "var(--text-main)";
    }
}

// 4. Directory Search Manager
class DirectoryManager {
    constructor() {
        this.searchInput = document.getElementById('place-search');
        this.resultsList = document.getElementById('search-results-list');
        
        this.campusLocations = [
            { name: "Steel Building", type: "Academic Block" },
            { name: "Civil Engineering Complex", type: "Academic Block" },
            { name: "Main Library", type: "Facility" },
            { name: "Computer Science & Engineering Dept", type: "Department" },
            { name: "Hardware Lab (Basement)", type: "Laboratory" },
            { name: "Canteen", type: "Cafeteria" }
        ];

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.filterLocations(e.target.value));
            this.renderResults(this.campusLocations);
        }
    }

    filterLocations(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.campusLocations.filter(place => 
            place.name.toLowerCase().includes(term)
        );
        this.renderResults(filtered);
    }

    renderResults(locationsToRender) {
        if (!this.resultsList) return;
        this.resultsList.innerHTML = ''; 
        
        if (locationsToRender.length === 0) {
            this.resultsList.innerHTML = '<li><span class="text-muted">No locations found.</span></li>';
            return;
        }

        locationsToRender.forEach(place => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="location-name">${place.name}</span>
                <span class="location-type">${place.type}</span>
            `;
            this.resultsList.appendChild(li);
        });
    }
}

// 5. Staff Locator Board
class StaffLocatorBoard {
    constructor() {
        this.listElement = document.getElementById('staff-list');
        this.fetchMockData();
    }

    fetchMockData() {
        // Simulating a successful backend call with mock data
        setTimeout(() => {
            this.staffData = [
                { name: "Dr. L.C.I.K. Dewpura", status: "InLecture", location: "Steel Building", initials: "LD", coverageArea: "Software Engineering Modules" },
                { name: "Prof. N.S. Dias", status: "InOffice", location: "Staff Room", initials: "ND", coverageArea: "Computer Architecture" },
                { name: "Mr. G.A.C.G. Dhanawardhana", status: "Moving", location: "Transit", initials: "GD", coverageArea: "General Support" }
            ];
            this.renderBoard();
        }, 800); 
    }

    renderBoard() {
        if (!this.listElement) return;
        this.listElement.innerHTML = ''; 
        
        this.staffData.forEach(staff => {
            const badgeClass = staff.status === "Moving" ? "status-transit" : "";
            const profileDiv = document.createElement('div');
            profileDiv.className = 'staff-profile';
            
            profileDiv.innerHTML = `
                <div class="profile-pic">${staff.initials}</div>
                <div class="staff-details">
                    <h4>${staff.name}</h4>
                    <p style="margin-bottom: 8px;">
                        <span class="status-badge ${badgeClass}">${staff.status}</span> 
                        <strong>Live Location:</strong> ${staff.location}
                    </p>
                    <p class="text-muted"><strong>Coverage Area:</strong> ${staff.coverageArea}</p>
                </div>
            `;
            this.listElement.appendChild(profileDiv);
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
    new UIManager();
    new MapGraphManager();
    new DirectoryManager();
    new StaffLocatorBoard();
});