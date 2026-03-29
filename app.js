
// ============================================================
// app.js
// INIT — boots all classes when the page finishes loading
// All class definitions are in the js/ folder
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // Start login form handler
    new LoginManager();

    // Start tab switching and contrast toggle
    new UIManager();

    // Start search directory (loads buildings from /api/map)
    new DirectoryManager();

    // Start staff locator (loads staff from /api/staff)
    new StaffLocatorBoard();

    // Start Leaflet map with all 21 buildings and pathfinding
    // Stored globally so marker popups can call:
    //   window.campusMap.selectNode(id)
    //   window.campusMap.resetRoute()
    window.campusMap = new MapManager();

    // Attach search bar to the map
    // Passes graph (for building data) and map (for zoom control)
    window.campusMap.search = new MapSearch(
        window.campusMap.graph,
        window.campusMap.map
    );
});