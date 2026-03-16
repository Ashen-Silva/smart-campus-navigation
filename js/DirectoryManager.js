// 4. Directory Search Manager

const API_BASE_URL = 'http://localhost:5000/api';

class DirectoryManager {
    constructor() {
        this.searchInput = document.getElementById('place-search');
        this.resultsList = document.getElementById('search-results-list');
        
        this.campusLocations = [
            { name: "Steel Building", type: "Academic Block" },
            { name: "Civil Engineering Complex", type: "Academic Block" },
            { name: "Main Library", type: "Facility" },
            { name: "Computer Science & Engineering Dept", type: "Department" },
            { name: "Hardware Lab (Basement)", type: "Laboratory" },
            { name: "Canteen", type: "Cafeteria" }
        ];

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.filterLocations(e.target.value));
            this.renderResults(this.campusLocations);
        }
    }

    filterLocations(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.campusLocations.filter(place => 
            place.name.toLowerCase().includes(term)
        );
        this.renderResults(filtered);
    }

    renderResults(locationsToRender) {
        if (!this.resultsList) return;
        this.resultsList.innerHTML = ''; 
        
        if (locationsToRender.length === 0) {
            this.resultsList.innerHTML = '<li><span class="text-muted">No locations found.</span></li>';
            return;
        }

        locationsToRender.forEach(place => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="location-name">${place.name}</span>
                <span class="location-type">${place.type}</span>
            `;
            this.resultsList.appendChild(li);
        });
    }
}
