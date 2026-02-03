class GTFSClient {
    constructor() {
        this.baseUrl = 'https://gtfs.ztp.krakow.pl';
        this.vehiclePositions = null;
        this.updateInterval = 30000; // 30 sekund
        this.updateTimer = null;
        
        // Endpointy (sprawdź dokumentację)
        this.endpoints = {
            static: `${this.baseUrl}/GTFS_KRK.zip`,
            vehiclePositions: `${this.baseUrl}/VehiclePositions.pb`, // GTFS-RT
            tripUpdates: `${this.baseUrl}/TripUpdates.pb`,
            serviceAlerts: `${this.baseUrl}/ServiceAlerts.pb`
        };
    }
    
    async fetchVehiclePositions() {
        try {
            const response = await fetch(this.endpoints.vehiclePositions, {
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/x-protobuf'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const buffer = await response.arrayBuffer();
            const feed = gtfs.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
            
            return this.parseVehiclePositions(feed);
        } catch (error) {
            console.error('Błąd pobierania danych GTFS-RT:', error);
            return [];
        }
    }
    
    parseVehiclePositions(feed) {
        const vehicles = [];
        
        feed.entity.forEach(entity => {
            if (entity.vehicle) {
                const vehicle = entity.vehicle;
                const position = vehicle.position;
                
                if (position && position.latitude && position.longitude) {
                    // Określ typ pojazdu na podstawie linii
                    const line = vehicle.trip?.routeId || 'N/A';
                    const isBus = this.isBusLine(line);
                    
                    vehicles.push({
                        id: vehicle.vehicle?.id || `vehicle_${entity.id}`,
                        lat: position.latitude,
                        lon: position.longitude,
                        line: line,
                        type: isBus ? 'bus' : 'tram',
                        heading: position.bearing || 0,
                        speed: position.speed || 0,
                        timestamp: vehicle.timestamp || Date.now() / 1000,
                        tripId: vehicle.trip?.tripId,
                        routeId: vehicle.trip?.routeId
                    });
                }
            }
        });
        
        return vehicles;
    }
    
    isBusLine(line) {
        // W Krakowie tramwaje mają numery 1-99, autobusy 100+
        const lineNum = parseInt(line);
        return !isNaN(lineNum) && lineNum > 99;
    }
    
    async fetchStaticData() {
        try {
            // Możesz tu dodać pobieranie statycznych danych GTFS
            // (stops.txt, routes.txt, itp.) jeśli potrzebujesz
            const response = await fetch(this.endpoints.static);
            return response;
        } catch (error) {
            console.error('Błąd pobierania danych statycznych:', error);
            return null;
        }
    }
    
    startAutoUpdate(callback) {
        // Wykonaj natychmiastowe pierwsze pobranie
        this.updateData(callback);
        
        // Ustaw interwał
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
