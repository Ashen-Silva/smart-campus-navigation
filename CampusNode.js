
// ============================================================
// CampusNode.js
// Represents a single building or location on the UoM campus map
// ============================================================

class CampusNode {

    // id      — unique number (0, 1, 2 ...)
    // label   — building name e.g. "Library"
    // lat     — GPS latitude  e.g. 6.7960
    // lng     — GPS longitude e.g. 79.9022
    constructor(id, label, lat, lng) {
        this.id     = id;
        this.label  = label;
        this.lat    = lat;
        this.lng    = lng;

        // Leaflet marker reference — set later when marker is added to map
        this.marker = null;
    }
}