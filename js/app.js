class TransportApp {
    constructor() {
        console.log('🚀 TransportApp - start');
        this.map = null;
        this.gtfs = null;
        this.vehicles = [];
        
        // Start po załadowaniu strony
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startApp());
        } else {
            this.startApp();
        }
    }
    
    startApp() {
        console.log('🔄 Start aplikacji...');
        
        // 1. Inicjalizuj mapę
        try {
            this.map = new TransportMap();
            console.log('✅ Mapa zainicjalizowana');
        } catch (error) {
            console.error('❌ Błąd mapy:', error);
            return;
        }
        
        // 2. Inicjalizuj GTFS (tylko mock)
        this.gtfs = new GTFSClient();
        console.log('✅ GTFS zainicjalizowany');
        
        // 3. Podłącz eventy
        this.connectEvents();
        
        // 4. Rozpocznij odświeżanie
        this.startUpdates();
        
        console.log('✅ Aplikacja gotowa!');
    }
    
    connectEvents() {
        console.log('🔗 Podłączanie eventów...');
        
        // Przycisk odśwież
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.onclick = () => {
                console.log('🔄 Kliknięto odśwież');
                this.refreshData();
            };
            console.log('✅ Przycisk odśwież podpięty');
        }
        
        // Filtry
        const busesCheck = document.getElementById('show-buses');
        const tramsCheck = document.getElementById('show-trams');
        
        if (busesCheck) {
            busesCheck.onchange = () => this.applyFilters();
            console.log('✅ Filter autobusów podpięty');
        }
        
        if (tramsCheck) {
            tramsCheck.onchange = () => this.applyFilters();
            console.log('✅ Filter tramwajów podpięty');
        }
    }
    
    startUpdates() {
        console.log('⏱️ Uruchamianie odświeżania...');
        
        if (this.gtfs && this.gtfs.startAutoUpdate) {
            this.gtfs.startAutoUpdate((vehicles) => {
                this.updateDisplay(vehicles);
            });
        }
        
        // Ręczne odświeżenie po 1s
        setTimeout(() => this.refreshData(), 1000);
    }
    
    async refreshData() {
        console.log('📡 Ręczne odświeżanie...');
        
        if (!this.gtfs) return;
        
        try {
            const vehicles = await this.gtfs.fetchVehiclePositions();
            this.updateDisplay(vehicles);
        } catch (error) {
            console.error('Błąd odświeżania:', error);
        }
    }
    
    updateDisplay(vehicles) {
        if (!vehicles || !Array.isArray(vehicles)) {
            console.warn('Brak danych pojazdów');
            return;
        }
        
        console.log(`📊 Otrzymano ${vehicles.length} pojazdów`);
        this.vehicles = vehicles;
        
        // Statystyki
        this.updateStats(vehicles);
        
        // Mapa
        this.updateMap(vehicles);
        
        // Czas
        this.updateTime();
    }
    
    updateStats(vehicles) {
        const busCount = vehicles.filter(v => v.type === 'bus').length;
        const tramCount = vehicles.filter(v => v.type === 'tram').length;
        
        // Aktualizuj tylko jeśli elementy istnieją
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        
        setText('bus-count', busCount);
        setText('tram-count', tramCount);
        setText('vehicles-online', vehicles.length);
        setText('last-update', new Date().toLocaleTimeString('pl-PL'));
    }
    
    updateMap(vehicles) {
        if (!this.map) return;
        
        // Sprawdź filtry
        const showBuses = this.isChecked('show-buses', true);
        const showTrams = this.isChecked('show-trams', true);
        
        // Filtruj pojazdy
        const filtered = vehicles.filter(v => {
            if (v.type === 'bus' && !showBuses) return false;
            if (v.type === 'tram' && !showTrams) return false;
            return true;
        });
        
        console.log(`🗺️ Wyświetlam ${filtered.length} pojazdów`);
        
        // Dodaj do mapy
        filtered.forEach(v => {
            this.map.addVehicleMarker(v);
        });
        
        // Usuń stare
        const activeIds = filtered.map(v => v.id);
        this.map.removeOldVehicles(activeIds);
    }
    
    isChecked(id, defaultVal = true) {
        const el = document.getElementById(id);
        if (!el || el.type !== 'checkbox') return defaultVal;
        return el.checked;
    }
    
    applyFilters() {
        console.log('🔧 Zastosowano filtry');
        if (this.vehicles && this.vehicles.length > 0) {
            this.updateMap(this.vehicles);
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

// URUCHOM APLIKACJĘ
window.addEventListener('load', function() {
    console.log('🌐 Strona załadowana - uruchamiam aplikację');
    window.app = new TransportApp();
});
