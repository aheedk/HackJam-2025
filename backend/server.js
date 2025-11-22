const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache events for 15 minutes
const cache = new NodeCache({ stdTTL: 900 });

// Middleware
app.use(cors());
app.use(express.json());

// Load USF locations
const usfLocations = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'usfLocations.json'), 'utf8')
);

// Helper function to match event location to USF location
function matchLocation(eventLocationText) {
  if (!eventLocationText || eventLocationText.trim() === '') {
    return null;
  }

  const lowerLocation = eventLocationText.toLowerCase();

  // Check for virtual events
  if (lowerLocation.includes('virtual') ||
      lowerLocation.includes('online') ||
      lowerLocation.includes('zoom') ||
      lowerLocation.includes('video conference')) {
    return usfLocations.locations.find(loc => loc.isVirtual);
  }

  // Try to match with known locations
  for (const location of usfLocations.locations) {
    if (location.isVirtual) continue;

    // Check main name
    if (lowerLocation.includes(location.name.toLowerCase())) {
      return location;
    }

    // Check aliases
    for (const alias of location.aliases) {
      if (lowerLocation.includes(alias.toLowerCase())) {
        return location;
      }
    }
  }

  // If no match found, return Marshall Student Center as default
  return usfLocations.locations.find(loc => loc.name === 'Marshall Student Center');
}

// Scrape Bulls Connect events
async function scrapeEvents() {
  try {
    const response = await axios.get(
      'https://bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list',
      {
        params: {
          range_start: new Date().toISOString().split('T')[0],
          per_page: 100,
          page: 1,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; USF-Events-App/1.0)',
          'Accept': 'application/json',
        },
      }
    );

    if (response.data && Array.isArray(response.data)) {
      // Filter out separators and parse event objects
      const events = response.data
        .filter(item => item.p19 === 'event') // Only get event items, not separators
        .map(item => {
          const eventName = item.p3;
          const eventLocation = item.p6;
          const organizationName = item.p9;
          const eventDates = item.p4; // HTML formatted dates

          // Parse date from HTML (e.g., "Thu, Sep 11, 2025 10:00 AM")
          const dateMatch = eventDates && eventDates.match(/(\w{3}, \w{3} \d{1,2}, \d{4} \d{1,2}:\d{2} [AP]M)/);
          const startDate = dateMatch ? new Date(dateMatch[1]) : new Date();

          const location = matchLocation(eventLocation);

          return {
            id: item.p1,
            name: eventName,
            description: eventDates ? eventDates.replace(/<[^>]*>/g, '').replace(/&ndash;/g, '-') : '',
            startsOn: startDate.toISOString(),
            endsOn: startDate.toISOString(),
            location: eventLocation,
            locationCoords: location ? {
              latitude: location.latitude,
              longitude: location.longitude,
              name: location.name,
              address: location.address,
              isVirtual: location.isVirtual || false
            } : null,
            imagePath: item.p11,
            organizationName: organizationName,
            theme: item.p5,
            price: item.p12 || 'FREE',
          };
        });

      return events;
    }

    return [];
  } catch (error) {
    console.error('Error scraping Bulls Connect:', error.message);
    throw error;
  }
}

// Routes

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    // Check cache first
    let events = cache.get('all_events');

    if (!events) {
      console.log('Cache miss - fetching new events');
      events = await scrapeEvents();
      cache.set('all_events', events);
    } else {
      console.log('Cache hit - returning cached events');
    }

    res.json({
      success: true,
      count: events.length,
      events: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get today's events
app.get('/api/events/today', async (req, res) => {
  try {
    let events = cache.get('all_events');

    if (!events) {
      events = await scrapeEvents();
      cache.set('all_events', events);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startsOn);
      return eventDate >= today && eventDate < tomorrow;
    });

    res.json({
      success: true,
      count: todayEvents.length,
      events: todayEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get events by location
app.get('/api/events/location/:locationName', async (req, res) => {
  try {
    let events = cache.get('all_events');

    if (!events) {
      events = await scrapeEvents();
      cache.set('all_events', events);
    }

    const locationName = req.params.locationName.toLowerCase();
    const locationEvents = events.filter(event =>
      event.locationCoords &&
      event.locationCoords.name.toLowerCase().includes(locationName)
    );

    res.json({
      success: true,
      count: locationEvents.length,
      events: locationEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get all USF locations
app.get('/api/locations', (req, res) => {
  res.json({
    success: true,
    locations: usfLocations.locations,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 USF Events API ready!`);
});
