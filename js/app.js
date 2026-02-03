class TransportApp {
    constructor() {
        this.map = null;
        this.gtfs = null;
        this.vehicles = [];
        this.activeLines = new Set();
        
        console.log('TransportApp - konstruktor');
        
        // Inicjalizacja z opóźnieniem
        setTimeout(() => this.init(), 100);
    }
    
    async init() {
        console.log('TransportApp - inicjalizacja');
        
        try {
            // 1. Inicjalizuj mapę
            this.map = new TransportMap();
            
            // 2. Inicjalizuj GTFS client
            this.gtfs = new GTFSClient();
            
            // 3. Ustaw event listenery (BEZPIECZNIE)
            this.setupEventListeners();
            
            // 4. Rozpocznij aplikację
            this.start();
            
            console.log('TransportApp - zainicjalizowany pomyślnie');
            
        } catch (error) {
            console.error('Błąd inicjalizacji TransportApp:', error);
        }
    }
    
    setupEventListeners() {
        // Przycisk odśwież - BEZPIECZNE SPRAWDZENIE
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
            console.log('Przycisk odśwież podpięty');
        } else {
            console.warn('Przycisk #refresh-btn nie znaleziony');
        }
        
        // Filtry - BEZPIECZNE SPRAWDZENIE
        const showBuses = document.getElementById('show-buses');
        const showTrams = document.getElementById('show-trams');
        
        if (showBuses && showTrams) {
            showBuses.addEventListener('change', () => this.applyFilters());
            showTrams.addEventListener('change', () => this.applyFilters());
            console.log('Filtry podpięte');
        } else {
            console.warn('Elementy filtrów nie znalezione');
        }
    }
    
    start() {
        console.log('Rozpoczynanie śledzenia pojazdów...');
        
        // Rozpocznij auto-odświeżanie
        if (this.gtfs) {
            this.gtfs.startAutoUpdate((vehicles) => {
                this.handleNewData(vehicles);
            });
        }
        
        // Pierwsze manualne odświeżenie
        setTimeout(() => this.refreshData(), 1000);
    }
    
    async refreshData() {
        console.log('Ręczne odświeżanie danych...');
        
        if (!this.gtfs) {
            console.error('GTFS client nie zainicjalizowany');
            return;
        }
        
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
        
        // Zaktualizuj czas
        this.updateTime();
    }
    
    updateStats(vehicles) {
        const busCount = vehicles.filter(v => v.type === 'bus').length;
        const tramCount = vehicles.filter(v => v.type === 'tram').length;
        const totalCount = vehicles.length;
        
        // BEZPIECZNA aktualizacja elementów
        const elements = {
            'bus-count': busCount,
            'tram-count': tramCount,
            'vehicles-online': totalCount,
            'last-update': new Date().toLocaleTimeString('pl-PL')
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
        
        console.log(`Statystyki: ${busCount} autobusów, ${tramCount} tramwajów, ${totalCount} razem`);
    }
    
    updateMap(vehicles) {
        if (!this.map) {
            console.error('Mapa nie jest zainicjalizowana');
            return;
        }
        
        // BEZPIECZNE pobranie ustawień filtrów
        const showBuses = this.getFilterState('show-buses', true);
        const showTrams = this.getFilterState('show-trams', true);
        
        // Filtruj pojazdy
        const filteredVehicles = vehicles.filter(vehicle => {
            if (vehicle.type === 'bus' && !showBuses) return false;
            if (vehicle.type === 'tram' && !showTrams) return false;
            return true;
        });
        
        console.log(`Wyświetlam ${filteredVehicles.length} pojazdów`);
        
        // Dodaj/aktualizuj markery
        filteredVehicles.forEach(vehicle => {
            this.map.addVehicleMarker(vehicle);
        });
        
        // Usuń stare markery
        const activeIds = filteredVehicles.map(v => v.id);
        this.map.removeOldVehicles(activeIds);
    }
    
    getFilterState(elementId, defaultValue) {
        const element = document.getElementById(elementId);
        if (element && element.type === 'checkbox') {
            return element.checked;
        }
        return defaultValue;
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
                minute: '2-digit'
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

// Uruchom aplikację po załadowaniu strony
window.addEventListener('load', () => {
    console.log('Strona załadowana - uruchamiam aplikację');
    window.app = new TransportApp();
});
