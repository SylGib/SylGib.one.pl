class TransportApp {
    constructor() {
        console.log('🚀 TransportApp - start');
        this.map = null;
        this.gtfs = null;
        this.vehicles = [];
        
        // Poczekaj aż strona się załaduje
        setTimeout(() => this.init(), 500);
    }
    
    init() {
        console.log('🔄 Inicjalizacja aplikacji...');
        
        try {
            // 1. Inicjalizuj mapę
            this.map = new TransportMap();
            
            // 2. Inicjalizuj GTFS
            this.gtfs = new GTFSClient();
            
            // 3. Ustaw proste event listenery
            this.setupBasicEvents();
            
            // 4. Rozpocznij
            this.start();
            
            console.log('✅ Aplikacja gotowa!');
            
        } catch (error) {
            console.error('❌ Błąd inicjalizacji:', error);
        }
    }
    
    setupBasicEvents() {
        console.log('🔗 Konfiguracja eventów...');
        
        // Tylko przycisk odśwież - reszta opcjonalnie
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Kliknięto odśwież');
                this.refreshData();
            });
        }
        
        // Filtry - tylko jeśli istnieją
        const setupFilter = (id) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
                return true;
            }
            return false;
        };
        
        const filters = ['show-buses', 'show-trams', 'show-stops'];
        filters.forEach(filterId => {
            if (setupFilter(filterId)) {
                console.log(`✅ Filter ${filterId} podpięty`);
            } else {
                console.log(`⚠️ Filter ${filterId} nie znaleziony`);
            }
        });
    }
    
    start() {
        console.log('▶️ Uruchamianie śledzenia...');
        
        if (this.gtfs) {
            this.gtfs.startAutoUpdate((vehicles) => {
                this.handleNewData(vehicles);
            });
        }
    }
    
    async refreshData() {
        console.log('📡 Ręczne odświeżanie...');
        
        if (!this.gtfs) return;
        
        try {
            const vehicles = await this.gtfs.fetchVehiclePositions();
            this.handleNewData(vehicles);
        } catch (error) {
            console.error('Błąd odświeżania:', error);
        }
    }
    
    handleNewData(vehicles) {
        if (!Array.isArray(vehicles) || vehicles.length === 0) {
            console.warn('Brak danych pojazdów');
            return;
        }
        
        console.log(`📊 Otrzymano ${vehicles.length} pojazdów`);
        this.vehicles = vehicles;
        
        // Proste aktualizacje
        this.updateSimpleStats(vehicles);
        this.updateSimpleMap(vehicles);
        this.updateTime();
    }
    
    updateSimpleStats(vehicles) {
        const busCount = vehicles.filter(v => v.type === 'bus').length;
        const tramCount = vehicles.filter(v => v.type === 'tram').length;
        const total = vehicles.length;
        
        // Bezpieczna aktualizacja
        const update = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        
        update('bus-count', busCount);
        update('tram-count', tramCount);
        update('vehicles-online', total);
        update('last-update', new Date().toLocaleTimeString('pl-PL'));
    }
    
    updateSimpleMap(vehicles) {
        if (!this.map) return;
        
        // Proste filtry
        const showBuses = this.getChecked('show-buses', true);
        const showTrams = this.getChecked('show-trams', true);
        
        const filtered = vehicles.filter(v => {
            if (v.type === 'bus' && !showBuses) return false;
            if (v.type === 'tram' && !showTrams) return false;
            return true;
        });
        
        // Dodaj markery
        filtered.forEach(v => this.map.addVehicleMarker(v));
        
        // Usuń stare
        const activeIds = filtered.map(v => v.id);
        this.map.removeOldVehicles(activeIds);
    }
    
    getChecked(id, defaultValue) {
        const el = document.getElementById(id);
        return el && el.type === 'checkbox' ? el.checked : defaultValue;
    }
    
    applyFilters() {
        console.log('🔧 Zastosowano filtry');
        if (this.vehicles.length > 0) {
            this.updateSimpleMap(this.vehicles);
        }
    }
    
    updateTime() {
        const el = document.getElementById('update-time');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

// Uruchom po załadowaniu
window.addEventListener('load', () => {
    console.log('🌐 Strona załadowana');
    window.app = new TransportApp();
});
