
// ============================================================
// CampusEdge.js
// Represents a walking path between two campus buildings
// ============================================================

<<<<<<< HEAD
class CampusEdge {
=======

>>>>>>> main

    // from         — id of the starting CampusNode
    // to           — id of the destination CampusNode
    // distance     — walking distance in metres
    // isAccessible — false if path has stairs (wheelchair inaccessible)
<<<<<<< HEAD
    constructor(from, to, distance, isAccessible) {
        this.from         = from;
        this.to           = to;
        this.distance     = distance;
        this.isAccessible = isAccessible;
=======
   

class CampusEdge {
    // Added 'pathCoordinates' to hold the bends and turns of the physical path
    constructor(from, to, distance, isAccessible, pathCoordinates = null) {
        this.from            = from;
        this.to              = to;
        this.distance        = distance;
        this.isAccessible    = isAccessible;
        this.pathCoordinates = pathCoordinates; 
>>>>>>> main
    }
}