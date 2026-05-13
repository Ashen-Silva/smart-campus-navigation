// ============================================================
// DirectoryManager.js
// Campus Location Directory
// ============================================================

// Floor numbering:
//  -1  →  Basement
//   0  →  Ground Floor
//   1  →  Floor 1  (and so on)

const CAMPUS_DIRECTORY = [
    {
        nodeId: "1",
        name: "Steel Building - MPB",
        shortName: "Steel",
        type: "Academic Block",
        icon: "🏛️",
        description: "Main academic hub hosting multiple departments and lecture theatres.",
        accessible: true,
        floors: 2,
        rooms: [
            { name: "Lecture Hall",      floor:  0, type: "Lecture Hall" },
            { name: "Smart Class Rooms", floor: -1, type: "Tutorial Room" },
        ]
    },
    {
        nodeId: "9",
        name: "Computer Science and Engineering Department",
        shortName: "CSE",
        type: "Department",
        icon: "💻",
        description: "CSE Department — Sumanadasa Building.",
        accessible: false,
        floors: 3,
        rooms: [
            { name: "GTN Lab",        floor: 2, type: "Study Area",   note: "Final Year Students" },
            { name: "Level 3 Lab",    floor: 2, type: "Computer Lab", note: "200 workstations" },
            { name: "Level 2 Lab",    floor: 3, type: "Computer Lab", note: "200 workstations" },
            { name: "Hardware Lab",   floor: 2, type: "Laboratory",   note: "Electronics & embedded systems" },
            { name: "Networking Lab", floor: 2, type: "Laboratory" },
            { name: "Sysco Lab",      floor: 2, type: "Study Area",   note: "2nd Year Students" },
            { name: "Seminar Hall",   floor: 2, type: "Lecture Hall", note: "Via bridge from 2nd floor" },
        ]
    },
    {
        nodeId: "11",
        name: "ENTC Building",
        shortName: "ENTC",
        type: "Department",
        icon: "⚡",
        description: "Department of Electronic & Telecommunication Engineering.",
        accessible: true,
        floors: 3,
        rooms: [
            { name: "ENTC 1",               floor: 0, type: "Lecture Hall" },
            { name: "Digital Electronic Lab", floor: 2, type: "Laboratory" },
            { name: "Analog Electronic Lab",  floor: 2, type: "Laboratory" },
            { name: "Vision Lab",            floor: 3, type: "Laboratory" },
            { name: "Telecom Lab",           floor: 3, type: "Laboratory" },
        ]
    },
    {
        nodeId: "12",
        name: "Faculty of Information Technology",
        shortName: "FIT",
        type: "Faculty",
        icon: "🖥️",
        description: "Faculty of Information Technology — undergraduate and postgraduate programmes.",
        accessible: true,
        floors: 3,
        rooms: [
            { name: "FIT Office",     floor: 0, type: "Office" },
            { name: "Student Lounge", floor: 0, type: "Common Area" },
            { name: "Computer Lab A", floor: 1, type: "Computer Lab", note: "60 workstations" },
            { name: "Computer Lab B", floor: 2, type: "Computer Lab", note: "60 workstations" },
            { name: "Multimedia Lab", floor: 2, type: "Laboratory" },
            { name: "Seminar Room",   floor: 3, type: "Seminar Room" },
        ]
    },
    {
        nodeId: "13",
        name: "Faculty of Medicine",
        shortName: "Medicine",
        type: "Faculty",
        icon: "🏥",
        description: "Faculty of Medicine offering medical degree programmes.",
        accessible: true,
        floors: 4,
        rooms: [
            { name: "Reception",          floor: 0, type: "Office" },
            { name: "Lecture Hall (Med)", floor: 0, type: "Lecture Hall", note: "Capacity: 200" },
            { name: "Anatomy Lab",        floor: 1, type: "Laboratory" },
            { name: "Physiology Lab",     floor: 1, type: "Laboratory" },
            { name: "Library (Med)",      floor: 2, type: "Library" },
            { name: "Skills Lab",         floor: 2, type: "Laboratory" },
        ]
    },
    {
        nodeId: "6",
        name: "Main Library",
        shortName: "Library",
        type: "Facility",
        icon: "📚",
        description: "University of Moratuwa central library — print, digital and research resources.",
        accessible: true,
        floors: 3,
        rooms: [
            { name: "Issue & Return Counter",    floor: 0, type: "Service Counter" },
            { name: "General Reading Area",      floor: 0, type: "Study Area" },
            { name: "Reference Section",         floor: 1, type: "Study Area" },
            { name: "Digital Resource Centre",   floor: 1, type: "Computer Lab", note: "Library catalog & e-journals" },
            { name: "Postgraduate Reading Area", floor: 2, type: "Study Area",   note: "PG students only" },
            { name: "Archive Room",              floor: 2, type: "Archive" },
        ]
    },
    {
        nodeId: "2",
        name: "Dept. of Material Science",
        shortName: "Materials",
        type: "Department",
        icon: "🔬",
        description: "Department of Materials Science & Engineering.",
        accessible: false,
        floors: 3,
        rooms: [
            { name: "Lecture Room",           floor: 0, type: "Lecture Hall" },
            { name: "Materials Lab 1",        floor: 1, type: "Laboratory" },
            { name: "Materials Lab 2",        floor: 2, type: "Laboratory" },
            { name: "Testing & Analysis Lab", floor: 2, type: "Laboratory", note: "SEM, XRD equipment" },
            { name: "Department Office",      floor: 3, type: "Office" },
        ]
    },
    {
        nodeId: "3",
        name: "Dept. of Mechanical Engineering",
        shortName: "MechEng",
        type: "Department",
        icon: "⚙️",
        description: "Department of Mechanical Engineering — theory, design & manufacturing.",
        accessible: false,
        floors: 3,
        rooms: [
            { name: "Automobile Lab",      floor: 0, type: "Laboratory" },
            { name: "Fluid Mechanics Lab", floor: 1, type: "Laboratory" },
            { name: "Thermodynamics Lab",  floor: 2, type: "Laboratory" },
            { name: "CAD/CAM Lab",         floor: 2, type: "Computer Lab" },
            { name: "Lecture Hall",        floor: 3, type: "Lecture Hall" },
        ]
    },
    
    {
        nodeId: "7",
        name: "Goda Uda Canteen",
        shortName: "Upper Canteen",
        type: "Cafeteria",
        icon: "🍽️",
        description: "Upper campus canteen — meals, short eats and beverages.",
        accessible: true,
        floors: 1,
        rooms: [
            { name: "Dining Area",  floor: 0, type: "Cafeteria" },
            { name: "Staff Canteen", floor: 0, type: "Cafeteria" },
        ]
    },
    
];

