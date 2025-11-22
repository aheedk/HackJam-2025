import axios from 'axios';

// Change this to your computer's IP address when testing on a physical device
// Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_BASE_URL = 'http://localhost:3000/api';

// For testing on physical device, use something like:
// const API_BASE_URL = 'http://192.168.1.XXX:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchTodayEvents = async () => {
  try {
    const response = await api.get('/events/today');
    return response.data;
  } catch (error) {
    console.error('Error fetching today events:', error);
    throw error;
  }
};

export const fetchEventsByLocation = async (locationName) => {
  try {
    const response = await api.get(`/events/location/${locationName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events by location:', error);
    throw error;
  }
};

export const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export default api;
