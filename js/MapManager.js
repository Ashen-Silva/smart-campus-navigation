// ============================================================
// MapManager.js (Singleton)
// Manages the Leaflet map, graph logic, and route drawing
// ============================================================

class MapManager {
    constructor() {
        if (MapManager.instance) return MapManager.instance;

        this.graph = new CampusGraph();
        this.selectedNodes = [];
        this.pathLine = null;
        this.accessibleMode = false;
        this.showStairs = true;
        this.stairLines = [];
        this.observers = []; // List of observers (e.g., UIManager)

        this._buildGraph();
        this._initMap();
        this._addMarkers();
        this._addControls();
        this._populateDropdowns();

        MapManager.instance = this;
    }

    // ── Observer Pattern: Subscribe/Notify ──
    subscribe(observer) {
        this.observers.push(observer);
    }

    notify(event, data) {
        this.observers.forEach(obs => {
            if (typeof obs.update === 'function') obs.update(event, data);
        });
    }

    _calcDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const deltaLat = (lat2 - lat1) * Math.PI / 180;
        const deltaLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.floor(R * c);
    }

    _buildGraph() {
        if (!window.campusPlaces || !window.campusPaths) return;
        window.campusPlaces.forEach(p => this.graph.addNode(new CampusNode(p.id.toString(), p.name, p.lat, p.lng)));
        window.campusPaths.forEach(path => {
            const nodeA = this.graph.nodes.get(path[0].toString());
            const nodeB = this.graph.nodes.get(path[1].toString());
            if (nodeA && nodeB) {
                const dist = this._calcDistance(nodeA.lat, nodeA.lng, nodeB.lat, nodeB.lng);
                this.graph.addEdge(new CampusEdge(path[0].toString(), path[1].toString(), dist, true, null));
            }
        });
    }

    _initMap() {
        const uomBounds = L.latLngBounds([6.7920, 79.8970], [6.8010, 79.9060]);
        this.map = L.map("visual-map-placeholder", {
            maxBounds: uomBounds,
            maxBoundsViscosity: 1.0,
            minZoom: 16,
            maxZoom: 19,
        }).setView([6.7963, 79.9020], 17);

        // Standard OpenStreetMap tile layer (Brave Shield friendly)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        // Campus boundary mask (dark color to blend in)
        const worldBounds = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
        const campusHole = [[6.7920, 79.8970], [6.7920, 79.9060], [6.8010, 79.9060], [6.8010, 79.8970]];
        L.polygon([worldBounds, campusHole], { fillColor: "#0b132b", fillOpacity: 0.95, weight: 0, interactive: false }).addTo(this.map);
    }

    _drawAllEdges() {
        this.stairLines = [];
        this.graph.edges.forEach(edge => {
            if (edge.from > edge.to) return;
            const nodeA = this.graph.nodes.get(edge.from);
            const nodeB = this.graph.nodes.get(edge.to);
            const isRoadEdge = edge.from.includes("road_node_") || edge.to.includes("road_node_");
            
            const line = L.polyline(edge.coords || [[nodeA.lat, nodeA.lng], [nodeB.lat, nodeB.lng]], {
                color: edge.isAccessible ? "#1D9E75" : "#FF8C00",
                weight: isRoadEdge ? 1 : 2,
                dashArray: edge.isAccessible ? null : "6 4",
                opacity: isRoadEdge ? 0.3 : 0.7
            }).addTo(this.map);

            if (!edge.isAccessible) this.stairLines.push(line);
        });
    }

    _addMarkers() {
        this._drawAllEdges();
        this.blueIcon = L.divIcon({ html: `<div style="width:14px; height:14px; background:#185FA5; border:2px solid #fff; border-radius:50%;"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
        
        this.graph.nodes.forEach(node => {
            if (node.id.includes("road_node_")) return;
            const marker = L.marker([node.lat, node.lng], { icon: this.blueIcon })
                .addTo(this.map)
                .bindPopup(this._buildPopup(node));
            node.marker = marker;
        });
    }

    _buildPopup(node) {
        return `<div style="font-family:sans-serif;"><b>${node.label}</b><br><button onclick="window.campusMap.selectNode(${node.id})">Select</button></div>`;
    }

    _addControls() {
        const AccessibleControl = L.Control.extend({
            onAdd: () => {
                const btn = L.DomUtil.create("button");
                btn.style.padding = "6px 10px";
                btn.style.background = "#131c31";
                btn.style.border = "1px solid rgba(255,255,255,0.08)";
                btn.style.color = "#fff";
                btn.style.borderRadius = "4px";
                btn.style.cursor = "pointer";
                btn.innerHTML = "♿ Accessible: OFF";
                L.DomEvent.on(btn, "click", () => {
                    this.toggleStairs();
                    btn.innerHTML = `♿ Accessible: ${this.accessibleMode ? "ON" : "OFF"}`;
                });
                return btn;
            }
        });
        new AccessibleControl({ position: "topright" }).addTo(this.map);
    }

    _populateDropdowns() {
        const fromSelect = document.getElementById("from-select");
        const toSelect = document.getElementById("to-select");
        if (!fromSelect || !toSelect) return;
        
        [...this.graph.nodes.values()].filter(n => !n.id.includes("road_node_")).sort((a,b) => a.label.localeCompare(b.label)).forEach(n => {
            fromSelect.add(new Option(n.label, n.id));
            toSelect.add(new Option(n.label, n.id));
        });
    }

    selectNode(nodeId) {
        const fromSelect = document.getElementById("from-select");
        const toSelect = document.getElementById("to-select");
        if (!fromSelect || !toSelect) return;

        const val = nodeId.toString();
        if (!fromSelect.value) {
            fromSelect.value = val;
        } else {
            toSelect.value = val;
        }
        this.calculateAndDrawRoute();
    }

    calculateAndDrawRoute() {
        const fromSelect = document.getElementById("from-select");
        const toSelect = document.getElementById("to-select");
        if (!fromSelect || !toSelect) return;

        const fromId = fromSelect.value;
        const toId = toSelect.value;

        if (!fromId || !toId) {
            this.clearRouteLine();
            return;
        }

        // Run Dijkstra
        const result = this.graph.dijkstra(fromId, toId, this.accessibleMode);

        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }

        const routeInfo = document.getElementById("route-info");

        if (result) {
            const latlngs = result.path.map(id => {
                const node = this.graph.nodes.get(id);
                return [node.lat, node.lng];
            });

            this.routeLine = L.polyline(latlngs, {
                color: "#3a86ff",
                weight: 5,
                opacity: 0.85,
                lineCap: "round",
                lineJoin: "round"
            }).addTo(this.map);

            this.map.fitBounds(this.routeLine.getBounds(), { padding: [50, 50] });

            if (routeInfo) {
                routeInfo.style.display = "block";
                routeInfo.innerHTML = `🏁 <strong>Route Calculated:</strong> Distance is <strong>${result.totalDistance} meters</strong>. ${this.accessibleMode ? "♿ (Wheelchair Accessible Path)" : ""}`;
            }
        } else {
            if (routeInfo) {
                routeInfo.style.display = "block";
                routeInfo.innerHTML = `<span style="color: #ff5555;">❌ No accessible route found between these locations.</span>`;
            }
        }
    }

    clearRouteLine() {
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }
        const routeInfo = document.getElementById("route-info");
        if (routeInfo) {
            routeInfo.style.display = "none";
            routeInfo.innerHTML = "";
        }
    }

    clearRoute() {
        const fromSelect = document.getElementById("from-select");
        const toSelect = document.getElementById("to-select");
        if (fromSelect) fromSelect.value = "";
        if (toSelect) toSelect.value = "";
        this.clearRouteLine();
    }

    toggleStairs() {
        this.accessibleMode = !this.accessibleMode;
        
        // Update the stairs toggle button UI
        const btn = document.getElementById("stair-toggle-btn");
        if (btn) {
            btn.innerHTML = this.accessibleMode ? "♿ Stairs: OFF" : "▶ Stairs: ON";
            if (this.accessibleMode) {
                btn.style.background = "rgba(0, 245, 212, 0.1)";
                btn.style.borderColor = "#00F5D4";
                btn.style.color = "#00F5D4";
            } else {
                btn.style.background = "rgba(255, 193, 7, 0.08)";
                btn.style.borderColor = "#ffc107";
                btn.style.color = "#ffc107";
            }
        }

        this.calculateAndDrawRoute();
    }

    static getInstance() {
        if (!MapManager.instance) MapManager.instance = new MapManager();
        return MapManager.instance;
    }
}

const mapManager = new MapManager();
window.campusMap = mapManager;

// Global bindings for inline event handlers in index.html
window.updateRoute = () => window.campusMap.calculateAndDrawRoute();
window.clearRoute = () => window.campusMap.clearRoute();
window.toggleStairs = () => window.campusMap.toggleStairs();