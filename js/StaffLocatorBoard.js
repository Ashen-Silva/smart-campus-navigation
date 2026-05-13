class StaffLocatorBoard {
    constructor() {
        this.listElement = document.getElementById('staff-list');
        // 1. Call the real database fetch function instead of the mock one
        this.fetchRealData(); 
    }

    async fetchRealData() {
        try {
            // Fetch live data from the backend route we just fixed
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch('http://localhost:3000/api/staff', { headers });
            
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

    renderBoard() {
        if (!this.listElement) return;
        this.listElement.innerHTML = ''; 
        
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