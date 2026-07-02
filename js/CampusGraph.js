// ============================================================
// CampusGraph.js
// Holds all campus nodes and edges
// Runs Dijkstra shortest path algorithm
// ============================================================

class CampusGraph {

    constructor() {
        this.nodes = new Map(); // key: node id, value: CampusNode
        this.edges = [];        // array of all CampusEdge objects
    }

    // Add a CampusNode to the graph
    addNode(node) {
        this.nodes.set(node.id, node);
    }

    // Add a CampusEdge to the graph
    // Also adds the reverse edge — paths are walkable both ways
    addEdge(edge) {
        this.edges.push(edge);
        
        let reverseCoords = null;
        if (edge.coords) {
            reverseCoords = [...edge.coords].reverse();
        }

        this.edges.push(new CampusEdge(
            edge.to,
            edge.from,
            edge.distance,
            edge.isAccessible,
            reverseCoords
        ));
    }

    // Returns all edges that start from the given nodeId
    getNeighbours(nodeId) {
        return this.edges.filter(e => e.from === nodeId);
    }

    // Dijkstra shortest path algorithm
    // startId       — id of starting CampusNode
    // endId         — id of destination CampusNode
    // accessibleOnly — if true, skips edges where isAccessible = false
    // Returns { path: [ids], totalDistance: metres } or null if no route

    
    dijkstra(startId, endId, accessibleOnly = false) {
        const dist    = new Map(); 
        const prev    = new Map(); 
        const visited = new Set(); 

        this.nodes.forEach((_, id) => dist.set(id, Infinity));

        dist.set(startId, 0);

        const queue = [startId];

        while (queue.length > 0) {

            // Always process the node with the smallest known distance first
            queue.sort((a, b) => dist.get(a) - dist.get(b));
            const curr = queue.shift();

            // Stop early if we reached the destination
            if (curr === endId) break;

            // Skip if already processed
            if (visited.has(curr)) continue;
            visited.add(curr);

            // Check all neighbours of the current node
            for (const edge of this.getNeighbours(curr)) {

                // Skip stairs if accessible only mode is on
                if (accessibleOnly && !edge.isAccessible) continue;

                const newDist = dist.get(curr) + edge.distance;

                // Update if we found a shorter path to this neighbour
                if (newDist < dist.get(edge.to)) {
                    dist.set(edge.to, newDist);
                    prev.set(edge.to, curr);
                    queue.push(edge.to);
                }
            }
        }

        // Reconstruct path by walking backwards through prev map
        const path = [];
        let cur = endId;
        while (cur !== undefined) {
            path.unshift(cur); // add to front
            cur = prev.get(cur);
        }

        // If path does not start at startId, no route was found
        if (path[0] !== startId) return null;

        return {
            path:          path,
            totalDistance: dist.get(endId)
        };
    }
}
