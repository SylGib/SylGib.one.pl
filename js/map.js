class TransportMap {
    constructor() {
        this.map = null;
        this.vehicleMarkers = {};
        this.currentTheme = document.documentElement.getAttribute('data-theme');
        this.tileLayer = null;
        
        console.log('TransportMap - konstruktor');
        
        // Inicjalizacja z opóźnieniem
        setTimeout(() => this.initMap(), 100);
    }
    
    initMap() {
        console.log('Inicjalizacja mapy...');
        
        // Sprawdź czy Leaflet jest dostępny
        if (typeof L === 'undefined') {
            console.error('Leaflet (L) nie jest załadowany!');
            setTimeout(() => this.initMap(), 100);
            return;
        }
        
        // Sprawdź czy element mapy istnieje
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Element #map nie znaleziony!');
            return;
        }
        
        try {
            // Inicjalizuj mapę
            this.map = L.map('map').setView([50.0647, 19.9450], 13);
            
            // Dodaj początkową warstwę
            this.updateMapTheme();
            
            // Inicjalizuj kontrolki
            this.initControls();
            
            // Ustaw obserwatora motywu
            this.setupThemeListener();
            
            console.log('Mapa zainicjalizowana pomyślnie');
        } catch (error) {
            console.error('Błąd inicjalizacji mapy:', error);
        }
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
        
        console.log('Aktualizacja motywu mapy:', this.currentTheme);
        
        // Usuń starą warstwę
        if (this.tileLayer) {
            this.map.removeLayer(this.tileLayer);
        }
        
        // Wybierz odpowiednie kafelki dla motywu
        if (this.currentTheme === 'dark') {
            // Tryb ciemny - ciemne kafelki
            this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19,
                subdomains: 'abcd'
            });
        } else {
            // Tryb jasny - standardowe kafelki
            this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            });
        }
        
        // Dodaj nową warstwę
        this.tileLayer.addTo(this.map);
    }
    
    initControls() {
        // Kontrolki mapy
        const initControl = (id, action) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', action);
                btn.style.display = 'block';
            }
        };
        
        initControl('locate-btn', () => this.locateUser());
        initControl('zoom-in', () => this.map && this.map.zoomIn());
        initControl('zoom-out', () => this.map && this.map.zoomOut());
        
        console.log('Kontrolki mapy zainicjalizowane');
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
                console.log('Centrowanie na użytkowniku:', latitude, longitude);
            },
            (error) => {
                console.error('Błąd geolokalizacji:', error);
                alert('Nie udało się uzyskać lokalizacji. Sprawdź uprawnienia przeglądarki.');
            }
        );
    }
    
    addVehicleMarker(vehicle) {
        if (!this.map) return null;
        
        const { id, lat, lon, line, type, heading } = vehicle;
        
        // Określ typ i kolor
        const isBus = type === 'bus' || parseInt(line) > 100;
        const color = isBus ? '#2ecc71' : '#e74c3c';
        const emoji = isBus ? '🚌' : '🚋';
        
        // Utwórz ikonę z emoji
        const icon = L.divIcon({
            html: `
                <div style="
                    position: relative;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: rotate(${heading || 0}deg);
                ">
                    <div style="
                        background-color: ${color};
                        color: white;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        font-weight: bold;
                        border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                        cursor: pointer;
                    ">
                        ${line}
                    </div>
                    <div style="
                        position: absolute;
                        top: -8px;
                        left: -8px;
                        font-size: 20px;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    ">
                        ${emoji}
                    </div>
                </div>
            `,
            className: 'vehicle-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        // Usuń istniejący marker
        if (this.vehicleMarkers[id]) {
            this.map.removeLayer(this.vehicleMarkers[id]);
        }
        
        // Utwórz nowy marker
        const marker = L.marker([lat, lon], { 
            icon: icon,
            title: `Linia ${line} (${isBus ? 'Autobus' : 'Tramwaj'})`
        });
        
        // Dodaj popup z informacjami
        marker.bindPopup(`
            <div style="padding: 12px; min-width: 220px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="
                        background-color: ${color};
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        margin-right: 10px;
                    ">
                        ${line}
                    </div>
                    <div>
                        <h4 style="margin: 0 0 4px 0; color: ${color}">Linia ${line}</h4>
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            ${isBus ? 'Autobus' : 'Tramwaj'} • ${emoji}
                        </p>
                    </div>
                </div>
                <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
                <p style="margin: 6px 0; font-size: 13px;">
                    <strong>Pozycja:</strong><br>
                    ${lat.toFixed(5)}°, ${lon.toFixed(5)}°
                </p>
                <p style="margin: 6px 0; font-size: 13px;">
                    <strong>Kierunek:</strong> ${heading ? heading.toFixed(0) + '°' : 'Nieznany'}
                </p>
                <p style="margin: 6px 0; font-size: 13px;">
                    <strong>ID:</strong> ${id}
                </p>
                <small style="color: #888; font-size: 12px;">
                    Ostatnia aktualizacja: ${new Date().toLocaleTimeString('pl-PL')}
                </small>
            </div>
        `);
        
        // Dodaj hover effect
        marker.on('mouseover', function() {
            this.openPopup();
        });
        
        marker.on('mouseout', function() {
            this.closePopup();
        });
        
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
        
        console.log('Wszystkie markery usunięte');
    }
}
