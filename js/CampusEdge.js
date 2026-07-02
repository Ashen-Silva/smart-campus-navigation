// ============================================================
// CampusEdge.js
// Represents a walking path between two campus buildings
// ============================================================

class CampusEdge {
 
    // isAccessible — false if path has stairs (wheelchair inaccessible)
   
    constructor(from, to, distance, isAccessible, coords = null) {
        this.from         = from;
        this.to           = to;
        this.distance     = distance;
        this.isAccessible = isAccessible;
        this.coords       = coords;
    }
}