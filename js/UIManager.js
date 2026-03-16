// ============================================================
// UIManager.js
// Handles tab switching and the high contrast toggle
// Updated by teammate — fixes SVG icon click inside nav links
// ============================================================

class UIManager {

    constructor() {
        // Get references to all nav links and tab sections
        this.contrastBtn  = document.getElementById('contrast-toggle');
        this.isHighContrast = false;              // tracks current contrast state
        this.navLinks     = document.querySelectorAll('.nav-links li');
        this.tabContents  = document.querySelectorAll('.tab-content');

        this.setupEvents();
    }

    // ── Attach all event listeners ──
    setupEvents() {

        // High contrast toggle button
        if (this.contrastBtn) {
            this.contrastBtn.addEventListener('click', () => this.toggleHighContrast());
        }

        // Tab switching — clicking a nav link shows the matching section
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {

                // Use closest('li') so clicks on SVG icons inside the li still work
                // Without this, clicking the icon returns the SVG element not the li
                const targetLi = e.target.closest('li');
                if (!targetLi) return;

                // Remove active style from all nav links
                this.navLinks.forEach(nav => nav.classList.remove('active'));

                // Hide all tab sections
                this.tabContents.forEach(tab => {
                    tab.classList.add('hidden');
                    tab.classList.remove('active-tab');
                });

                // Mark clicked link as active
                targetLi.classList.add('active');

                // Show the matching tab section using data-target attribute
                const targetID      = targetLi.getAttribute('data-target');
                const targetSection = document.getElementById(targetID);

                if (targetSection) {
                    targetSection.classList.remove('hidden');
                    targetSection.classList.add('active-tab');
                }

                // Fix Leaflet map rendering when switching to the map tab
                // Leaflet cannot calculate tile positions in a hidden div
                // invalidateSize() forces it to recalculate after tab is visible
                if (targetID === 'tab-map' && window.campusMap) {
                    setTimeout(() => window.campusMap.map.invalidateSize(), 100);
                }
            });
        });
    }

    // ── Toggle high contrast mode on/off ──
    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;

        if (this.isHighContrast) {
            // Apply high contrast theme
            document.documentElement.setAttribute('data-theme', 'high-contrast');
        } else {
            // Remove high contrast theme
            document.documentElement.removeAttribute('data-theme');
        }
    }
}