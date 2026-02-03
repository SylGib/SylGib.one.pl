class GTFSClient {
    constructor() {
        this.baseUrl = 'https://gtfs.ztp.krakow.pl';
        this.updateInterval = 30000; // 30 sekund
        this.updateTimer = null;
        
        this.endpoints = {
            vehiclePositions: `${this.baseUrl}/VehiclePositions.pb`
        };
        
        console.log('GTFSClient zainicjalizowany');
    }
    
    async fetchVehiclePositions() {
        try {
            console.log('Pobieranie danych z GTFS...');
            
            // Użyj CORS proxy
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = this.endpoints.vehiclePositions;
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                headers: {
                    'Accept': 'application/x-protobuf'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            // Dla testów zwróć mock dane
            // W przyszłości można dodać prawdziwy parser Protobuf
            return this.getMockData();
            
        } catch (error) {
            console.warn('Błąd pobierania GTFS, używam mock danych:', error.message);
            return this.getMockData();
        }
    }
    
    getMockData() {
        // Przykładowe dane dla testów
        const mockVehicles = [];
        const types = ['bus', 'tram'];
        const busLines = ['102', '124', '129', '152', '179', '194', '208', '224'];
        const tramLines = ['1', '3', '4', '6', '8', '10', '13', '14', '18', '20', '22', '24', '44', '50', '52'];
        
        // Losowe pozycje w obszarze Krakowa
        const centerLat = 50.0647;
        const centerLon = 19.9450;
        const radius = 0.03; // ~3km
        
        for (let i = 0; i < 25; i++) {
            const isBus = Math.random() > 0.4;
            const line = isBus ? 
                busLines[Math.floor(Math.random() * busLines.length)] :
                tramLines[Math.floor(Math.random() * tramLines.length)];
            
            // Losowa pozycja w okręgu
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius;
            const lat = centerLat + Math.cos(angle) * distance;
            const lon = centerLon + Math.sin(angle) * distance;
            
            mockVehicles.push({
                id: `vehicle_${i}_${Date.now()}`,
                lat: lat,
                lon: lon,
                line: line,
                type: isBus ? 'bus' : 'tram',
                heading: Math.floor(Math.random() * 360),
                speed: 20 + Math.random() * 40,
                timestamp: Date.now() / 1000
            });
        }
        
        console.log(`Wygenerowano ${mockVehicles.length} pojazdów testowych`);
        return mockVehicles;
    }
    
    startAutoUpdate(callback) {
        // Natychmiastowe pierwsze pobranie
        this.updateData(callback);
        
        // Ustaw interwał
        this.updateTimer = setInterval(() => {
            this.updateData(callback);
        }, this.updateInterval);
        
        console.log('Auto-odświeżanie uruchomione');
    }
    
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            console.log('Auto-odświeżanie zatrzymane');
        }
    }
    
    async updateData(callback) {
        try {
            const vehicles = await this.fetchVehiclePositions();
            
            if (callback && Array.isArray(vehicles)) {
                callback(vehicles);
            }
            
            return vehicles;
        } catch (error) {
            console.error('Błąd aktualizacji danych:', error);
            return [];
        }
    }
}
