class GTFSClient {
    constructor() {
        this.updateInterval = 10000; // 10 sekund
        this.updateTimer = null;
        console.log('📡 GTFSClient - mock dane');
    }
    
    async fetchVehiclePositions() {
        console.log('🎲 Generowanie danych testowych...');
        return this.generateMockData();
    }
    
    generateMockData() {
        const vehicles = [];
        const now = Date.now();
        
        // Stałe pozycje pojazdów (żeby nie skakały)
        const positions = [
            // Tramwaje - centrum
            {line: '1', type: 'tram', lat: 50.061, lon: 19.945},
            {line: '3', type: 'tram', lat: 50.064, lon: 19.938},
            {line: '4', type: 'tram', lat: 50.067, lon: 19.932},
            {line: '14', type: 'tram', lat: 50.058, lon: 19.925},
            {line: '18', type: 'tram', lat: 50.055, lon: 19.935},
            {line: '52', type: 'tram', lat: 50.069, lon: 19.950},
            
            // Autobusy
            {line: '102', type: 'bus', lat: 50.075, lon: 19.960},
            {line: '124', type: 'bus', lat: 50.050, lon: 19.910},
            {line: '129', type: 'bus', lat: 50.045, lon: 19.940},
            {line: '152', type: 'bus', lat: 50.070, lon: 19.900},
            {line: '179', type: 'bus', lat: 50.055, lon: 19.970},
            {line: '194', type: 'bus', lat: 50.040, lon: 19.920},
            {line: '208', type: 'bus', lat: 50.080, lon: 19.930},
            {line: '224', type: 'bus', lat: 50.065, lon: 19.980},
            
            // Więcej pojazdów
            {line: '6', type: 'tram', lat: 50.062, lon: 19.918},
            {line: '10', type: 'tram', lat: 50.073, lon: 19.965},
            {line: '139', type: 'bus', lat: 50.048, lon: 19.955},
            {line: '502', type: 'bus', lat: 50.057, lon: 19.890},
            {line: '44', type: 'tram', lat: 50.052, lon: 19.935},
            {line: '501', type: 'bus', lat: 50.063, lon: 19.905}
        ];
        
        // Twórz pojazdy
        positions.forEach((pos, index) => {
            // Delikatny ruch (tylko lekka animacja)
            const time = now / 60000; // minuty
            const offset = Math.sin(time * 0.5 + index) * 0.0005; // bardzo mały ruch
            
            vehicles.push({
                id: `vehicle_${index}_${pos.line}`,
                lat: pos.lat + offset,
                lon: pos.lon + offset,
                line: pos.line,
                type: pos.type,
                heading: (time * 10 + index * 30) % 360, // powolny obrót
                speed: pos.type === 'bus' ? 35 : 25,
                timestamp: now / 1000
            });
        });
        
        console.log(`✅ Wygenerowano ${vehicles.length} pojazdów`);
        return vehicles;
    }
    
    startAutoUpdate(callback) {
        // Pierwsze natychmiastowe
        this.updateData(callback);
        
        // Co 10 sekund
        this.updateTimer = setInterval(() => {
            this.updateData(callback);
        }, this.updateInterval);
        
        console.log(`⏱️ Auto-odświeżanie co ${this.updateInterval/1000}s`);
    }
    
    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
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
