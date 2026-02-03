class TransportMap {
    constructor() {
        this.map = null;
        this.vehicleMarkers = {};
        this.stopMarkers = {};
        this.activeLines = new Set();
        this.currentTheme = document.documentElement.getAttribute('data-theme');
        
        this.initMap();
        this.initControls();
    }
    
    initMap() {
        // Centrum na Kraków
        this.map = L.map('map').setView([50.0647, 19.9450], 13);
        
        // Warstwy mapy dla różnych motywów
        this.layers = {
            light: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }),
            dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB'
            })
        };
        
        // Ustaw początkową warstwę
        this.updateMapTheme();
        
        // Obserwuj zmiany motywu
        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.getAttribute('data-theme');
            if (newTheme !== this.currentTheme) {
                this.currentTheme = newTheme;
                this.updateMapTheme();
            }
        });
        
        observer.observe(document.documentElement, { attributes: true });
    }
    
    class TransportMap {
    // ... istniejący kod ...
    
    updateMapTheme() {
        // Usuń wszystkie kafelki
        this.map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });
        
        // Wybierz odpowiednie kafelki dla motywu
        let tileLayer;
        
        if (this.currentTheme === 'dark') {
            // Tryb ciemny - ciemne kafelki
            tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19,
                subdomains: 'abcd'
            });
        } else {
            // Tryb jasny - standardowe kafelki
            tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            });
        }
        
        // Dodaj nowe kafelki
        tileLayer.addTo(this.map);
    }
    
    initControls() {
        // Przyciski zoom
        document.getElementById('zoom-in').addEventListener('click', () => this.map.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.map.zoomOut());
        
        // Lokalizacja użytkownika
        document.getElementById('locate-btn').addEventListener('click', () => this.locateUser());
    }
    
    locateUser() {
        if (!navigator.geolocation) {
            alert('Geolokalizacja nie jest wspierana przez twoją przeglądarkę');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.map.setView([latitude, longitude], 15);
            },
            (error) => {
                console.error('Błąd geolokalizacji:', error);
                alert('Nie udało się uzyskać lokalizacji');
            }
        );
    }
    
    addVehicleMarker(vehicle) {
        const { id, lat, lon, line, type, heading } = vehicle;
        
        // Określ kolor i ikonę
        const isBus = type === 'bus' || parseInt(line) > 100;
        const color = isBus ? '#2ecc71' : '#e74c3c';
        const icon = L.AwesomeMarkers.icon({
            icon: isBus ? 'bus' : 'train',
            markerColor: color,
            prefix: 'fa',
            iconColor: 'white'
        });
        
        // Usuń istniejący marker
        if (this.vehicleMarkers[id]) {
            this.map.removeLayer(this.vehicleMarkers[id]);
        }
        
        // Utwórz nowy marker
        const marker = L.marker([lat, lon], { 
            icon: icon,
            rotationAngle: heading || 0
        });
        
        // Dodaj popup z informacjami
        marker.bindPopup(`
            <div class="vehicle-popup">
                <h4>Linia ${line}</h4>
                <p>Typ: ${isBus ? 'Autobus' : 'Tramwaj'}</p>
                <p>ID: ${id}</p>
                <small>Ostatnia aktualizacja: ${new Date().toLocaleTimeString()}</small>
            </div>
        `);
        
        marker.addTo(this.map);
        this.vehicleMarkers[id] = marker;
        
        // Dodaj linię do aktywnych
        this.activeLines.add(line);
    }
    
    removeOldVehicles(activeIds) {
        Object.keys(this.vehicleMarkers).forEach(id => {
            if (!activeIds.includes(id)) {
                this.map.removeLayer(this.vehicleMarkers[id]);
                delete this.vehicleMarkers[id];
            }
        });
    }
    
    updateLinesList() {
        const linesList = document.getElementById('lines-list');
        linesList.innerHTML = '';
        
        Array.from(this.activeLines).sort().forEach(line => {
            const isBus = parseInt(line) > 100;
            const badge = document.createElement('span');
            badge.className = `line-badge ${isBus ? 'bus' : 'tram'}`;
            badge.textContent = line;
            badge.title = `Kliknij, aby pokazać/ukryć linię ${line}`;
            badge.addEventListener('click', () => this.toggleLine(line));
            linesList.appendChild(badge);
        });
    }
    
    toggleLine(line) {
        // Logika pokazywania/ukrywania konkretnej linii
        console.log(`Toggle line: ${line}`);
    }
    
    clearAll() {
        Object.values(this.vehicleMarkers).forEach(marker => this.map.removeLayer(marker));
        Object.values(this.stopMarkers).forEach(marker => this.map.removeLayer(marker));
        this.vehicleMarkers = {};
        this.stopMarkers = {};
        this.activeLines.clear();
    }
}
