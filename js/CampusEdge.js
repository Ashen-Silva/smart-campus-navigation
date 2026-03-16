
// ============================================================
// CampusEdge.js
// Represents a walking path between two campus buildings
// ============================================================

class CampusEdge {

    // from         — id of the starting CampusNode
    // to           — id of the destination CampusNode
    // distance     — walking distance in metres
    // isAccessible — false if path has stairs (wheelchair inaccessible)
    constructor(from, to, distance, isAccessible) {
        this.from         = from;
        this.to           = to;
        this.distance     = distance;
        this.isAccessible = isAccessible;
    }
}