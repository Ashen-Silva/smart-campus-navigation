// ============================================================
// MapManager.js
// Manages the Leaflet map, building markers, and route drawing
// Features:
//   1. White/blank area outside UoM campus boundary
//   2. From / To dropdowns populate from building list
//   3. Stair toggle — show or hide stair edges on map
//   4. Edge Geometry — routes around buildings instead of through them
// Depends on: CampusNode.js, CampusEdge.js, CampusGraph.js
// ============================================================

class MapManager {

    constructor() {
        this.graph          = new CampusGraph(); // holds all nodes and edges
        this.selectedNodes  = [];                // [startNode, endNode]
        this.pathLine       = null;              // current route polyline
        this.accessibleMode = false;             // accessible route toggle
        this.showStairs     = true;              // stair edges visible by default
        this.stairLines     = [];                // stores stair polyline references

        this._buildGraph();
        this._initMap();
        this._addMarkers();
        this._addControls();
        this._populateDropdowns(); 
    }

    // ── Build graph with all UoM campus buildings and paths ──
    _buildGraph() {
        const buildings = [
            { id: 0,  name: "University Grounds",                lat: 6.798289, lng: 79.899509 },
            { id: 1,  name: "Steel Building",                    lat: 6.797302, lng: 79.898760 },
            { id: 2,  name: "Dept. of Material Science",         lat: 6.796462, lng: 79.899675 },
            { id: 3,  name: "Dept. of Mechanical Engineering",   lat: 6.796543, lng: 79.899039 },
            { id: 4,  name: "James George Lecture Hall",         lat: 6.795964, lng: 79.900045 },
            { id: 5,  name: "Registrar Office",                  lat: 6.795360, lng: 79.900539 },
            { id: 6,  name: "Library",                           lat: 6.795375, lng: 79.901022 },
            { id: 7,  name: "Goda Uda Canteen",                  lat: 6.796316, lng: 79.900088 },
            { id: 8,  name: "Goda Yata Canteen",                 lat: 6.796316, lng: 79.900088 },
            { id: 9,  name: "Sumanadasa Building",               lat: 6.796877, lng: 79.900609 },
            { id: 10, name: "Sentra Court",                      lat: 6.796297, lng: 79.900606 },
            { id: 11, name: "ENTC",                              lat: 6.796518, lng: 79.901311 },
            { id: 12, name: "Faculty of Information Technology", lat: 6.796997, lng: 79.901893 },
            { id: 13, name: "Faculty of Medicine",               lat: 6.796734, lng: 79.902534 },
            { id: 14, name: "Kaju Kale",                         lat: 6.797829, lng: 79.903733 },
            { id: 15, name: "Boat Yard",                         lat: 6.798159, lng: 79.903819 },
            { id: 16, name: "Dept. of Civil Engineering",        lat: 6.798462, lng: 79.902897 },
            { id: 17, name: "Dept. of Textile and Clothing",     lat: 6.798148, lng: 79.901327 },
            { id: 18, name: "Lagaan",                            lat: 6.797943, lng: 79.900716 },
            { id: 19, name: "Gym",                               lat: 6.797618, lng: 79.900558 },
            { id: 20, name: "Main Canteen",                      lat: 6.795500, lng: 79.903000 },
        ];

        buildings.forEach(b => {
            this.graph.addNode(new CampusNode(b.id, b.name, b.lat, b.lng));
        });

        // [fromId, toId, distanceMetres, isAccessible, customPathCoordinates]
        const edges = [
            // EXAMPLE: A custom path that bends around corners
            [6,  10, 110, true, [
                [6.795375, 79.901022], // Start at Library
                [6.795800, 79.901022], // Walk north to avoid the wall
                [6.795800, 79.900606], // Turn west
                [6.796297, 79.900606]  // End at Sentra Court
            ]],  
            [6,  5,  80,  true, null ],
            [10, 9,  60,  true, null ], 
            [10, 11, 70,  true, null ],  
            [9,  2,  90,  true, null ],  
            [2,  3,  75,  true, null ],  
            [3,  4,  60,  true, null ],  
            [4,  5,  70,  true, null ],  
            [9,  1,  120, true, null ],  
            [3,  7,  80,  true, null ],  
            [7,  8,  10,  false, null], // STAIRS
            [1,  0,  130, true, null ],  
            [0,  18, 110, true, null ],  
            [18, 19, 50,  true, null ],  
            [19, 9,  85,  true, null ],  
            [19, 17, 80,  true, null ],  
            [17, 16, 100, true, null ],  
            [16, 15, 90,  true, null ],  
            [16, 12, 140, true, null ],  
            [12, 20, 70,  true, null ],  
            [20, 9,  100, true, null ],  
            [12, 11, 65,  true, null ],  
            [12, 13, 120, true, null ],  
            [13, 14, 160, true, null ],  
            [14, 6,  250, true, null ],  
        ];

        edges.forEach(([f, t, d, a, coords]) => {
            this.graph.addEdge(new CampusEdge(f, t, d, a, coords));
        });
    }

