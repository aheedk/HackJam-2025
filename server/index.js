const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache events for 15 minutes to reduce API calls
const cache = new NodeCache({ stdTTL: 900 });

app.use(cors());
app.use(express.json());

// Known USF campus locations with coordinates
const USF_LOCATIONS = {
  // Student Centers & Main Buildings
  'marshall student center': { lat: 28.0650, lng: -82.4194, name: 'Marshall Student Center' },
  'msc': { lat: 28.0650, lng: -82.4194, name: 'Marshall Student Center' },
  'student center': { lat: 28.0650, lng: -82.4194, name: 'Marshall Student Center' },

  // Academic Buildings
  'cooper hall': { lat: 28.0640, lng: -82.4180, name: 'Cooper Hall' },
  'library': { lat: 28.0670, lng: -82.4150, name: 'USF Library' },
  'criser hall': { lat: 28.0645, lng: -82.4165, name: 'Criser Hall' },
  'engineering': { lat: 28.0660, lng: -82.4130, name: 'Engineering Building' },
  'ene': { lat: 28.0660, lng: -82.4130, name: 'Engineering Building' },
  'business': { lat: 28.0635, lng: -82.4195, name: 'Business Building' },
  'bsn': { lat: 28.0635, lng: -82.4195, name: 'Business Building' },
  'physics': { lat: 28.0655, lng: -82.4145, name: 'Physics Building' },
  'phy': { lat: 28.0655, lng: -82.4145, name: 'Physics Building' },
  'chemistry': { lat: 28.0662, lng: -82.4152, name: 'Chemistry Building' },
  'chm': { lat: 28.0662, lng: -82.4152, name: 'Chemistry Building' },
  'science center': { lat: 28.0668, lng: -82.4155, name: 'Science Center' },
  'isv': { lat: 28.0668, lng: -82.4155, name: 'Interdisciplinary Science Building' },
  'arts': { lat: 28.0642, lng: -82.4202, name: 'Contemporary Art Museum' },
  'cam': { lat: 28.0642, lng: -82.4202, name: 'Contemporary Art Museum' },

  // Recreation & Sports
  'recreation center': { lat: 28.0632, lng: -82.4140, name: 'Campus Recreation Center' },
  'rec center': { lat: 28.0632, lng: -82.4140, name: 'Campus Recreation Center' },
  'yuengling center': { lat: 28.0620, lng: -82.4098, name: 'Yuengling Center' },
  'sun dome': { lat: 28.0620, lng: -82.4098, name: 'Yuengling Center (Sun Dome)' },

  // Residence Halls
  'juniper': { lat: 28.0605, lng: -82.4193, name: 'Juniper-Poplar Hall' },
  'poplar': { lat: 28.0605, lng: -82.4193, name: 'Juniper-Poplar Hall' },
  'jpop': { lat: 28.0605, lng: -82.4193, name: 'Juniper-Poplar Hall' },
  'the village': { lat: 28.0575, lng: -82.4165, name: 'The Village' },
  'beta hall': { lat: 28.0595, lng: -82.4150, name: 'Beta Hall' },
  'alpha hall': { lat: 28.0598, lng: -82.4155, name: 'Alpha Hall' },
  'delta hall': { lat: 28.0592, lng: -82.4145, name: 'Delta Hall' },
  'epsilon hall': { lat: 28.0590, lng: -82.4160, name: 'Epsilon Hall' },
  'theta hall': { lat: 28.0588, lng: -82.4152, name: 'Theta Hall' },
  'castor hall': { lat: 28.0612, lng: -82.4162, name: 'Castor Hall' },
  'maple hall': { lat: 28.0608, lng: -82.4188, name: 'Maple Hall' },
  'magnolia hall': { lat: 28.0602, lng: -82.4185, name: 'Magnolia Hall' },

  // Dining
  'dining': { lat: 28.0648, lng: -82.4172, name: 'Dining' },
  'argos': { lat: 28.0648, lng: -82.4172, name: 'Argos Exchange' },
  'fresh food': { lat: 28.0608, lng: -82.4168, name: 'Fresh Food Company' },

  // Other Campus Locations
  'wellness center': { lat: 28.0638, lng: -82.4188, name: 'Student Health & Wellness Center' },
  'parking': { lat: 28.0655, lng: -82.4120, name: 'Campus Parking' },
  'bookstore': { lat: 28.0652, lng: -82.4192, name: 'USF Bookstore' },
  'tampa campus': { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' },
  'usf tampa': { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' },
  'usf': { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' }
};

// Geocode location string to coordinates
function geocodeLocation(locationString) {
  if (!locationString || locationString.trim() === '') {
    return { lat: 28.0650, lng: -82.4170, name: 'USF Tampa Campus' }; // Default to campus center
  }

  const locationLower = locationString.toLowerCase();

  // Check known locations
  for (const [key, coords] of Object.entries(USF_LOCATIONS)) {
    if (locationLower.includes(key)) {
      return coords;
    }
  }

  // If no match, return campus center
  return { lat: 28.0650, lng: -82.4170, name: locationString };
}

// Fetch events from Bulls Connect API
async function fetchEventsFromAPI() {
  try {
    const response = await axios.get('https://bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list', {
      params: {
        range: 0,
        limit: 100,
        filter4: '', // show status
        filter5: '', // group
        filter6: '', // group type
        filter2: '', // category
        filter3: '', // event type
        filter8: '', // location format
        filter9: '', // date range
        filter10: '', // recurring
        orderby_1: 'undefined',
        search_word: ''
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format');
    }

    // Transform the data to a more usable format
    const events = response.data.map(event => {
      const locationStr = event.p6 || '';
      const coords = geocodeLocation(locationStr);

      // Fix image URLs to include full domain
      let imageUrl = event.p11;
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `https://bullsconnect.usf.edu${imageUrl}`;
      }

      return {
        id: event.p1,
        uid: event.p2,
        name: event.p3,
        datetime: event.p4,
        category: event.p5,
        location: locationStr,
        coordinates: coords,
        organizationId: event.p7,
        organizationName: event.p9,
        attendeeCount: event.p10,
        imageUrl: imageUrl,
        price: event.p12,
        buttonLabel: event.p13,
        tags: event.p22,
        customTime: event.p24,
        capacityStatus: event.p26,
        timezone: event.p28
      };
    });

    return events;
  } catch (error) {
    console.error('Error fetching events:', error.message);
    throw error;
  }
}

// API endpoint to get all events
app.get('/api/events', async (req, res) => {
  try {
    // Check cache first
    const cachedEvents = cache.get('events');
    if (cachedEvents) {
      console.log('Returning cached events');
      return res.json(cachedEvents);
    }

    // Fetch fresh data
    console.log('Fetching fresh events from Bulls Connect...');
    const events = await fetchEventsFromAPI();

    // Cache the results
    cache.set('events', events);

    res.json(events);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Events endpoint: http://localhost:${PORT}/api/events`);
});