// ── Room type → colour mapping ────────────────────────────
const ROOM_TYPE_COLORS = {
    "Lecture Hall":    { bg: "#e8f0fe", text: "#1a56d6", border: "#c3d3f8" },
    "Computer Lab":    { bg: "#e6f4ea", text: "#137333", border: "#b7dfc1" },
    "Laboratory":      { bg: "#fce8e6", text: "#b31412", border: "#f5c2be" },
    "Tutorial Room":   { bg: "#fef7e0", text: "#b06000", border: "#f8e0a0" },
    "Seminar Room":    { bg: "#f3e8fd", text: "#6d28d9", border: "#d8b4fe" },
    "Office":          { bg: "#f1f3f4", text: "#444444", border: "#dadce0" },
    "Staff Room":      { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
    "Cafeteria":       { bg: "#fff8e1", text: "#f57f17", border: "#ffe082" },
    "Study Area":      { bg: "#e3f2fd", text: "#0277bd", border: "#90caf9" },
    "Sports Facility": { bg: "#f9fbe7", text: "#558b2f", border: "#c5e1a5" },
    "Conference Room": { bg: "#ede7f6", text: "#512da8", border: "#b39ddb" },
    "Staircase":       { bg: "#eceff1", text: "#546e7a", border: "#b0bec5" },
    "Service Counter": { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" },
    "Common Area":     { bg: "#fce4ec", text: "#c2185b", border: "#f48fb1" },
    "Archive":         { bg: "#efebe9", text: "#4e342e", border: "#bcaaa4" },
    "Library":         { bg: "#e3f2fd", text: "#01579b", border: "#81d4fa" },
    "Studio":          { bg: "#fff9c4", text: "#f9a825", border: "#fff176" },
    "Gym":             { bg: "#e8f5e9", text: "#1b5e20", border: "#a5d6a7" },
    "Project Room":    { bg: "#ede7f6", text: "#4527a0", border: "#9575cd" },
    "Facility":        { bg: "#f1f3f4", text: "#444444", border: "#dadce0" },
};

function getRoomStyle(type) {
    return ROOM_TYPE_COLORS[type] || ROOM_TYPE_COLORS["Facility"];
}

// ── Helper: floor number → display label ─────────────────
function floorLabel(f) {
    const n = parseInt(f);
    if (n === -1) return "🔽 Basement";
    if (n ===  0) return "Ground Floor";
    return `Floor ${n}`;
}

// ─────────────────────────────────────────────────────────
class DirectoryManager {

    constructor() {
        this.allBuildings     = CAMPUS_DIRECTORY;
        this.filtered         = CAMPUS_DIRECTORY;
        this.activeFilter     = "All";
        this.expandedBuilding = null;
        this.navMarker        = null; // red pin placed by Navigate button

        this._injectStyles();
        this._renderShell();
        this._bindEvents();
        this._renderList(this.allBuildings);
    }

    // ─── CSS ─────────────────────────────────────────────
    _injectStyles() {
        if (document.getElementById("dir-styles")) return;
        const style = document.createElement("style");
        style.id = "dir-styles";
        style.textContent = `
            #directory-panel {
                font-family: 'Segoe UI', system-ui, sans-serif;
                display: flex; flex-direction: column;
                height: 100%; background: #f8f9fa; overflow: hidden;
            }
            .dir-header {
                background: linear-gradient(135deg, #0f2b5c 0%, #1a56d6 100%);
                padding: 18px 20px 14px; color: white; flex-shrink: 0;
            }
            .dir-header h2 { margin: 0 0 4px; font-size: 1.15rem; font-weight: 700; }
            .dir-header p  { margin: 0; font-size: 0.75rem; opacity: 0.75; }

            .dir-search-wrap {
                padding: 14px 16px 10px; background: white;
                border-bottom: 1px solid #e8eaed; flex-shrink: 0;
            }
            .dir-search-box {
                display: flex; align-items: center; gap: 8px;
                background: #f1f3f4; border: 1.5px solid transparent;
                border-radius: 10px; padding: 8px 12px;
                transition: border-color 0.2s, background 0.2s;
            }
            .dir-search-box:focus-within { background: white; border-color: #1a56d6; }
            .dir-search-box svg { flex-shrink: 0; opacity: 0.5; }
            .dir-search-box input {
                border: none; background: transparent; outline: none;
                font-size: 0.875rem; width: 100%; color: #202124;
            }
            .dir-clear-btn {
                background: none; border: none; cursor: pointer;
                padding: 0; opacity: 0.5; font-size: 1rem; color: #555; display: none;
            }
            .dir-clear-btn:hover { opacity: 1; }

            .dir-filters {
                display: flex; gap: 6px; overflow-x: auto;
                padding: 8px 16px; background: white;
                border-bottom: 1px solid #e8eaed; flex-shrink: 0; scrollbar-width: none;
            }
            .dir-filters::-webkit-scrollbar { display: none; }
            .dir-chip {
                flex-shrink: 0; padding: 4px 12px; border-radius: 20px;
                font-size: 0.72rem; font-weight: 600; cursor: pointer;
                border: 1.5px solid #dadce0; background: white; color: #444;
                transition: all 0.15s; white-space: nowrap;
            }
            .dir-chip:hover { border-color: #1a56d6; color: #1a56d6; }
            .dir-chip.active { background: #1a56d6; border-color: #1a56d6; color: white; }

            .dir-count {
                padding: 8px 16px 4px;
                font-size: 0.72rem; color: #80868b; font-weight: 500; flex-shrink: 0;
            }
            .dir-list {
                flex: 1; overflow-y: auto; padding: 6px 12px 16px;
                scrollbar-width: thin; scrollbar-color: #dadce0 transparent;
            }

            .dir-card {
                background: white; border-radius: 12px; margin-bottom: 10px;
                border: 1.5px solid #e8eaed; overflow: hidden;
                transition: box-shadow 0.2s, border-color 0.2s;
            }
            .dir-card:hover { box-shadow: 0 2px 12px rgba(26,86,214,0.10); border-color: #c3d3f8; }
            .dir-card.expanded { border-color: #1a56d6; box-shadow: 0 4px 16px rgba(26,86,214,0.13); }

            .dir-card-header {
                display: flex; align-items: center; gap: 12px;
                padding: 13px 14px; cursor: pointer; user-select: none;
            }
            .dir-card-icon {
                font-size: 1.4rem; width: 38px; height: 38px;
                display: flex; align-items: center; justify-content: center;
                background: #f1f3f4; border-radius: 10px; flex-shrink: 0;
            }
            .dir-card-info { flex: 1; min-width: 0; }
            .dir-card-name {
                font-size: 0.88rem; font-weight: 700; color: #202124;
                margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .dir-card-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
            .dir-type-badge {
                font-size: 0.67rem; font-weight: 600; padding: 2px 7px;
                border-radius: 20px; background: #e8f0fe; color: #1a56d6;
            }
            .dir-floor-info { font-size: 0.68rem; color: #80868b; }
            .dir-accessible-tag {
                font-size: 0.67rem; padding: 2px 6px; border-radius: 20px;
                background: #e6f4ea; color: #137333; font-weight: 600;
            }
            .dir-chevron { transition: transform 0.25s; color: #80868b; flex-shrink: 0; }
            .dir-card.expanded .dir-chevron { transform: rotate(180deg); }

            .dir-card-body {
                display: none; border-top: 1px solid #f1f3f4; padding: 10px 14px 14px;
            }
            .dir-card.expanded .dir-card-body { display: block; }
            .dir-description { font-size: 0.78rem; color: #5f6368; margin: 0 0 12px; line-height: 1.5; }

            .dir-floor-section { margin-bottom: 10px; }
            .dir-floor-label {
                font-size: 0.7rem; font-weight: 700; color: #80868b;
                text-transform: uppercase; letter-spacing: 0.6px; margin: 0 0 6px;
                display: flex; align-items: center; gap: 6px;
            }
            .dir-floor-label::after { content: ''; flex: 1; height: 1px; background: #f1f3f4; }

            .dir-rooms-grid { display: flex; flex-wrap: wrap; gap: 5px; }
            .dir-room-chip {
                display: inline-flex; align-items: center; gap: 4px;
                font-size: 0.72rem; font-weight: 500; padding: 4px 9px;
                border-radius: 8px; border: 1px solid; cursor: default; transition: opacity 0.15s;
            }
            .dir-room-chip:hover { opacity: 0.8; }
            .dir-room-chip .room-note { font-size: 0.64rem; opacity: 0.7; font-style: italic; }

            .dir-nav-btn {
                display: flex; align-items: center; justify-content: center;
                gap: 6px; width: 100%; margin-top: 12px; padding: 9px;
                background: linear-gradient(135deg, #0f2b5c, #1a56d6);
                color: white; border: none; border-radius: 9px;
                font-size: 0.8rem; font-weight: 600; cursor: pointer;
                transition: opacity 0.2s, transform 0.1s;
            }
            .dir-nav-btn:hover  { opacity: 0.9; transform: translateY(-1px); }
            .dir-nav-btn:active { transform: translateY(0); }

            .dir-empty { text-align: center; padding: 40px 20px; color: #80868b; }
            .dir-empty svg { margin-bottom: 10px; opacity: 0.3; }
            .dir-empty p { margin: 0; font-size: 0.85rem; }
            .dir-empty strong { display: block; font-size: 1rem; color: #444; margin-bottom: 4px; }

            .dir-highlight { background: #fef08a; border-radius: 2px; font-weight: 700; }
        `;
        document.head.appendChild(style);
    }

    // ─── Shell ───────────────────────────────────────────
    _renderShell() {
        const panel = document.getElementById("tab-directory");
        if (!panel) return;
        panel.innerHTML = `
            <div id="directory-panel">
                <div class="dir-header">
                    <h2>📍 Campus Directory</h2>
                    <p>Search buildings, labs, classrooms &amp; facilities</p>
                </div>
                <div class="dir-search-wrap">
                    <div class="dir-search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input id="dir-search-input" type="text"
                               placeholder="Search building or room…"
                               autocomplete="off" spellcheck="false"/>
                        <button class="dir-clear-btn" id="dir-clear-btn" aria-label="Clear">✕</button>
                    </div>
                </div>
                <div class="dir-filters" id="dir-filters"></div>
                <div class="dir-count"   id="dir-count"></div>
                <div class="dir-list"    id="dir-building-list"></div>
            </div>
        `;
        this._renderFilterChips();
    }

    _renderFilterChips() {
        const wrap = document.getElementById("dir-filters");
        if (!wrap) return;
        const types = ["All", ...new Set(CAMPUS_DIRECTORY.map(b => b.type))];
        wrap.innerHTML = types.map(t =>
            `<button class="dir-chip ${t === "All" ? "active" : ""}" data-type="${t}">${t}</button>`
        ).join("");
    }

    // ─── Events ──────────────────────────────────────────
    _bindEvents() {
        const input    = document.getElementById("dir-search-input");
        const clearBtn = document.getElementById("dir-clear-btn");

        if (input) {
            input.addEventListener("input", () => {
                clearBtn.style.display = input.value ? "inline" : "none";
                this._applyFilters();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                input.value = "";
                clearBtn.style.display = "none";
                this._applyFilters();
            });
        }

        document.getElementById("dir-filters")?.addEventListener("click", (e) => {
            const chip = e.target.closest(".dir-chip");
            if (!chip) return;
            document.querySelectorAll(".dir-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            this.activeFilter = chip.dataset.type;
            this._applyFilters();
        });

        document.getElementById("dir-building-list")?.addEventListener("click", (e) => {
            const navBtn = e.target.closest(".dir-nav-btn");
            const header = e.target.closest(".dir-card-header");

            if (navBtn) {
                this._handleNavigate(navBtn.dataset.nodeid, navBtn.dataset.name);
                return;
            }
            if (header) {
                const card   = header.closest(".dir-card");
                const nodeId = card.dataset.nodeid;
                const list   = document.getElementById("dir-building-list");

                if (this.expandedBuilding === nodeId) {
                    card.classList.remove("expanded");
                    this.expandedBuilding = null;
                } else {
                    list.querySelectorAll(".dir-card.expanded").forEach(c => c.classList.remove("expanded"));
                    card.classList.add("expanded");
                    this.expandedBuilding = nodeId;
                }
            }
        });
    }

    // ─── Filter logic ────────────────────────────────────
    _applyFilters() {
        const term = (document.getElementById("dir-search-input")?.value || "").trim().toLowerCase();
        const type = this.activeFilter;

        this.filtered = this.allBuildings.filter(b => {
            const matchType = type === "All" || b.type === type;
            const matchTerm = !term
                || b.name.toLowerCase().includes(term)
                || b.shortName.toLowerCase().includes(term)
                || b.description.toLowerCase().includes(term)
                || b.rooms.some(r =>
                    r.name.toLowerCase().includes(term) ||
                    // BUG FIX: guard against missing type field
                    (r.type || "").toLowerCase().includes(term) ||
                    (r.note || "").toLowerCase().includes(term)
                );
            return matchType && matchTerm;
        });

        this._renderList(this.filtered, term);
    }

    // ─── Render list ─────────────────────────────────────
    _renderList(buildings, searchTerm = "") {
        const list    = document.getElementById("dir-building-list");
        const countEl = document.getElementById("dir-count");
        if (!list) return;

        if (countEl) {
            countEl.textContent = buildings.length === 0
                ? "No results"
                : `${buildings.length} location${buildings.length !== 1 ? "s" : ""} found`;
        }

        if (buildings.length === 0) {
            list.innerHTML = `
                <div class="dir-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <strong>No locations found</strong>
                    <p>Try a different search term or filter</p>
                </div>`;
            return;
        }

        list.innerHTML = buildings.map(b => this._cardHTML(b, searchTerm)).join("");

        if (this.expandedBuilding) {
            list.querySelector(`[data-nodeid="${this.expandedBuilding}"]`)?.classList.add("expanded");
        }
    }

    // ─── Card HTML ───────────────────────────────────────
    _cardHTML(building, searchTerm) {

        // Highlight matched text
        const hl = (text) => {
            if (!searchTerm || !text) return text || "";
            const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return text.replace(new RegExp(`(${escaped})`, "gi"), `<mark class="dir-highlight">$1</mark>`);
        };

        // Single room chip
        const chip = (r) => {
            const s = getRoomStyle(r.type);
            const note = r.note ? `<span class="room-note">— ${r.note}</span>` : "";
            return `<span class="dir-room-chip"
                style="background:${s.bg};color:${s.text};border-color:${s.border};"
                title="${r.type || ""}${r.note ? ': ' + r.note : ''}">
                ${hl(r.name)}${note}
            </span>`;
        };

        // ── Floor sections ────────────────────────────────
        let sections = "";

        if (building.outdoor) {
            sections = `
                <div class="dir-floor-section">
                    <div class="dir-floor-label">🌳 Outdoor Facility</div>
                    <div class="dir-rooms-grid">${building.rooms.map(chip).join("")}</div>
                </div>`;
        } else {
            // Group by floor number
            const byFloor = {};
            building.rooms.forEach(r => {
                const f = (r.floor !== undefined) ? r.floor : 0;
                if (!byFloor[f]) byFloor[f] = [];
                byFloor[f].push(r);
            });

            sections = Object.keys(byFloor)
                .map(Number)
                .sort((a, b) => a - b)
                .map(f => `
                    <div class="dir-floor-section">
                        <div class="dir-floor-label">${floorLabel(f)}</div>
                        <div class="dir-rooms-grid">${byFloor[f].map(chip).join("")}</div>
                    </div>`)
                .join("");
        }

        const accessTag = building.accessible
            ? `<span class="dir-accessible-tag">♿ Accessible</span>` : "";

        const metaInfo = building.outdoor
            ? `Outdoor · ${building.rooms.length} spaces`
            : `${building.floors} floor${building.floors > 1 ? "s" : ""} · ${building.rooms.length} spaces`;

        return `
            <div class="dir-card" data-nodeid="${building.nodeId}">
                <div class="dir-card-header">
                    <div class="dir-card-icon">${building.icon}</div>
                    <div class="dir-card-info">
                        <div class="dir-card-name">${hl(building.name)}</div>
                        <div class="dir-card-meta">
                            <span class="dir-type-badge">${building.type}</span>
                            <span class="dir-floor-info">${metaInfo}</span>
                            ${accessTag}
                        </div>
                    </div>
                    <svg class="dir-chevron" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="2.2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
                <div class="dir-card-body">
                    <p class="dir-description">${building.description}</p>
                    ${sections}
                    <button class="dir-nav-btn"
                            data-nodeid="${building.nodeId}"
                            data-name="${building.name}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="white" stroke-width="2.5">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                        </svg>
                        Navigate to ${building.shortName}
                    </button>
                </div>
            </div>`;
    }

    // ─── Navigate handler ────────────────────────────────
    _handleNavigate(nodeId, buildingName) {
        const mapManager = window.campusMap;
        if (!mapManager) {
            console.warn("[Directory] window.campusMap not ready");
            return;
        }

        // Node IDs are strings — never parseInt
        const node = mapManager.graph.nodes.get(nodeId);
        if (!node) {
            console.warn(`[Directory] Node not found for id: "${nodeId}"`);
            return;
        }

        // 1. Pre-fill the To dropdown
        const toSelect = document.getElementById("to-select");
        if (toSelect) toSelect.value = nodeId;

        // 2. Switch to Map tab FIRST so Leaflet can measure the container
        const mapTab = document.querySelector('.nav-links li[data-target="tab-map"]');
        if (mapTab) mapTab.click();

        // 3. After tab is visible, place marker and zoom
        //    200ms gives the tab animation time to complete
        setTimeout(() => {
            mapManager.map.invalidateSize();

            // Remove any previous directory nav marker
            if (this.navMarker) {
                mapManager.map.removeLayer(this.navMarker);
                this.navMarker = null;
            }

            // Red destination marker (reuse MapManager's icon or create one)
            const redIcon = mapManager.redIcon || L.divIcon({
                className: "",
                html: `<div style="
                    width:22px; height:22px; background:#E24B4A;
                    border:3px solid #fff; border-radius:50%;
                    box-shadow:0 2px 8px rgba(226,75,74,0.5);">
                </div>`,
                iconSize:   [22, 22],
                iconAnchor: [11, 11]
            });

            // Drop the marker and open its popup
            this.navMarker = L.marker([node.lat, node.lng], { icon: redIcon })
                .addTo(mapManager.map)
                .bindPopup(`
                    <div style="font-family:sans-serif; min-width:170px; padding:2px 0;">
                        <b style="font-size:13px;">📍 ${node.label}</b>
                        <hr style="margin:6px 0; border:none; border-top:1px solid #eee;">
                        <p style="margin:0 0 6px; font-size:11px; color:#666;">
                            Set as <b>destination (To)</b>
                        </p>
                        <p style="margin:0; font-size:11px; color:#444;">
                            Select your <b>From</b> location<br>in the route planner above.
                        </p>
                    </div>
                `)
                .openPopup();

            // Also set the building's own blue marker to red
            if (node.marker) {
                node.marker.setIcon(mapManager.redIcon || redIcon);
            }

            // Fly map to the building
            mapManager.map.setView([node.lat, node.lng], 19, { animate: true });

        }, 200);

        console.log(`[Directory] Navigate → ${buildingName} (nodeId: "${nodeId}")`);
    }


    // ─── Public helper ───────────────────────────────────
    focusBuilding(nodeId) {
        const building = this.allBuildings.find(b => b.nodeId === String(nodeId));
        if (!building) return;
        const input = document.getElementById("dir-search-input");
        if (input) {
            input.value = building.name;
            document.getElementById("dir-clear-btn").style.display = "inline";
            this._applyFilters();
        }
    }
}
