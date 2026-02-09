// gtfs.js

const axios = require('axios');

const BASE_URL = 'https://api.krakow.pl/api/v1/';

/**
 * Fetches real-time departures for buses and trams from the GTFS API
 * @param {string} vehicleId - The ID of the vehicle (bus or tram)
 * @returns {Promise<Object>} - Promise resolving to the departure information
 */
async function getRealTimeDepartures(vehicleId) {
    try {
        const response = await axios.get(`${BASE_URL}departures?vehicleId=${vehicleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching departures:', error);
        throw error;
    }
}

/**
 * Example usage of the getRealTimeDepartures function
 */
(async () => {
    const vehicleId = 'your-vehicle-id'; // Replace with actual vehicle ID
    try {
        const departures = await getRealTimeDepartures(vehicleId);
        console.log('Real-time departures:', departures);
    } catch (error) {
        console.error('Failed to fetch departures:', error);
    }
})();

module.exports = { getRealTimeDepartures };