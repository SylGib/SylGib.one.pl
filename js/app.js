class TransportApp {
    constructor() {
        this.map = new TransportMap();
        this.gtfs = new GTFSClient();
        this.isRunning = false;
        this.vehicles = [];
        
        this.init();
    }
    
    init() {
        // Inicjalizacja UI
        this.initUI();
        
        // Rozpocznij auto-odświeżanie
        this.start();
        
        // Obserwuj zmiany filtrów
        this.setupFilters();
    }
    
    initUI() {
        // Przycisk odśwież
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Aktualizuj czas
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
    }
    
    setupFilters() {
        // Filtry pojazdów
        document.getElementById('show-buses').addEventListener('change', () => this.applyFilters());
        document.getElementById('show-trams').addEventListener('change', () => this.applyFilters());
        
        // Filtr linii
        document.getElementById('line-filter').addEventListener('change', (e) => {
            this.filterByLine(e.target.value);
        });
    }
    
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('Aplikacja uruchomiona');
        
        // Rozpocznij automatyczne odświeżanie
        this.gtfs.startAutoUpdate((vehicles) => {
            this.handleNewData(vehicles);
        });
    }
    
    stop() {
        this.isRunning = false;
        this.gtfs.stopAutoUpdate();
        console.log('Aplikacja zatrzymana');
    }
    
    async refreshData() {
        console.log('Ręczne odświeżanie...');
        const vehicles = await this.gtfs.updateData((vehicles) => {
            this.handleNewData(vehicles);
        });
        return vehicles;
    }
    
    handleNewData(vehicles) {
        if (!Array.isArray(vehicles)) return;
        
        this.vehicles = vehicles;
        
        // Aktualizuj statystyki
        this.updateStats(vehicles);
        
        // Aktualizuj mapę
        this.updateMap(vehicles);
        
        // Aktualizuj listę linii
        this.map.updateLinesList();
        
        // Zaktualizuj czas ostatniej aktualizacji
        document.getElementById('last-update').textContent = 
            new Date().toLocaleTimeString();
    }
    
    updateStats(vehicles) {
        const busCount = vehicles.filter(v => v.type === 'bus').length;
        const tramCount = vehicles.filter(v => v.type === 'tram').length;
        
        document.getElementById('bus-count').textContent = busCount;
        document.getElementById('tram-count').textContent = tramCount;
        document.getElementById('vehicles-online').textContent = vehicles.length;
        
        // Aktualizuj czas
        this.updateTime();
    }
    
    updateMap(vehicles) {
        // Przyjmij filtry
        const showBuses = document.getElementById('show-buses').checked;
        const showTrams = document.getElementById('show-trams').checked;
        const selectedLine = document.getElementById('line-filter').value;
        
        // Filtruj pojazdy
        let filteredVehicles = vehicles.filter(vehicle => {
            if (!showBuses && vehicle.type === 'bus') return false;
            if (!showTrams && vehicle.type === 'tram') return false;
            if (selectedLine !== 'all' && vehicle.line !== selectedLine) return false;
            return true;
        });
        
        // Zbierz aktywne ID
        const activeIds = filteredVehicles.map(v => v.id);
        
        // Dodaj/aktualizuj markery
        filteredVehicles.forEach(vehicle => {
            this.map.addVehicleMarker(vehicle);
        });
        
        // Usuń stare markery
        this.map.removeOldVehicles(activeIds);
    }
    
    updateTime() {
        const now = new Date();
        document.getElementById('update-time').textContent = 
            now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    }
    
    applyFilters() {
        this.updateMap(this.vehicles);
    }
    
    filterByLine(line) {
        this.updateMap(this.vehicles);
    }
}

// Uruchom aplikację po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    // Poczekaj na inicjalizację ThemeManager
    setTimeout(() => {
        window.app = new TransportApp();
    }, 100);
});
