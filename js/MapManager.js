// ============================================================
// MapManager.js
// Manages the Leaflet map, building markers, and route drawing
// Features:
//   1. White/blank area outside UoM campus boundary
//   2. From / To dropdowns populate from building list
//   3. Stair toggle — show or hide stair edges on map
// ============================================================

class MapManager {

    constructor() {
        this.graph          = new CampusGraph(); // holds all nodes and edges
        this.selectedNodes  = [];                // [startNode, endNode]
        this.pathLine       = null;              // current route polyline
        this.accessibleMode = false;             // accessible route toggle
        this.showStairs     = true;              // stair edges visible by default
        this.stairLines     = [];                // stores stair polyline references

        // Build in order — graph first, then map, then markers
        this._buildGraph();
        this._initMap();
        this._addMarkers();
        this._addControls();
        this._populateDropdowns(); // fill From / To selects with building names
    }

    _calcDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        
        // TA FIX: Replaced Greek letters (φ, Δ) with standard English variable names
        const lat1Rad = lat1 * Math.PI/180;
        const lat2Rad = lat2 * Math.PI/180;
        const deltaLat = (lat2-lat1) * Math.PI/180;
        const deltaLon = (lon2-lon1) * Math.PI/180;
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.floor(R * c);
    }

    // ── Build graph with all UoM campus buildings and paths ──
    _buildGraph() {
        if (!window.campusPlaces || !window.campusPaths) {
            console.error("Campus maps data missing");
            return;
        }

        // Add nodes
        window.campusPlaces.forEach(p => {
            this.graph.addNode(new CampusNode(p.id.toString(), p.name, p.lat, p.lng));
        });

        // Add edges
        window.campusPaths.forEach(path => {
            const fromId = path[0].toString();
            const toId = path[1].toString();
            
            const nodeA = this.graph.nodes.get(fromId);
            const nodeB = this.graph.nodes.get(toId);
            
            if (nodeA && nodeB) {
                const dist = this._calcDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
                this.graph.addEdge(new CampusEdge(fromId, toId, dist, true, null));
            }
        });
    }

    // ── Initialise Leaflet map with campus bounds lock ──
    _initMap() {

        // UoM campus boundary box
        const uomBounds = L.latLngBounds(
            [6.7920, 79.8970],  // south-west corner
            [6.8010, 79.9060]   // north-east corner
        );

        this.map = L.map("visual-map-placeholder", {
            maxBounds:          uomBounds,
            maxBoundsViscosity: 1.0,  // hard lock — cannot pan outside campus
            minZoom: 16,
            maxZoom: 19,
        }).setView([6.7963, 79.9020], 17);

        // Load OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // ── FEATURE 1: White/blank mask outside campus boundary ──
        // Draw a large rectangle covering the whole world, then cut out
        // the UoM campus shape using a hole — everything outside = white
        const worldBounds = [
            [-90, -180], [-90, 180], [90, 180], [90, -180]  // full world
        ];
        const campusHole = [
            [6.7920, 79.8970],  // south-west
            [6.7920, 79.9060],  // south-east
            [6.8010, 79.9060],  // north-east
            [6.8010, 79.8970],  // north-west
        ];

        // Leaflet polygon with a hole — world filled white, campus cut out
        L.polygon([worldBounds, campusHole], {
            color:       "white",   // border colour
            fillColor:   "white",   // fill colour outside campus
            fillOpacity: 1,         // fully opaque — hides map tiles outside
            weight:      0,         // no border line
            interactive: false,     // cannot click on the mask
        }).addTo(this.map);

        document.getElementById("system-status").innerText = "Map loaded — UoM Campus";
    }

    _drawAllEdges() {
        this.stairLines = []; // reset stair line references

        this.graph.edges.forEach(edge => {

            // Each edge stored twice — only draw once
            if (edge.from > edge.to) return;

            const nodeA = this.graph.nodes.get(edge.from);
            const nodeB = this.graph.nodes.get(edge.to);

            const isRoadEdge = edge.from.toString().startsWith("road_node_") || edge.to.toString().startsWith("road_node_");
            const latlngs = edge.coords || [[nodeA.lat, nodeA.lng], [nodeB.lat, nodeB.lng]];

            const line = L.polyline(
                latlngs,
                {
                    // Stair-free = green, stairs = orange dashed
                    color:     edge.isAccessible ? "#1D9E75" : "#FF8C00",
                    weight:    isRoadEdge ? 1 : 2,
                    dashArray: edge.isAccessible ? null : "6 4",
                    opacity:   isRoadEdge ? 0.3 : 0.7
                }
            ).addTo(this.map);

            if (!isRoadEdge) {
                line.bindTooltip(
                    `${nodeA.label} ↔ ${nodeB.label} — ${edge.distance}m` +
                    (!edge.isAccessible ? " ⚠ Stairs" : " ✓ Stair-free"),
                    { sticky: true }
                );
            }

            // Save stair lines separately so we can show/hide them
            if (!edge.isAccessible) {
                this.stairLines.push(line);
            }
        });
    }

    // ── Add a blue dot marker for every building ──
    _addMarkers() {
        this._drawAllEdges();

        // Custom small blue circle icon
        this.blueIcon = L.divIcon({
            className: "",
            html: `<div style="
                width:14px; height:14px; background:#185FA5;
                border:2px solid #fff; border-radius:50%;
                box-shadow:0 1px 4px rgba(0,0,0,0.3);">
            </div>`,
            iconSize:   [14, 14],
            iconAnchor: [7, 7]
        });

        // Green start icon
        this.greenIcon = L.divIcon({
            className: "",
            html: `<div style="
                width:18px; height:18px; background:#1D9E75;
                border:2px solid #fff; border-radius:50%;
                box-shadow:0 1px 4px rgba(0,0,0,0.3);">
            </div>`,
            iconSize:   [18, 18],
            iconAnchor: [9, 9]
        });

        // Red destination icon
        this.redIcon = L.divIcon({
            className: "",
            html: `<div style="
                width:18px; height:18px; background:#E24B4A;
                border:2px solid #fff; border-radius:50%;
                box-shadow:0 1px 4px rgba(0,0,0,0.3);">
            </div>`,
            iconSize:   [18, 18],
            iconAnchor: [9, 9]
        });

        this.graph.nodes.forEach(node => {
            if (node.id.toString().startsWith("road_node_")) return;

            const marker = L.marker([node.lat, node.lng], { icon: this.blueIcon })
                .addTo(this.map)
                .bindPopup(this._buildPopup(node));
            node.marker = marker;
        });
    }

    // ── Build popup HTML for a building marker ──
    _buildPopup(node) {
        return `
            <div style="font-family:sans-serif; min-width:160px;">
                <b style="font-size:13px;">${node.label}</b>
                <hr style="margin:6px 0; border:none; border-top:1px solid #eee;">
                <button onclick="window.campusMap.selectNode(${node.id})"
                    style="width:100%; padding:6px; background:#185FA5; color:#fff;
                           border:none; border-radius:4px; cursor:pointer; font-size:12px;">
                    Select as waypoint
                </button>
            </div>`;
    }

    // ── Add accessible route toggle to top-right of map ──
    _addControls() {
        const AccessibleControl = L.Control.extend({
            onAdd: () => {
                const btn         = L.DomUtil.create("button");
                btn.innerHTML     = "♿ Accessible route: OFF";
                btn.style.cssText = `
                    padding:6px 12px; background:#fff; border:1px solid #aaa;
                    border-radius:4px; cursor:pointer; font-size:12px;
                    font-weight:bold; margin-bottom:4px; display:block;`;
                L.DomEvent.on(btn, "click", () => {
                    this.accessibleMode  = !this.accessibleMode;
                    btn.innerHTML        = `♿ Accessible: ${this.accessibleMode ? "ON" : "OFF"}`;
                    btn.style.background = this.accessibleMode ? "#1D9E75" : "#fff";
                    btn.style.color      = this.accessibleMode ? "#fff"    : "#000";
                });
                return btn;
            }
        });
        new AccessibleControl({ position: "topright" }).addTo(this.map);
    }

    // ── FEATURE 2: Populate From / To dropdowns with all building names ──
    _populateDropdowns() {
        const fromSelect = document.getElementById("from-select");
        const toSelect   = document.getElementById("to-select");
        if (!fromSelect || !toSelect) return;

        // Add one option per building, sorted by name
        const sorted = [...this.graph.nodes.values()]
            .filter(node => !node.id.toString().startsWith("road_node_") && node.label)
            .sort((a, b) => a.label.localeCompare(b.label));

        sorted.forEach(node => {
            // Add to FROM dropdown
            const optFrom  = document.createElement("option");
            optFrom.value  = node.id;
            optFrom.text   = node.label;
            fromSelect.appendChild(optFrom);

            // Add to TO dropdown
            const optTo  = document.createElement("option");
            optTo.value  = node.id;
            optTo.text   = node.label;
            toSelect.appendChild(optTo);
        });
    }

    findRouteFromDropdowns(fromId, toId) {
        const start  = this.graph.nodes.get(fromId.toString());
        const end    = this.graph.nodes.get(toId.toString());
        if (!start || !end || start.id === end.id) return;

        // Run Dijkstra
        const result = this.graph.dijkstra(start.id, end.id, this.accessibleMode);

        // Reset all nodes to blue before highlighting new selection
        this.graph.nodes.forEach(node => {
            if (node.marker) node.marker.setIcon(this.blueIcon);
        });

        // Remove old route line
        if (this.pathLine) {
            this.map.removeLayer(this.pathLine);
            this.pathLine = null;
        }

        // Hide info bar if no route
        const infoBar = document.getElementById("route-info");

        if (!result) {
            infoBar.style.display = "block";
            infoBar.style.background = "#ffe6e6";
            infoBar.style.color      = "#c00";
            infoBar.innerHTML =
                `No ${this.accessibleMode ? "accessible " : ""}route found from
                 <b>${start.label}</b> to <b>${end.label}</b>.`;
            return;
        }

        // Highlight start and end markers
        start.marker.setIcon(this.greenIcon);
        end.marker.setIcon(this.redIcon);

        // Draw route polyline
        const latlngs = [];
        for (let i = 0; i < result.path.length - 1; i++) {
            const currentId = result.path[i];
            const nextId = result.path[i+1];
            
            let validEdges = this.graph.edges.filter(e => e.from === currentId && e.to === nextId);
            if (this.accessibleMode) {
                validEdges = validEdges.filter(e => e.isAccessible);
            }
            const edge = validEdges[0];

            if (edge && edge.coords) {
                if (i === 0) latlngs.push(...edge.coords);
                else latlngs.push(...edge.coords.slice(1));
            } else {
                const n1 = this.graph.nodes.get(currentId);
                const n2 = this.graph.nodes.get(nextId);
                if (i === 0) latlngs.push([n1.lat, n1.lng]);
                latlngs.push([n2.lat, n2.lng]);
            }
        }

        this.pathLine = L.polyline(latlngs, {
            color:   this.accessibleMode ? "#1D9E75" : "#185FA5",
            weight:  5,
            opacity: 0.9
        }).addTo(this.map);

        this.map.fitBounds(this.pathLine.getBounds(), { padding: [40, 40] });

        // Build step list
        const names = result.path
            .map(id => this.graph.nodes.get(id).label)
            .filter(label => label && label.trim() !== "");
            
        const steps = names.map((n, i) =>
            `<span style="color:#888;">${i + 1}.</span> ${n}`
        ).join(" &rarr; ");

        // Show info bar with route summary
        infoBar.style.display    = "block";
        infoBar.style.background = "#e6f0ff";
        infoBar.style.color      = "#0044cc";
        infoBar.innerHTML =
            `<b>Route:</b> ${steps}<br>
             <b>Total distance:</b> ${result.totalDistance}m`;
    }

    // ── Called when user clicks "Select as waypoint" in popup ──
    selectNode(nodeId) {
        const node = this.graph.nodes.get(nodeId.toString());

        if (this.selectedNodes.length === 0) {
            this.selectedNodes.push(node);
            node.marker.setIcon(this.greenIcon);
            node.marker.closePopup();
            node.marker.bindPopup(
                `<b style="color:#EF9F27;">START: ${node.label}</b>
                 <br>Now click your destination.`
            ).openPopup();

        } else if (this.selectedNodes.length === 1 && node.id !== this.selectedNodes[0].id) {
            this.selectedNodes.push(node);
            node.marker.closePopup();
            this._findAndDrawRoute();
        }
    }

    // ── Dijkstra route from marker waypoint selection ──
    _findAndDrawRoute() {
        const [start, end] = this.selectedNodes;
        const result = this.graph.dijkstra(start.id, end.id, this.accessibleMode);

        if (this.pathLine) {
            this.map.removeLayer(this.pathLine);
            this.pathLine = null;
        }

        if (!result) {
            end.marker.bindPopup(
                `<b style="color:#E24B4A;">No route found.</b><br>
                 <button onclick="window.campusMap.resetRoute()"
                    style="margin-top:6px;padding:4px 10px;border:1px solid #aaa;
                           border-radius:4px;cursor:pointer;font-size:12px;">Reset</button>`
            ).openPopup();
            this.selectedNodes = [];
            return;
        }

        // Highlight destination marker
        end.marker.setIcon(this.redIcon);

        const latlngs = [];
        for (let i = 0; i < result.path.length - 1; i++) {
            const currentId = result.path[i];
            const nextId = result.path[i+1];
            
            let validEdges = this.graph.edges.filter(e => e.from === currentId && e.to === nextId);
            if (this.accessibleMode) {
                validEdges = validEdges.filter(e => e.isAccessible);
            }
            const edge = validEdges[0];

            if (edge && edge.coords) {
                if (i === 0) latlngs.push(...edge.coords);
                else latlngs.push(...edge.coords.slice(1));
            } else {
                const n1 = this.graph.nodes.get(currentId);
                const n2 = this.graph.nodes.get(nextId);
                if (i === 0) latlngs.push([n1.lat, n1.lng]);
                latlngs.push([n2.lat, n2.lng]);
            }
        }

        this.pathLine = L.polyline(latlngs, {
            color:   this.accessibleMode ? "#1D9E75" : "#185FA5",
            weight:  5,
            opacity: 0.9
        }).addTo(this.map);

        this.map.fitBounds(this.pathLine.getBounds(), { padding: [40, 40] });

        const names = result.path
            .map(id => this.graph.nodes.get(id).label)
            .filter(label => label && label.trim() !== "");

        const routeSteps = names.map((n, i) =>
            `<span style="color:#888;">${i + 1}.</span> ${n}`
        ).join("<br>");

        end.marker.bindPopup(`
            <div style="font-family:sans-serif;max-width:220px;">
                <b style="font-size:13px;color:#185FA5;">Route found</b><br>
                <div style="margin:6px 0;font-size:12px;line-height:1.8;">${routeSteps}</div>
                <hr style="margin:6px 0;border:none;border-top:1px solid #eee;">
                <b>Total: ${result.totalDistance}m</b><br>
                <button onclick="window.campusMap.resetRoute()"
                    style="margin-top:8px;width:100%;padding:5px;background:#eee;
                           border:none;border-radius:4px;cursor:pointer;font-size:12px;">
                    Clear route
                </button>
            </div>
        `).openPopup();

        this.selectedNodes = [];
    }

    // ── FEATURE 3: Toggle stair edges visible / hidden ──
    toggleStairs() {
        this.showStairs = !this.showStairs;
        const btn = document.getElementById("stair-toggle-btn");

        this.stairLines.forEach(line => {
            if (this.showStairs) {
                // Add stair lines back to the map
                line.addTo(this.map);
            } else {
                // Remove stair lines from the map
                this.map.removeLayer(line);
            }
        });

        // Update button text and colour
        if (this.showStairs) {
            btn.innerHTML         = "&#9654; Stairs: ON";
            btn.style.background  = "#fff3cd";
            btn.style.borderColor = "#ffc107";
            btn.style.color       = "#856404";
        } else {
            btn.innerHTML         = "&#9654; Stairs: OFF";
            btn.style.background  = "#d4edda";
            btn.style.borderColor = "#28a745";
            btn.style.color       = "#155724";
        }
    }

    // ── Clear route and reset all markers ──
    resetRoute() {
        if (this.pathLine) {
            this.map.removeLayer(this.pathLine);
            this.pathLine = null;
        }
        this.selectedNodes = [];

        // Hide route info bar
        const infoBar = document.getElementById("route-info");
        if (infoBar) infoBar.style.display = "none";

        // Reset From / To dropdowns
        const fromSelect = document.getElementById("from-select");
        const toSelect   = document.getElementById("to-select");
        if (fromSelect) fromSelect.value = "";
        if (toSelect)   toSelect.value   = "";

        // Restore all markers to default popup and color
        this.graph.nodes.forEach(node => {
            if (node.marker) {
                node.marker.setIcon(this.blueIcon);
                node.marker.closePopup();
                node.marker.bindPopup(this._buildPopup(node));
            }
        });
    }
}

// ── Global functions called from onclick in index.html ──

// Called when either dropdown changes value
function updateRoute() {
    const fromId = document.getElementById("from-select").value;
    const toId   = document.getElementById("to-select").value;
    if (fromId && toId) {
        window.campusMap.findRouteFromDropdowns(fromId, toId);
    }
}

// Called by the Clear button
function clearRoute() {
    if (window.campusMap) window.campusMap.resetRoute();
}

// Called by the Stairs toggle button
function toggleStairs() {
    if (window.campusMap) window.campusMap.toggleStairs();
}