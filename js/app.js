class TransportApp {
    constructor() {
        this.map = null;
        this.gtfs = null;
        this.vehicles = [];
        this.activeLines = new Set();
        
        console.log('TransportApp - konstruktor');
        
        // Poczekaj na załadowanie DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 100);
        }
    }
    
    async init() {
        console.log('TransportApp - inicjalizacja');
        
        try {
            // 1. Inicjalizuj komponenty
            this.initComponents();
            
            // 2. Ustaw event listenery
            this.setupEventListeners();
            
            // 3. Rozpocznij aplikację
            this.start();
            
            console.log('TransportApp - zainicjalizowany pomyślnie');
            
        } catch (error) {
            console.error('Błąd inicjalizacji TransportApp:', error);
        }
    }
    
    initComponents() {
        // Inicjalizuj mapę (jeśli jeszcze nie zainicjalizowana przez theme.js)
        if (!this.map) {
            this.map = new TransportMap();
        }
        
        // Inicjalizuj GTFS client
        this.gtfs = new GTFSClient();
    }
    
    setupEventListeners() {
        // Przycisk odśwież
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        // Filtry
        const showBuses = document.getElementById('show-buses');
        const showTrams = document.getElementById('show-trams');
        
        if (showBuses) {
            showBuses.addEventListener('change', () => this.applyFilters());
        }
        if (showTrams) {
            showTrams.addEventListener('change', () => this.applyFilters());
        }
        
        // Obserwuj zmiany motywu
        document.addEventListener('themeChanged', (e) => {
            console.log('Motyw zmieniony:', e.detail.theme);
        });
    }
    
    start() {
        console.log('Rozpoczynanie śledzenia pojazdów...');
        
        // Rozpocznij auto-odświeżanie
        this.gtfs.startAutoUpdate((vehicles) => {
            this.handleNewData(vehicles);
        });
        
        // Pierwsze manualne odświeżenie
        setTimeout(() => this.refreshData(), 1000);
    }
    
    async refreshData() {
        console.log('Ręczne odświeżanie danych...');
        
        try {
            const vehicles = await this.gtfs.fetchVehiclePositions();
            this.handleNewData(vehicles);
        } catch (error) {
            console.error('Błąd ręcznego odświeżania:', error);
        }
    }
    
    handleNewData(vehicles) {
        if (!Array.isArray(vehicles)) {
            console.warn('Nieprawidłowe dane pojazdów:', vehicles);
            return;
        }
        
        console.log(`Otrzymano ${vehicles.length} pojazdów`);
        
        this.vehicles = vehicles;
        
        // Aktualizuj statystyki
        this.updateStats(vehicles);
        
        // Aktualizuj mapę
        this.updateMap(vehicles);
        
        // Aktualizuj listę linii
        this.updateLinesList(vehicles);
        
        // Zaktualizuj czas
        this.updateTime();
    }
    
    updateStats(vehicles) {
        const busCount = vehicles.filter(v => v.type === 'bus').length;
        const tramCount = vehicles.filter(v => v.type === 'tram').length;
        const totalCount = vehicles.length;
        
        // Aktualizuj elementy jeśli istnieją
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                element.style.opacity = '1';
            }
        };
        
        updateElement('bus-count', busCount);
        updateElement('tram-count', tramCount);
        updateElement('vehicles-online', totalCount);
        updateElement('last-update', new Date().toLocaleTimeString('pl-PL'));
        
        console.log(`Statystyki: ${busCount} autobusów, ${tramCount} tramwajów, ${totalCount} razem`);
    }
    
    updateMap(vehicles) {
        if (!this.map) {
            console.error('Mapa nie jest zainicjalizowana');
            return;
        }
        
        // Pobierz ustawienia filtrów
        const showBuses = document.getElementById('show-buses')?.checked ?? true;
        const showTrams = document.getElementById('show-trams')?.checked ?? true;
        
        // Filtruj pojazdy
        const filteredVehicles = vehicles.filter(vehicle => {
            if (vehicle.type === 'bus' && !showBuses) return false;
            if (vehicle.type === 'tram' && !showTrams) return false;
            return true;
        });
        
        console.log(`Wyświetlam ${filteredVehicles.length} pojazdów (filtry: bus=${showBuses}, tram=${showTrams})`);
        
        // Dodaj/aktualizuj markery
        filteredVehicles.forEach(vehicle => {
            this.map.addVehicleMarker(vehicle);
            
            // Dodaj linię do aktywnych
            if (vehicle.line) {
                this.activeLines.add(vehicle.line);
            }
        });
        
        // Usuń stare markery
        const activeIds = filteredVehicles.map(v => v.id);
        this.map.removeOldVehicles(activeIds);
    }
    
    updateLinesList(vehicles) {
        if (!this.map) return;
        
        // Zbierz wszystkie linie
        const lines = vehicles.map(v => v.line).filter(line => line);
        this.map.updateLinesList(lines);
    }
    
    applyFilters() {
        console.log('Zastosowano filtry');
        this.updateMap(this.vehicles);
    }
    
    updateTime() {
        const timeElement = document.getElementById('update-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('pl-PL', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    stop() {
        if (this.gtfs) {
            this.gtfs.stopAutoUpdate();
        }
        
        if (this.map) {
            this.map.clearAll();
        }
        
        console.log('Aplikacja zatrzymana');
    }
}

// Uruchom aplikację
let app = null;

function initApp() {
    if (!app) {
        app = new TransportApp();
        window.transportApp = app; // Dostęp globalny dla debugowania
        console.log('Aplikacja uruchomiona');
    }
}

// Poczekaj na załadowanie wszystkich skryptów
window.addEventListener('load', () => {
    setTimeout(initApp, 500);
});

// Ręczna inicjalizacja jeśli potrzebna
window.initTransportApp = initApp;
