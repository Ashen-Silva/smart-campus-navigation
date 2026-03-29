// ============================================================
// MapSearch.js
// Google Maps style search bar floating over the Leaflet map
// Features: live suggestions, zoom to building, distance badge,
//           locate me (GPS blue pin)
// Depends on: MapManager.js (needs graph and leafletMap)
// ============================================================

class MapSearch {

    // graph      — CampusGraph instance (has all 21 nodes)
    // leafletMap — Leaflet map instance from MapManager
    constructor(graph, leafletMap) {
        this.graph        = graph;
        this.leafletMap   = leafletMap;
        this.input        = document.getElementById("map-search-input");
        this.suggestions  = document.getElementById("map-search-suggestions");
        this.clearBtn     = document.getElementById("map-search-clear");
        this.locateMarker = null; // stores the "you are here" pin

        this._setup();
    }

    // ── Attach all event listeners ──
    _setup() {
        // Fire _onType on every keystroke in the search box
        this.input.addEventListener("input", () => this._onType());

        // Hide suggestions when user clicks anywhere outside the search bar
        document.addEventListener("click", (e) => {
            const container = document.getElementById("map-search-container");
            if (!container.contains(e.target)) {
                this._hideSuggestions();
            }
        });

        // Re-show suggestions if user clicks back into the input
        this.input.addEventListener("focus", () => {
            if (this.input.value.trim()) this._onType();
        });
    }

    // ── Called on every keystroke — filters buildings and updates dropdown ──
    _onType() {
        const term = this.input.value.trim().toLowerCase();

        // Show X button when there is text, hide it when empty
        this.clearBtn.style.display = term.length > 0 ? "inline" : "none";

        // Nothing typed — hide the dropdown
        if (term.length === 0) {
            this._hideSuggestions();
            return;
        }

        // Find all buildings whose name contains the typed text
        const matches = [];
        this.graph.nodes.forEach(node => {
            if (node.label.toLowerCase().includes(term)) {
                matches.push(node);
            }
        });

        this._showSuggestions(matches, term);
    }

    // ── Render the suggestions dropdown list ──
    _showSuggestions(matches, term) {
        this.suggestions.innerHTML = "";

        // No matches found
        if (matches.length === 0) {
            this.suggestions.innerHTML =
                `<li style="color:#999; cursor:default;">
                    No buildings found for "${term}"
                 </li>`;
            this.suggestions.style.display = "block";
            return;
        }

        matches.forEach(node => {
            const li = document.createElement("li");

            // Bold the part of the name that matches what was typed
            const regex       = new RegExp(`(${term})`, "gi");
            const highlighted = node.label.replace(regex, "<b>$1</b>");

            // Calculate straight-line distance from current map centre to building
            const centre   = this.leafletMap.getCenter();
            const dist     = this.leafletMap.distance(
                [centre.lat, centre.lng],
                [node.lat,   node.lng]
            );

            // Show in metres if under 1km, otherwise kilometres
            const distText = dist < 1000
                ? Math.round(dist) + "m"
                : (dist / 1000).toFixed(1) + "km";

            li.innerHTML = `
                <!-- Pin icon -->
                <svg width="14" height="14" viewBox="0 0 24 24"
                     fill="#0044cc" style="flex-shrink:0;">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13
                           s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5
                           c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5
                           2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <!-- Building name with matched letters bolded -->
                <span>${highlighted}</span>
                <!-- Distance from map centre -->
                <span class="suggestion-dist">${distText} away</span>`;

            // Clicking a suggestion zooms the map to that building
            li.addEventListener("click", () => this._selectBuilding(node));

            this.suggestions.appendChild(li);
        });

        this.suggestions.style.display = "block";
    }

    // ── Zoom map to selected building and open its marker popup ──
    _selectBuilding(node) {
        // Fly to the building at close zoom
        this.leafletMap.setView([node.lat, node.lng], 19, { animate: true });

        // Open the building's marker popup
        if (node.marker) node.marker.openPopup();

        // Fill the input with the full building name
        this.input.value = node.label;
        this.clearBtn.style.display = "inline";

        // Close the suggestions dropdown
        this._hideSuggestions();
    }

    // ── Hide the suggestions dropdown ──
    _hideSuggestions() {
        this.suggestions.style.display = "none";
    }

    // ── Clear the search input and hide suggestions ──
    // Called by the X button onclick in index.html
    clear() {
        this.input.value            = "";
        this.clearBtn.style.display = "none";
        this._hideSuggestions();
    }

    // ── Zoom map to user's real GPS location and drop a blue pin ──
    // Called by the locate-me button onclick in index.html
    locateUser() {
        // Check if the browser supports geolocation
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Fly to user's location at close zoom
                this.leafletMap.setView([lat, lng], 18, { animate: true });

                // Remove any previous location marker
                if (this.locateMarker) {
                    this.leafletMap.removeLayer(this.locateMarker);
                }

                // Drop a blue circle marker at user's location
                this.locateMarker = L.circleMarker([lat, lng], {
                    radius:      10,
                    fillColor:   "#0044cc",
                    fillOpacity: 0.85,
                    color:       "white",
                    weight:      3
                })
                .addTo(this.leafletMap)
                .bindPopup("<b>You are here</b>")
                .openPopup();
            },
            () => {
                alert("Could not get your location. Please allow location access.");
            }
        );
    }
}

// ── Global functions called from onclick in index.html ──

// Called by the X (clear) button in the search bar
function clearMapSearch() {
    if (window.campusMap && window.campusMap.search) {
        window.campusMap.search.clear();
    }
}

// Called by the locate-me (crosshair) button in the search bar
function locateMe() {
    if (window.campusMap && window.campusMap.search) {
        window.campusMap.search.locateUser();
    }
}