    _initMap() {
        const uomBounds = L.latLngBounds([6.7920, 79.8970], [6.8010, 79.9060]);

        this.map = L.map("visual-map-placeholder", {
            maxBounds:          uomBounds,
            maxBoundsViscosity: 1.0,  
            minZoom: 16,
            maxZoom: 19,
        }).setView([6.7963, 79.9020], 17);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        const worldBounds = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
        const campusHole = [
            [6.7920, 79.8970], [6.7920, 79.9060], [6.8010, 79.9060], [6.8010, 79.8970],
        ];

        L.polygon([worldBounds, campusHole], {
            color:       "white",   
            fillColor:   "white",   
            fillOpacity: 1,         
            weight:      0,         
            interactive: false,     
        }).addTo(this.map);

        document.getElementById("system-status").innerText = "Map loaded — UoM Campus";
    }

    // ── Draws all background paths ──
    _drawAllEdges() {
        this.stairLines = []; 

        this.graph.edges.forEach(edge => {
            if (edge.from > edge.to) return; // Only draw each edge once

            const nodeA = this.graph.nodes.get(edge.from);
            const nodeB = this.graph.nodes.get(edge.to);

            // Use custom coordinates if they exist, otherwise straight line
            const lineCoords = edge.pathCoordinates 
                ? edge.pathCoordinates 
                : [[nodeA.lat, nodeA.lng], [nodeB.lat, nodeB.lng]];

            const line = L.polyline(lineCoords, {
                color:     edge.isAccessible ? "#1D9E75" : "#FF8C00",
                weight:    2,
                dashArray: edge.isAccessible ? null : "6 4",
                opacity:   0.7
            }).addTo(this.map)
             .bindTooltip(
                `${nodeA.label} ↔ ${nodeB.label} — ${edge.distance}m` +
                (!edge.isAccessible ? " ⚠ Stairs" : " ✓ Stair-free"),
                { sticky: true }
             );

            if (!edge.isAccessible) {
                this.stairLines.push(line);
            }
        });
    }

