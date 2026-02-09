// js/map.js

// Initialize the Leaflet map
const map = L.map('mapContainer').setView([51.505, -0.09], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Manage vehicle markers
const vehicleMarkers = {};

function addVehicleMarker(vehicleId, lat, lng) {
    if (vehicleMarkers[vehicleId]) {
        // Update existing marker position
        vehicleMarkers[vehicleId].setLatLng([lat, lng]);
    } else {
        // Create new marker
        const marker = L.marker([lat, lng]).addTo(map);
        vehicleMarkers[vehicleId] = marker;
    }
}

function removeVehicleMarker(vehicleId) {
    if (vehicleMarkers[vehicleId]) {
        map.removeLayer(vehicleMarkers[vehicleId]);
        delete vehicleMarkers[vehicleId];
    }
}

// Handle map controls
const zoomControl = L.control.zoom().addTo(map);
map.on('zoomend', function() {
    console.log('Current zoom level:', map.getZoom());
});
