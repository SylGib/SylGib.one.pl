class TransportMap {
    constructor() {
        console.log('🗺️ Inicjalizacja mapy...');
        this.map = null;
        this.vehicleMarkers = {};
        this.currentTheme = document.documentElement.getAttribute('data-theme');
        
        this.initMap();
    }
    
    initMap() {
        // Sprawdź czy Leaflet jest dostępny
        if (typeof L === 'undefined') {
            console.error('Leaflet nie załadowany');
            setTimeout(() => this.initMap(), 100);
            return;
        }
        
        // Sprawdź element mapy
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Element #map nie znaleziony');
            return;
        }
        
        try {
            // Stwórz mapę
            this.map = L.map('map').setView([50.0647, 19.9450], 13);
            
            // Dodaj warstwę
            this.updateMapTheme();
            
            // Kontrolki
            this.addMapControls();
            
            console.log('✅ Mapa gotowa');
        } catch (error) {
            console.error('Błąd tworzenia mapy:', error);
        }
    }
    
    updateMapTheme() {
        if (!this.map) return;
        
        // Usuń starą warstwę
        this.map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });
        
        // Dodaj nową w zależności od motywu
        let tileUrl, attribution;
        
        if (this.currentTheme === 'dark') {
            tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            attribution = '© OpenStreetMap, © CartoDB';
        } else {
            tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            attribution = '© OpenStreetMap contributors';
        }
        
        L.tileLayer(tileUrl, {
            attribution: attribution,
            maxZoom: 19
        }).addTo(this.map);
    }
    
    addMapControls() {
        // Lokalizacja użytkownika
        const locateBtn = document.getElementById('locate-btn');
        if (locateBtn) {
            locateBtn.onclick = () => this.locateUser();
        }
        
        // Zoom
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        
        if (zoomIn) zoomIn.onclick = () => this.map && this.map.zoomIn();
        if (zoomOut) zoomOut.onclick = () => this.map && this.map.zoomOut();
    }
    
    locateUser() {
        if (!navigator.geolocation) {
            alert('Twoja przeglądarka nie wspiera geolokalizacji');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                this.map.setView([latitude, longitude], 15);
            },
            (error) => {
                console.error('Błąd geolokalizacji:', error);
            }
        );
    }
    
    addVehicleMarker(vehicle) {
        if (!this.map) return null;
        
        const { id, lat, lon, line, type } = vehicle;
        const isBus = type === 'bus';
        const color = isBus ? '#2ecc71' : '#e74c3c';
        
        // Prosta ikona
        const icon = L.divIcon({
            html: `
                <div style="
                    background: ${color};
                    color: white;
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    border: 3px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">
                    ${line}
                </div>
            `,
            className: 'vehicle-marker',
            iconSize: [34, 34]
        });
        
        // Usuń stary marker
        if (this.vehicleMarkers[id]) {
            this.map.removeLayer(this.vehicleMarkers[id]);
        }
        
        // Nowy marker
        const marker = L.marker([lat, lon], { icon: icon });
        
        // Popup
        marker.bindPopup(`
            <div style="padding: 10px;">
                <strong>Linia ${line}</strong><br>
                ${isBus ? 'Autobus' : 'Tramwaj'}<br>
                <small>${lat.toFixed(5)}, ${lon.toFixed(5)}</small>
            </div>
        `);
        
        marker.addTo(this.map);
        this.vehicleMarkers[id] = marker;
        
        return marker;
    }
    
    removeOldVehicles(activeIds) {
        Object.keys(this.vehicleMarkers).forEach(id => {
            if (!activeIds.includes(id)) {
                this.map.removeLayer(this.vehicleMarkers[id]);
                delete this.vehicleMarkers[id];
            }
        });
    }
}
