const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3001;

// Cache events for 15 minutes to reduce API calls
const cache = new NodeCache({ stdTTL: 900 });

app.use(cors());
app.use(express.json());

// Known USF campus locations with coordinates
const USF_LOCATIONS = {
  // Student Centers & Main Buildings (VERIFIED COORDINATES)
  'marshall student center': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center' },
  'msc': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center' },
  'student center': { lat: 28.063934, lng: -82.4134536, name: 'Marshall Student Center' },
  'argos': { lat: 28.063934, lng: -82.4134536, name: 'Argos Exchange (MSC)' },
  'argos exchange': { lat: 28.063934, lng: -82.4134536, name: 'Argos Exchange' },
  'the loft': { lat: 28.063934, lng: -82.4134536, name: 'The Loft (MSC)' },
  'esports living lab': { lat: 28.063934, lng: -82.4134536, name: 'Esports Living Lab (MSC)' },

  // Engineering Buildings (MANUALLY PROVIDED - VERIFIED)
  'engineering': { lat: 28.058641622058513, lng: -82.41561841503614, name: 'Engineering Building' },
  'enb': { lat: 28.058641622058513, lng: -82.41561841503614, name: 'Engineering Building (ENB)' },
  'eng': { lat: 28.058641622058513, lng: -82.41561841503614, name: 'Engineering Building (ENG)' },
  'ene': { lat: 28.058641622058513, lng: -82.41561841503614, name: 'Engineering (ENE)' },
  'dfx lab': { lat: 28.058641622058513, lng: -82.41561841503614, name: 'DFX Lab (Engineering)' },
  'ieee workshop': { lat: 28.058641622058513, lng: -82.41561841503614, name: 'IEEE Workshop (Engineering)' },

  // Recreation & Sports (MANUALLY PROVIDED - VERIFIED)
  'recreation center': { lat: 28.060379000487956, lng: -82.4076140119299, name: 'Campus Recreation Center' },
  'rec center': { lat: 28.060379000487956, lng: -82.4076140119299, name: 'Campus Recreation Center' },
  'rec': { lat: 28.060379000487956, lng: -82.4076140119299, name: 'Recreation Center' },
  'fitness center': { lat: 28.060379000487956, lng: -82.4076140119299, name: 'Fitness Center' },
  'rec courts': { lat: 28.060379000487956, lng: -82.4076140119299, name: 'Recreation Center Courts' },

  // Theatre (MANUALLY PROVIDED - VERIFIED)
  'theatre': { lat: 28.06342185774089, lng: -82.4144719350504, name: 'USF Theatre' },
  'theater': { lat: 28.06342185774089, lng: -82.4144719350504, name: 'USF Theatre' },
  'usf theatre 2': { lat: 28.06342185774089, lng: -82.4144719350504, name: 'USF Theatre 2' },

  // Default Campus Location (fallback for unmatched locations)
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
    // Build headers with authentication if available
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://bullsconnect.usf.edu/',
      'Origin': 'https://bullsconnect.usf.edu'
    };

    // Add cookies if provided in environment variables
    if (process.env.BULLSCONNECT_COOKIE) {
      headers['Cookie'] = process.env.BULLSCONNECT_COOKIE;
      console.log('✓ Using authentication cookie for Bulls Connect API - full location details should be available');
    } else {
      console.log('⚠ No authentication cookie found - some locations may show as "Private Location (sign in to display)"');
      console.log('   To fix this, add BULLSCONNECT_COOKIE to your .env file (see README.md for instructions)');
    }

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
      headers: headers
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format');
    }

    // Transform the data to a more usable format
    const events = response.data
      .map(event => {
        // Use location as-is from API - if authenticated, we'll get real locations
        let locationStr = event.p6 || '';
        
        // Only use fallback if location is completely empty (not for private location messages)
        // This way, if authenticated, we get the real location
        if (!locationStr || locationStr.trim() === '') {
          locationStr = 'USF Tampa Campus'; // Default fallback only for truly empty locations
        }
        
        const coords = geocodeLocation(locationStr);

        // Fix image URLs to include full domain
        let imageUrl = event.p11;
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `https://bullsconnect.usf.edu${imageUrl}`;
        }

        // Clean up values - convert false/null/string "false" to null
        let name = event.p3;
        if (!name || name === false || name === 'false' || String(name).toLowerCase().trim() === 'false' || String(name).trim() === '') {
          name = null;
        }
        
        let organizationName = event.p9;
        if (!organizationName || organizationName === false || organizationName === 'false' || String(organizationName).toLowerCase().trim() === 'false') {
          organizationName = null;
        }

        return {
          id: event.p1,
          uid: event.p2,
          name: name,
          datetime: event.p4,
          category: event.p5,
          location: locationStr, // Use location as returned from API
          coordinates: coords,
          organizationId: event.p7,
          organizationName: organizationName,
          attendeeCount: event.p10 || 0,
          imageUrl: imageUrl,
          price: event.p12,
          buttonLabel: event.p13,
          tags: event.p22,
          customTime: event.p24,
          capacityStatus: event.p26,
          timezone: event.p28
        };
      })
      // Filter out events with invalid names (required field)
      .filter(event => {
        if (!event.name) return false;
        const nameStr = String(event.name).trim().toLowerCase();
        return nameStr !== '' && nameStr !== 'false' && nameStr !== 'null' && nameStr !== 'undefined';
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
    // Check if cache should be cleared (query parameter)
    const forceRefresh = req.query.refresh === 'true';
    
    if (forceRefresh) {
      cache.del('events');
      console.log('Cache cleared, fetching fresh events...');
    }
    
    // Check cache first
    const cachedEvents = cache.get('events');
    if (cachedEvents && !forceRefresh) {
      console.log('Returning cached events');
      // Double-check cached events are valid (filter again as safety)
      const validCachedEvents = cachedEvents.filter(event => {
        if (!event.name) return false;
        const nameStr = String(event.name).trim().toLowerCase();
        return nameStr !== '' && nameStr !== 'false' && nameStr !== 'null' && nameStr !== 'undefined';
      });
      return res.json(validCachedEvents);
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

// Clear cache endpoint
app.post('/api/clear-cache', (req, res) => {
  cache.del('events');
  res.json({ status: 'ok', message: 'Cache cleared' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Events endpoint: http://localhost:${PORT}/api/events`);
});
