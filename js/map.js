class TransportMap {
    constructor() {
        this.map = null;
        this.vehicleMarkers = {};
        this.currentTheme = document.documentElement.getAttribute('data-theme');
        this.tileLayer = null;
        
        this.initMap();
        this.initControls();
        this.setupThemeListener();
    }
    
    initMap() {
        console.log('Inicjalizacja mapy...');
        
        // Sprawdź czy element mapy istnieje
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Element #map nie znaleziony!');
            return;
        }
        
        // Inicjalizuj mapę
        this.map = L.map('map').setView([50.0647, 19.9450], 13);
        
        // Dodaj początkową warstwę
        this.updateMapTheme();
        
        console.log('Mapa zainicjalizowana');
    }
    
    setupThemeListener() {
        // Obserwuj zmiany motywu
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme');
                    if (newTheme !== this.currentTheme) {
                        this.currentTheme = newTheme;
                        this.updateMapTheme();
                    }
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    updateMapTheme() {
        if (!this.map) return;
        
        // Usuń starą warstwę
        if (this.tileLayer) {
            this.map.removeLayer(this.tileLayer);
        }
        
        // Wybierz odpowiednie kafelki dla motywu
        if (this.currentTheme === 'dark') {
            // Tryb ciemny
            this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19,
                subdomains: 'abcd'
            });
        } else {
            // Tryb jasny
            this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            });
        }
        
        // Dodaj nową warstwę
        this.tileLayer.addTo(this.map);
        
        console.log('Mapa zaktualizowana - motyw:', this.currentTheme);
    }
    
    initControls() {
        setTimeout(() => {
            const locateBtn = document.getElementById('locate-btn');
            const zoomIn = document.getElementById('zoom-in');
            const zoomOut = document.getElementById('zoom-out');
            
            if (locateBtn) {
                locateBtn.addEventListener('click', () => this.locateUser());
                locateBtn.style.display = 'block';
            }
            
            if (zoomIn) {
                zoomIn.addEventListener('click', () => this.map && this.map.zoomIn());
                zoomIn.style.display = 'block';
            }
            
            if (zoomOut) {
                zoomOut.addEventListener('click', () => this.map && this.map.zoomOut());
                zoomOut.style.display = 'block';
            }
        }, 500);
    }
    
    locateUser() {
        if (!navigator.geolocation || !this.map) {
            alert('Geolokalizacja nie jest dostępna');
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
        if (!this.map) return;
        
        const { id, lat, lon, line, type } = vehicle;
        
        // Określ typ i kolor
        const isBus = type === 'bus' || parseInt(line) > 100;
        const color = isBus ? '#2ecc71' : '#e74c3c';
        const iconText = isBus ? '🚌' : '🚋';
        
        // Utwórz ikonę
        const icon = L.divIcon({
            html: `<div style="
                background-color: ${color};
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.2s;
            ">${line}</div>`,
            className: 'vehicle-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
        
        // Usuń istniejący marker
        if (this.vehicleMarkers[id]) {
            this.map.removeLayer(this.vehicleMarkers[id]);
        }
        
        // Utwórz nowy marker
        const marker = L.marker([lat, lon], { 
            icon: icon,
            title: `Linia ${line}`
        });
        
        // Dodaj popup
        marker.bindPopup(`
            <div style="padding: 10px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: ${color}">Linia ${line}</h4>
                <p style="margin: 0 0 5px 0;"><strong>Typ:</strong> ${isBus ? 'Autobus' : 'Tramwaj'}</p>
                <p style="margin: 0 0 5px 0;"><strong>ID:</strong> ${id}</p>
                <p style="margin: 0 0 8px 0;"><strong>Pozycja:</strong><br>${lat.toFixed(5)}, ${lon.toFixed(5)}</p>
                <small style="color: #888;">Kliknij na mapie aby zamknąć</small>
            </div>
        `);
        
        // Dodaj do mapy
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
    
    clearAll() {
        if (!this.map) return;
        
        Object.values(this.vehicleMarkers).forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.vehicleMarkers = {};
    }
    
    updateLinesList(lines) {
        const linesList = document.getElementById('lines-list');
        if (!linesList) return;
        
        linesList.innerHTML = '';
        
        // Ogranicz do 20 najczęstszych linii
        const uniqueLines = [...new Set(lines)].sort((a, b) => {
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            if (isNaN(aNum) || isNaN(bNum)) return a.localeCompare(b);
            return aNum - bNum;
        }).slice(0, 20);
        
        uniqueLines.forEach(line => {
            const isBus = parseInt(line) > 100;
            const badge = document.createElement('span');
            badge.className = `line-badge ${isBus ? 'bus' : 'tram'}`;
            badge.textContent = line;
            badge.title = `Linia ${line}`;
            
            // Kliknięcie zaznacza/odznacza pojazdy tej linii
            badge.addEventListener('click', () => {
                this.highlightLine(line);
            });
            
            linesList.appendChild(badge);
        });
    }
    
    highlightLine(line) {
        // Podświetl pojazdy danej linii
        Object.values(this.vehicleMarkers).forEach(marker => {
            const markerLine = marker.options.title?.replace('Linia ', '');
            if (markerLine === line) {
                marker.openPopup();
            }
        });
    }
}
