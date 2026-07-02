class StaffLocatorBoard {
    constructor() {
        this.listElement = document.getElementById('staff-list');
        // 1. Call the real database fetch function instead of the mock one
        this.fetchRealData(); 
        this.setupUpdateForm();
    }

    async fetchRealData() {
        try {
            // Fetch live data from the backend route we just fixed
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch('http://localhost:5000/api/staff', { headers });
            
            if (!response.ok) {
                throw new Error("Failed to fetch staff data");
            }
            
            this.staffData = await response.json();
            
            // 3. Render the board with the live data
            this.renderBoard();
        } catch (error) {
            console.error("Error fetching staff data:", error);
            if (this.listElement) {
                this.listElement.innerHTML = '<p style="color: red;">Error connecting to database. Is the server running?</p>';
            }
        }
    }

    setupUpdateForm() {
        this.updateSection = document.getElementById('staff-update-section');
        this.updateForm = document.getElementById('staff-update-form');
        this.staffSelect = document.getElementById('staff-select');
        this.staffStatus = document.getElementById('staff-status');
        this.staffLocation = document.getElementById('staff-location');
        this.updateMsg = document.getElementById('staff-update-msg');

        if (this.updateForm) {
            this.updateForm.addEventListener('submit', (e) => this.handleUpdateSubmit(e));
        }

        window.addEventListener('appReady', () => {
            if (this.updateSection) {
                if (typeof LoginManager !== 'undefined' && !LoginManager.isGuest()) {
                    this.updateSection.classList.remove('hidden');
                } else {
                    this.updateSection.classList.add('hidden');
                }
            }
        });
    }

    async handleUpdateSubmit(e) {
        e.preventDefault();
        
        const staffId = this.staffSelect.value;
        const status = this.staffStatus.value;
        const location = this.staffLocation.value;

        if (!staffId || !status || !location) {
            this.updateMsg.textContent = "Please fill in all fields.";
            this.updateMsg.style.color = "red";
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/staff/${staffId}/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentStatus: status, location: location })
            });

            const data = await response.json();

            if (response.ok) {
                this.updateMsg.textContent = "Successfully updated details.";
                this.updateMsg.style.color = "green";
                this.updateForm.reset();
                this.fetchRealData(); // Refresh board
            } else {
                this.updateMsg.textContent = data.error || data.message || "Failed to update details.";
                this.updateMsg.style.color = "red";
            }
        } catch (error) {
            console.error("Error updating staff:", error);
            this.updateMsg.textContent = "Network error. Could not update.";
            this.updateMsg.style.color = "red";
        }
    }

    renderBoard() {
        if (!this.listElement) return;
        this.listElement.innerHTML = ''; 

        if (this.staffSelect) {
            this.staffSelect.innerHTML = '<option value="">-- Select Lecturer --</option>';
            const targetLecturers = ["Dr. Chandana Gamage", "Dr. Sandreka Wickramanayake", "Dr. Buddika Karunarathne"];
            this.staffData.forEach(staff => {
                if (targetLecturers.includes(staff.name)) {
                    const option = document.createElement('option');
                    // Use _id if available, otherwise use name as a fallback
                    option.value = staff._id || staff.name; 
                    option.textContent = staff.name;
                    this.staffSelect.appendChild(option);
                }
            });
        }
        
        this.staffData.forEach(staff => {
            // Create initials dynamically from the name (e.g., "Dr. N.S. Dias" -> "ND")
            const cleanName = staff.name.replace(/[^a-zA-Z ]/g, '').trim().split(' ');
            let initials = "U"; // Default
            if (cleanName.length >= 2) {
                initials = (cleanName[0][0] + cleanName[cleanName.length - 1][0]).toUpperCase();
            } else if (cleanName.length === 1) {
                initials = cleanName[0][0].toUpperCase();
            }

            // Set specific CSS classes based on the exact Enums in your MongoDB Schema
            let badgeClass = "";
            if (staff.currentStatus === "InTransit") badgeClass = "status-transit";
            if (staff.currentStatus === "PrivacyMode_DoNotDisturb") badgeClass = "status-privacy";

            // Format the status string nicely with spaces (e.g., "InLecture" -> "In Lecture")
            const displayStatus = staff.currentStatus.replace(/([A-Z])/g, ' $1').trim();
            
            // Make the location text red if Privacy Mode is ON
            const locationStyle = staff.currentStatus === "PrivacyMode_DoNotDisturb" ? 'color: #c00; font-weight: bold;' : '';

            const profileDiv = document.createElement('div');
            profileDiv.className = 'staff-profile';
            
            // Inject the exact database properties (name, department, currentStatus, location)
            profileDiv.innerHTML = `
                <div class="profile-pic">${initials}</div>
                <div class="staff-details">
                    <h4>${staff.name}</h4>
                    <p style="margin-bottom: 8px;">
                        <span class="status-badge ${badgeClass}">${displayStatus}</span> 
                        <strong>Live Location:</strong> <span style="${locationStyle}">${staff.location}</span>
                    </p>
                    <p class="text-muted"><strong>Department:</strong> ${staff.department}</p>
                </div>
            `;
            this.listElement.appendChild(profileDiv);
        });
    }
}