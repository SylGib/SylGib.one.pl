class GTFSClient {
    constructor() {
        this.baseUrl = 'https://gtfs.ztp.krakow.pl';
        this.vehiclePositions = null;
        this.updateInterval = 30000;
        this.updateTimer = null;
        
        this.endpoints = {
            vehiclePositions: `${this.baseUrl}/VehiclePositions.pb`
        };
    }
    
    async fetchVehiclePositions() {
        try {
            // Użyj CORS proxy aby ominąć błąd CORS
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = this.endpoints.vehiclePositions;
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                headers: {
                    'Accept': 'application/x-protobuf'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const buffer = await response.arrayBuffer();
            const vehicles = await this.parseProtobuf(buffer);
            
            return vehicles;
        } catch (error) {
            console.error('Błąd pobierania danych GTFS-RT:', error);
            
            // Dla testów - zwróć przykładowe dane
            return this.getMockData();
        }
    }
    
    async parseProtobuf(buffer) {
        try {
            // Prosta implementacja bez zewnętrznych bibliotek
            // Parsujemy ręcznie podstawowe dane
            const dataView = new DataView(buffer);
            const vehicles = [];
            
            // To jest uproszczony parser - w rzeczywistości potrzebujesz
            // pełnej definicji protobuf GTFS-RT
            
            // Tymczasowo zwróć mock dane
            return this.getMockData();
            
        } catch (error) {
            console.warn('Błąd parsowania protobuf, używam mock danych:', error);
            return this.getMockData();
        }
    }
    
    getMockData() {
        // Przykładowe dane dla testów
        const mockVehicles = [];
        const types = ['bus', 'tram'];
        
        for (let i = 0; i < 20; i++) {
            const isBus = Math.random() > 0.5;
            const line = isBus ? 
                Math.floor(Math.random() * 100) + 100 : 
                Math.floor(Math.random() * 50) + 1;
            
            // Losowe pozycje w Krakowie
            const lat = 50.06 + (Math.random() - 0.5) * 0.05;
            const lon = 19.94 + (Math.random() - 0.5) * 0.05;
            
            mockVehicles.push({
                id: `vehicle_${i}`,
                lat: lat,
                lon: lon,
                line: line.toString(),
                type: isBus ? 'bus' : 'tram',
                heading: Math.floor(Math.random() * 360),
                speed: Math.random() * 50,
                timestamp: Date.now() / 1000
            });
        }
        
        return mockVehicles;
    }
    
    isBusLine(line) {
        const lineNum = parseInt(line);
        return !isNaN(lineNum) && lineNum > 99;
    }
    
    startAutoUpdate(callback) {
        this.updateData(callback);
        
        this.updateTimer = setInterval(() => {
            this.updateData(callback);
        }, this.updateInterval);
    }
    
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    async updateData(callback) {
        const vehicles = await this.fetchVehiclePositions();
        
        if (callback && Array.isArray(vehicles)) {
            callback(vehicles);
        }
        
        return vehicles;
    }
}
