class GTFSClient {
    constructor() {
        this.updateInterval = 15000; // 15 sekund
        this.updateTimer = null;
        console.log('📡 GTFSClient - tylko mock dane');
    }
    
    async fetchVehiclePositions() {
        console.log('🎲 Generowanie danych testowych...');
        return this.getMockData(); // Zawsze mock
    }
    
    getMockData() {
        const vehicles = [];
        const now = Date.now();
        
        // Stałe trasy dla realizmu
        const routes = [
            // Tramwaje - centrum
            {line: '1', type: 'tram', lat: 50.061, lon: 19.945, route: 0},
            {line: '3', type: 'tram', lat: 50.064, lon: 19.938, route: 0.2},
            {line: '4', type: 'tram', lat: 50.067, lon: 19.932, route: 0.4},
            {line: '6', type: 'tram', lat: 50.058, lon: 19.925, route: 0.6},
            {line: '14', type: 'tram', lat: 50.062, lon: 19.918, route: 0.8},
            {line: '18', type: 'tram', lat: 50.055, lon: 19.935, route: 0.3},
            {line: '52', type: 'tram', lat: 50.069, lon: 19.950, route: 0.7},
            
            // Autobusy - różne dzielnice
            {line: '102', type: 'bus', lat: 50.075, lon: 19.960, route: 0.1},
            {line: '124', type: 'bus', lat: 50.050, lon: 19.910, route: 0.5},
            {line: '129', type: 'bus', lat: 50.045, lon: 19.940, route: 0.9},
            {line: '152', type: 'bus', lat: 50.070, lon: 19.900, route: 0.2},
            {line: '179', type: 'bus', lat: 50.055, lon: 19.970, route: 0.6},
            {line: '194', type: 'bus', lat: 50.040, lon: 19.920, route: 0.4},
            {line: '208', type: 'bus', lat: 50.080, lon: 19.930, route: 0.8},
            {line: '224', type: 'bus', lat: 50.065, lon: 19.980, route: 0.3},
            
            // Więcej pojazdów
            {line: '1', type: 'tram', lat: 50.059, lon: 19.955, route: 0.5},
            {line: '3', type: 'tram', lat: 50.066, lon: 19.965, route: 0.7},
            {line: '102', type: 'bus', lat: 50.072, lon: 19.915, route: 0.9},
            {line: '124', type: 'bus', lat: 50.048, lon: 19.955, route: 0.1},
            {line: '52', type: 'tram', lat: 50.063, lon: 19.905, route: 0.3},
            {line: '179', type: 'bus', lat: 50.057, lon: 19.890, route: 0.5},
            {line: '14', type: 'tram', lat: 50.073, lon: 19.975, route: 0.7},
            {line: '208', type: 'bus', lat: 50.052, lon: 19.935, route: 0.9}
        ];
        
        routes.forEach((route, i) => {
            // Delikatny ruch
            const timeOffset = (now / 60000) * 0.1; // Powolny ruch
            const progress = (route.route + timeOffset) % 1;
            
            // Lekkie przesunięcie dla "ruchu"
            const lat = route.lat + Math.sin(progress * Math.PI * 2) * 0.002;
            const lon = route.lon + Math.cos(progress * Math.PI * 2) * 0.002;
            
            vehicles.push({
                id: `vehicle_${i}_${Math.floor(now/1000)}`,
                lat: lat,
                lon: lon,
                line: route.line,
                type: route.type,
                heading: (progress * 360) % 360,
                speed: route.type === 'bus' ? 35 : 25,
                timestamp: now / 1000
            });
        });
        
        console.log(`🎯 Wygenerowano ${vehicles.length} pojazdów`);
        return vehicles;
    }
    
    startAutoUpdate(callback) {
        // Pierwsze natychmiastowe
        this.updateData(callback);
        
        // Co 15 sekund
        this.updateTimer = setInterval(() => {
            this.updateData(callback);
        }, this.updateInterval);
        
        console.log(`⏱️ Auto-odświeżanie co ${this.updateInterval/1000}s`);
    }
    
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    async updateData(callback) {
        try {
            const vehicles = await this.fetchVehiclePositions();
            if (callback && vehicles) {
                callback(vehicles);
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    }
}
