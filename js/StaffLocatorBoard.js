class StaffLocatorBoard {
    constructor() {
        this.listElement = document.getElementById('staff-list');
        this.fetchRealData(); 
        
        // Listen for role changes or appReady to redraw admin controls if role changes
        window.addEventListener('appReady', () => {
            this.fetchRealData();
        });
    }

    async fetchRealData() {
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch('/api/staff', { headers });
            if (!response.ok) {
                throw new Error("Failed to fetch staff data");
            }
            
            this.staffData = await response.json();
            this.renderBoard();
        } catch (error) {
            console.error("Error fetching staff data:", error);
            if (this.listElement) {
                this.listElement.innerHTML = '<p style="color: #ff5555; text-align: center; font-weight: 500;">Error connecting to database. Is the server running?</p>';
            }
        }
    }

    renderBoard() {
        if (!this.listElement) return;
        this.listElement.innerHTML = ''; 

        const isAdmin = window.currentUserRole === 'admin';

        // 1. Render Admin System Reset bar if logged in as Admin
        if (isAdmin) {
            const resetBar = document.createElement('div');
            resetBar.className = 'admin-reset-bar';
            resetBar.innerHTML = `
                <button class="admin-action-btn btn-danger" id="global-reset-btn">
                    🔄 Global System Reset
                </button>
            `;
            this.listElement.appendChild(resetBar);
            
            // Add click listener
            document.getElementById('global-reset-btn').addEventListener('click', () => this.handleSystemReset());
        }
        
        if (this.staffData.length === 0) {
            const empty = document.createElement('p');
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--text-muted)';
            empty.style.padding = '20px 0';
            empty.innerText = 'No staff records available.';
            this.listElement.appendChild(empty);
            return;
        }

        this.staffData.forEach(staff => {
            // Create initials dynamically
            const cleanName = staff.name.replace(/[^a-zA-Z ]/g, '').trim().split(' ');
            let initials = "U";
            if (cleanName.length >= 2) {
                initials = (cleanName[0][0] + cleanName[cleanName.length - 1][0]).toUpperCase();
            } else if (cleanName.length === 1) {
                initials = cleanName[0][0].toUpperCase();
            }

            const isDND = staff.currentStatus === "PrivacyMode_DoNotDisturb";
            let badgeClass = "";
            if (staff.currentStatus === "InTransit") badgeClass = "status-transit";
            if (isDND) badgeClass = "status-privacy";

            const displayStatus = staff.currentStatus.replace(/([A-Z])/g, ' $1').trim();
            const locationStyle = isDND ? 'color: #ff5555; font-weight: bold;' : '';
            
            const profileDiv = document.createElement('div');
            profileDiv.className = 'staff-profile';
            profileDiv.style.flexDirection = 'column';
            profileDiv.style.alignItems = 'stretch';
            
            let adminControlsHTML = '';
            if (isAdmin) {
                adminControlsHTML = `
                    <div class="admin-actions">
                        <button class="admin-action-btn" id="edit-btn-${staff.id}">
                            ✏️ Update Status
                        </button>
                        <button class="admin-action-btn" id="dnd-btn-${staff.id}">
                            ${isDND ? '👁️ Show Location' : '👁️‍🗨️ DND (Privacy Mode)'}
                        </button>
                    </div>
                    
                    <div class="admin-edit-panel hidden" id="edit-panel-${staff.id}">
                        <label>Update Location</label>
                        <div class="admin-edit-row">
                            <input type="text" id="edit-loc-${staff.id}" value="${isDND || staff.location === 'Unknown' ? '' : staff.location}" placeholder="e.g. Room 201, Seminar Hall" style="flex:1;">
                            <select id="edit-status-${staff.id}" style="width:140px; padding:10px; background:#1b2438; border:1px solid var(--border-color); border-radius:8px; color:#fff;">
                                <option value="InOffice" ${staff.currentStatus === 'InOffice' ? 'selected' : ''}>In Office</option>
                                <option value="InLecture" ${staff.currentStatus === 'InLecture' ? 'selected' : ''}>In Lecture</option>
                                <option value="InTransit" ${staff.currentStatus === 'InTransit' ? 'selected' : ''}>In Transit</option>
                                <option value="UnknownStatus" ${staff.currentStatus === 'UnknownStatus' ? 'selected' : ''}>Unknown Status</option>
                            </select>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
                            <button class="admin-action-btn" id="save-edit-${staff.id}" style="border-color:#00F5D4; color:#00F5D4;">Save</button>
                            <button class="admin-action-btn" id="cancel-edit-${staff.id}">Cancel</button>
                        </div>
                    </div>
                `;
            }

            profileDiv.innerHTML = `
                <div style="display:flex; align-items:flex-start; width:100%;">
                    <div class="profile-pic">${initials}</div>
                    <div class="staff-details" style="flex:1;">
                        <h4>${staff.name}</h4>
                        <p style="margin-bottom: 8px;">
                            <span class="status-badge ${badgeClass}">${displayStatus}</span> 
                            <strong>Live Location:</strong> <span style="${locationStyle}">${staff.location}</span>
                        </p>
                        <p class="text-muted" style="font-size:12px;"><strong>Department:</strong> ${staff.department}</p>
                    </div>
                </div>
                ${adminControlsHTML}
            `;
            this.listElement.appendChild(profileDiv);

            // Bind admin events if admin controls are rendered
            if (isAdmin) {
                const editBtn = document.getElementById(`edit-btn-${staff.id}`);
                const dndBtn = document.getElementById(`dnd-btn-${staff.id}`);
                const panel = document.getElementById(`edit-panel-${staff.id}`);
                const cancelBtn = document.getElementById(`cancel-edit-${staff.id}`);
                const saveBtn = document.getElementById(`save-edit-${staff.id}`);

                if (editBtn && panel && cancelBtn && saveBtn) {
                    editBtn.addEventListener('click', () => {
                        panel.classList.toggle('hidden');
                    });
                    cancelBtn.addEventListener('click', () => {
                        panel.classList.add('hidden');
                    });
                    saveBtn.addEventListener('click', () => this.handleUpdateLocation(staff.id));
                }

                if (dndBtn) {
                    dndBtn.addEventListener('click', () => this.handleToggleDND(staff.id, isDND));
                }
            }
        });
    }

    async handleUpdateLocation(staffId) {
        const locationInput = document.getElementById(`edit-loc-${staffId}`);
        const statusSelect = document.getElementById(`edit-status-${staffId}`);
        if (!locationInput || !statusSelect) return;

        const location = locationInput.value.trim();
        const currentStatus = statusSelect.value;

        if (!location) {
            alert("Location cannot be empty");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`/api/staff/${staffId}/location`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({ location, currentStatus })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update location");
            }

            // Success, reload
            this.fetchRealData();
        } catch (error) {
            console.error("Update error:", error);
            alert(`Error: ${error.message}`);
        }
    }

    async handleToggleDND(staffId, isDND) {
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // If DND is currently active -> disable DND, else enable DND
            const endpoint = isDND ? `/api/staff/${staffId}/privacy/disable` : `/api/staff/${staffId}/privacy/enable`;

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: headers
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to toggle DND");
            }

            // Success, reload
            this.fetchRealData();
        } catch (error) {
            console.error("DND toggle error:", error);
            alert(`Error: ${error.message}`);
        }
    }

    async handleSystemReset() {
        if (!confirm("Are you sure you want to reset all staff locations and statuses for the day?")) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('/api/staff/reset', {
                method: 'POST',
                headers: headers
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to perform system reset");
            }

            // Success, reload
            this.fetchRealData();
        } catch (error) {
            console.error("Reset error:", error);
            alert(`Error: ${error.message}`);
        }
    }
}