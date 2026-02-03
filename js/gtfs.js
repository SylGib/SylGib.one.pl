class GTFSClient {
    constructor() {
        this.baseUrl = 'https://gtfs.ztp.krakow.pl';
        this.updateInterval = 30000;
        this.updateTimer = null;
        
        console.log('GTFSClient zainicjalizowany');
    }
    
    async fetchVehiclePositions() {
        try {
            console.log('Pobieranie danych z GTFS...');
            
            // RÓŻNE proxy do wypróbowania
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
                'https://thingproxy.freeboard.io/fetch/',
                'https://api.codetabs.com/v1/proxy?quest='
            ];
            
            let response = null;
            
            // Spróbuj każde proxy
            for (const proxy of proxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(this.baseUrl + '/VehiclePositions.pb');
                    console.log('Próbuję proxy:', proxy);
                    
                    response = await fetch(proxyUrl, {
                        headers: {
                            'Accept': 'application/x-protobuf'
                        },
                        signal: AbortSignal.timeout(5000) // Timeout 5s
                    });
                    
                    if (response.ok) {
                        console.log('Proxy działa:', proxy);
                        break;
                    }
                } catch (proxyError) {
                    console.log('Proxy nie działa:', proxy, proxyError.message);
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                console.warn('Wszystkie proxy zawiodły, używam mock danych');
                return this.getMockData();
            }
            
            // Dla testów zwróć mock dane (bo i tak nie mamy parsera Protobuf)
            return this.getMockData();
            
        } catch (error) {
            console.warn('Błąd pobierania GTFS, używam mock danych:', error.message);
            return this.getMockData();
        }
    }
    
    getMockData() {
        // REALISTYCZNE dane testowe dla Krakowa
        const mockVehicles = [];
        
        // Przydatne trasy w Krakowie
        const routes = [
            // Tramwaje
            { line: '1', type: 'tram', route: [[50.057, 19.945], [50.065, 19.940], [50.072, 19.935]] },
            { line: '3', type: 'tram', route: [[50.060, 19.935], [50.065, 19.945], [50.070, 19.955]] },
            { line: '4', type: 'tram', route: [[50.055, 19.925], [50.060, 19.935], [50.065, 19.945]] },
            { line: '6', type: 'tram', route: [[50.050, 19.950], [50.055, 19.945], [50.060, 19.940]] },
            { line: '14', type: 'tram', route: [[50.068, 19.938], [50.062, 19.932], [50.058, 19.925]] },
            { line: '18', type: 'tram', route: [[50.052, 19.930], [50.058, 19.935], [50.063, 19.940]] },
            { line: '52', type: 'tram', route: [[50.070, 19.950], [50.065, 19.945], [50.060, 19.940]] },
            
            // Autobusy
            { line: '102', type: 'bus', route: [[50.068, 19.975], [50.063, 19.970], [50.058, 19.965]] },
            { line: '124', type: 'bus', route: [[50.055, 19.910], [50.060, 19.915], [50.065, 19.920]] },
            { line: '129', type: 'bus', route: [[50.072, 19.930], [50.067, 19.925], [50.062, 19.920]] },
            { line: '152', type: 'bus', route: [[50.048, 19.935], [50.053, 19.940], [50.058, 19.945]] },
            { line: '179', type: 'bus', route: [[50.065, 19.900], [50.070, 19.905], [50.075, 19.910]] },
            { line: '194', type: 'bus', route: [[50.060, 19.960], [50.065, 19.965], [50.070, 19.970]] },
            { line: '208', type: 'bus', route: [[50.045, 19.920], [50.050, 19.925], [50.055, 19.930]] },
            { line: '224', type: 'bus', route: [[50.075, 19.945], [50.070, 19.940], [50.065, 19.935]] }
        ];
        
        // Stwórz pojazdy na trasach
        routes.forEach((route, routeIndex) => {
            // 2-3 pojazdy na trasę
            const vehiclesOnRoute = 2 + Math.floor(Math.random() * 2);
            
            for (let i = 0; i < vehiclesOnRoute; i++) {
                // Pozycja na trasie z progresem
                const progress = (Date.now() / 60000 + i * 0.3) % 1; // Płynny ruch
                const pointIndex = Math.floor(progress * (route.route.length - 1));
                const nextPointIndex = (pointIndex + 1) % route.route.length;
                
                const [startLat, startLon] = route.route[pointIndex];
                const [endLat, endLon] = route.route[nextPointIndex];
                
                const segmentProgress = (progress * (route.route.length - 1)) % 1;
                
                const lat = startLat + (endLat - startLat) * segmentProgress;
                const lon = startLon + (endLon - startLon) * segmentProgress;
                
                // Kierunek (w stopniach)
                const angle = Math.atan2(endLon - startLon, endLat - startLat) * (180 / Math.PI);
                const heading = (angle + 360) % 360;
                
                mockVehicles.push({
                    id: `${route.type}_${route.line}_${routeIndex}_${i}`,
                    lat: lat,
                    lon: lon,
                    line: route.line,
                    type: route.type,
                    heading: heading,
                    speed: route.type === 'bus' ? 30 + Math.random() * 20 : 20 + Math.random() * 15,
                    timestamp: Date.now() / 1000
                });
            }
        });
        
        console.log(`Wygenerowano ${mockVehicles.length} realistycznych pojazdów testowych`);
        return mockVehicles;
    }
    
    startAutoUpdate(callback) {
        // Natychmiastowe pierwsze pobranie
        this.updateData(callback);
        
        // Ustaw interwał
        this.updateTimer = setInterval(() => {
            this.updateData(callback);
        }, this.updateInterval);
        
        console.log('Auto-odświeżanie uruchomione (co ' + this.updateInterval/1000 + 's)');
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
