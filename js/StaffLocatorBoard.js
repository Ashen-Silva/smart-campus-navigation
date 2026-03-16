
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