    _addMarkers() {
        this._drawAllEdges();

        const blueIcon = L.divIcon({
            className: "",
            html: `<div style="width:14px; height:14px; background:#185FA5; border:2px solid #fff; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize:   [14, 14],
            iconAnchor: [7, 7]
        });

        this.graph.nodes.forEach(node => {
            const marker = L.marker([node.lat, node.lng], { icon: blueIcon })
                .addTo(this.map)
                .bindPopup(this._buildPopup(node));
            node.marker = marker;
        });
    }

    _buildPopup(node) {
        return `
            <div style="font-family:sans-serif; min-width:160px;">
                <b style="font-size:13px;">${node.label}</b>
                <hr style="margin:6px 0; border:none; border-top:1px solid #eee;">
                <button onclick="window.campusMap.selectNode(${node.id})"
                    style="width:100%; padding:6px; background:#185FA5; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:12px;">
                    Select as waypoint
                </button>
            </div>`;
    }

    _addControls() {
        const AccessibleControl = L.Control.extend({
            onAdd: () => {
                const btn         = L.DomUtil.create("button");
                btn.innerHTML     = "♿ Accessible route: OFF";
                btn.style.cssText = `padding:6px 12px; background:#fff; border:1px solid #aaa; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold; margin-bottom:4px; display:block;`;
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

    _populateDropdowns() {
        const fromSelect = document.getElementById("from-select");
        const toSelect   = document.getElementById("to-select");
        if (!fromSelect || !toSelect) return;

        const sorted = [...this.graph.nodes.values()]
            .sort((a, b) => a.label.localeCompare(b.label));

        sorted.forEach(node => {
            const optFrom  = document.createElement("option");
            optFrom.value  = node.id;
            optFrom.text   = node.label;
            fromSelect.appendChild(optFrom);

            const optTo  = document.createElement("option");
            optTo.value  = node.id;
            optTo.text   = node.label;
            toSelect.appendChild(optTo);
        });
    }

    // ── Helper to stitch the exact coordinates of the active route ──
    _buildRouteCoordinates(pathArray) {
        const latlngs = [];
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            const fromId = pathArray[i];
            const toId = pathArray[i+1];
            
            // Find the specific edge object that connects these two nodes
            const edge = this.graph.edges.find(e => e.from === fromId && e.to === toId);
            
            if (edge && edge.pathCoordinates) {
                // If it has a custom curved path, use it!
                // If the edge was drawn backwards, we must reverse the coordinates so the line flows correctly
                let coordsToAdd = edge.from === fromId ? edge.pathCoordinates : [...edge.pathCoordinates].reverse();
                
                if (i === 0) {
                    latlngs.push(...coordsToAdd);
                } else {
                    latlngs.push(...coordsToAdd.slice(1)); // skip the first point to prevent overlap
                }
            } else {
                // Otherwise, just draw a straight line
                const fromNode = this.graph.nodes.get(fromId);
                const toNode = this.graph.nodes.get(toId);
                if (i === 0) latlngs.push([fromNode.lat, fromNode.lng]);
                latlngs.push([toNode.lat, toNode.lng]);
            }
        }
        return latlngs;
    }

    findRouteFromDropdowns(fromId, toId) {
        const start  = this.graph.nodes.get(Number(fromId));
        const end    = this.graph.nodes.get(Number(toId));
        if (!start || !end || start.id === end.id) return;

        const result = this.graph.dijkstra(start.id, end.id, this.accessibleMode);

        if (this.pathLine) {
            this.map.removeLayer(this.pathLine);
            this.pathLine = null;
        }

        const infoBar = document.getElementById("route-info");

        if (!result) {
            infoBar.style.display = "block";
            infoBar.style.background = "#ffe6e6";
            infoBar.style.color      = "#c00";
            infoBar.innerHTML = `No ${this.accessibleMode ? "accessible " : ""}route found from <b>${start.label}</b> to <b>${end.label}</b>.`;
            return;
        }

        // Get the carefully stitched coordinates
        const latlngs = this._buildRouteCoordinates(result.path);

        this.pathLine = L.polyline(latlngs, {
            color:   this.accessibleMode ? "#1D9E75" : "#185FA5",
            weight:  6,
            opacity: 0.9
        }).addTo(this.map);

        this.map.fitBounds(this.pathLine.getBounds(), { padding: [40, 40] });

        const names = result.path.map(id => this.graph.nodes.get(id).label);
        const steps = names.map((n, i) => `<span style="color:#888;">${i + 1}.</span> ${n}`).join(" &rarr; ");

        infoBar.style.display    = "block";
        infoBar.style.background = "#e6f0ff";
        infoBar.style.color      = "#0044cc";
        infoBar.innerHTML = `<b>Route:</b> ${steps}<br><b>Total distance:</b> ${result.totalDistance}m`;
    }

    selectNode(nodeId) {
        const node = this.graph.nodes.get(nodeId);

        if (this.selectedNodes.length === 0) {
            this.selectedNodes.push(node);
            node.marker.closePopup();
            node.marker.bindPopup(`<b style="color:#EF9F27;">START: ${node.label}</b><br>Now click your destination.`).openPopup();
        } else if (this.selectedNodes.length === 1 && node.id !== this.selectedNodes[0].id) {
            this.selectedNodes.push(node);
            node.marker.closePopup();
            this._findAndDrawRoute();
        }
    }

    _findAndDrawRoute() {
        const [start, end] = this.selectedNodes;
        const result = this.graph.dijkstra(start.id, end.id, this.accessibleMode);

        if (this.pathLine) {
            this.map.removeLayer(this.pathLine);
            this.pathLine = null;
        }

        if (!result) {
            end.marker.bindPopup(`<b style="color:#E24B4A;">No route found.</b><br><button onclick="window.campusMap.resetRoute()" style="margin-top:6px;padding:4px 10px;border:1px solid #aaa; border-radius:4px;cursor:pointer;font-size:12px;">Reset</button>`).openPopup();
            this.selectedNodes = [];
            return;
        }

        // Get the carefully stitched coordinates
        const latlngs = this._buildRouteCoordinates(result.path);

        this.pathLine = L.polyline(latlngs, {
            color:   this.accessibleMode ? "#1D9E75" : "#185FA5",
            weight:  6,
            opacity: 0.9
        }).addTo(this.map);

        this.map.fitBounds(this.pathLine.getBounds(), { padding: [40, 40] });

        const names      = result.path.map(id => this.graph.nodes.get(id).label);
        const routeSteps = names.map((n, i) => `<span style="color:#888;">${i + 1}.</span> ${n}`).join("<br>");

        end.marker.bindPopup(`
            <div style="font-family:sans-serif;max-width:220px;">
                <b style="font-size:13px;color:#185FA5;">Route found</b><br>
                <div style="margin:6px 0;font-size:12px;line-height:1.8;">${routeSteps}</div>
                <hr style="margin:6px 0;border:none;border-top:1px solid #eee;">
                <b>Total: ${result.totalDistance}m</b><br>
                <button onclick="window.campusMap.resetRoute()" style="margin-top:8px;width:100%;padding:5px;background:#eee; border:none;border-radius:4px;cursor:pointer;font-size:12px;">Clear route</button>
            </div>
        `).openPopup();

        this.selectedNodes = [];
    }

    toggleStairs() {
        this.showStairs = !this.showStairs;
        const btn = document.getElementById("stair-toggle-btn");

        this.stairLines.forEach(line => {
            if (this.showStairs) line.addTo(this.map);
            else this.map.removeLayer(line);
        });

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

    resetRoute() {
        if (this.pathLine) {
            this.map.removeLayer(this.pathLine);
            this.pathLine = null;
        }
        this.selectedNodes = [];

        const infoBar = document.getElementById("route-info");
        if (infoBar) infoBar.style.display = "none";

        const fromSelect = document.getElementById("from-select");
        const toSelect   = document.getElementById("to-select");
        if (fromSelect) fromSelect.value = "";
        if (toSelect)   toSelect.value   = "";

        this.graph.nodes.forEach(node => {
            node.marker.closePopup();
            node.marker.bindPopup(this._buildPopup(node));
        });
    }
}

function updateRoute() {
    const fromId = document.getElementById("from-select").value;
    const toId   = document.getElementById("to-select").value;
    if (fromId && toId) window.campusMap.findRouteFromDropdowns(fromId, toId);
}

function clearRoute() {
    if (window.campusMap) window.campusMap.resetRoute();
}

function toggleStairs() {
    if (window.campusMap) window.campusMap.toggleStairs();
}