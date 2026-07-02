// ============================================================
// app.js
// INIT — boots all modules and initializes Singleton instances
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing Smart Campus Navigator...");

    // 1. Initialize logic modules
    window.uiManager = new UIManager();
    window.loginManager = new LoginManager();
    window.directoryManager = new DirectoryManager();
    window.staffLocator = new StaffLocatorBoard();
    
    // 2. Link components (Observer/Dependency Injection)
    // Here we connect the Search to the Map
    if (window.campusMap) {
        window.campusMap.search = new MapSearch(
            window.campusMap.graph,
            window.campusMap.map
        );
    }

    // 3. Dispatch an 'appReady' event so UI components can adjust 
    // to their final state (like role restrictions)
    window.dispatchEvent(new Event('appReady'));

    // 4. Wire up Insights Quick Links and Modals
    setupInsightsAndModals();
    
    console.log("System Ready.");
});

function setupInsightsAndModals() {
    // Shuttle Bus Modal Toggle
    const qlShuttle = document.getElementById("ql-shuttle-modal");
    const shuttleModal = document.getElementById("shuttle-modal");
    const shuttleClose = document.getElementById("shuttle-close-btn");

    if (qlShuttle && shuttleModal && shuttleClose) {
        qlShuttle.addEventListener("click", () => shuttleModal.classList.remove("hidden"));
        shuttleClose.addEventListener("click", () => shuttleModal.classList.add("hidden"));
    }

    // Report Issue Modal Toggle
    const qlReport = document.getElementById("ql-report-modal");
    const reportModal = document.getElementById("report-modal");
    const reportClose = document.getElementById("report-close-btn");
    const reportForm = document.getElementById("report-form");
    const reportSuccess = document.getElementById("report-success");

    if (qlReport && reportModal && reportClose) {
        qlReport.addEventListener("click", () => {
            reportModal.classList.remove("hidden");
            if (reportForm) reportForm.style.display = "block";
            if (reportSuccess) reportSuccess.classList.add("hidden");
        });
        reportClose.addEventListener("click", () => reportModal.classList.add("hidden"));
    }

    // Handle Report Issue Submission
    if (reportForm) {
        reportForm.addEventListener("submit", (e) => {
            e.preventDefault();
            reportForm.style.display = "none";
            if (reportSuccess) reportSuccess.classList.remove("hidden");
            
            // Auto close after 2.5 seconds
            setTimeout(() => {
                if (reportModal) reportModal.classList.add("hidden");
                reportForm.reset();
            }, 2500);
        });
    }

    // Click outside modal to close
    window.addEventListener("click", (e) => {
        if (e.target === shuttleModal) {
            shuttleModal.classList.add("hidden");
        }
        if (e.target === reportModal) {
            reportModal.classList.add("hidden");
        }
    });

    // Quick Link: Campus Directory Tab Switch
    const qlDirectory = document.getElementById("ql-directory-tab");
    if (qlDirectory) {
        qlDirectory.addEventListener("click", () => {
            const navDir = document.getElementById("nav-directory");
            if (navDir) navDir.click();
        });
    }
}