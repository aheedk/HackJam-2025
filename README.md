# USF Events Map - HackJam 2025

**Track #1: Tech for Good / USF**

A mobile app that displays USF Bulls Connect events on an interactive map, helping students discover campus events near them and navigate to event locations.

## The Problem

Students struggle to:
- Discover events happening around campus
- Find where events are located
- Know what's happening near them right now
- Get directions to unfamiliar campus locations

## Our Solution

An intuitive mobile app that:
- Shows all USF events on an interactive map
- Lets you click locations to see what's happening there
- Provides one-tap navigation to any event
- Updates automatically with real-time Bulls Connect data

## Features

- 📍 **Interactive Map** - Visual display of all events across USF campus
- 📅 **Location-Based Discovery** - Click any location to see events happening there
- 📋 **Event List** - Chronological view of all upcoming events
- 🧭 **One-Tap Navigation** - Opens Google/Apple Maps with directions
- 🔄 **Real-Time Data** - Automatically syncs with Bulls Connect
- 📱 **Cross-Platform** - Works on iOS and Android

## Quick Start

### Easy Way (Recommended)

**Terminal 1 - Start Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Start Frontend:**
```bash
./start-frontend.sh
```

### Manual Setup

See [SETUP.md](SETUP.md) for detailed instructions.

## Tech Stack

### Frontend
- React Native 0.73 with Expo SDK 50
- React Native Maps (Google Maps/Apple Maps)
- React Navigation 6
- Axios for API calls

### Backend
- Node.js + Express
- Bulls Connect API integration
- Node-cache for performance
- CORS enabled for mobile access

### Data Source
- Bulls Connect Event API
- Custom USF location mapping (10+ campus buildings)

## Project Structure

```
/backend              - Node.js Express API server
  server.js           - Main server with API endpoints
  usfLocations.json   - USF campus building coordinates
  package.json        - Backend dependencies

/frontend             - React Native Expo app
  /screens            - Map and List screens
  /services           - API integration
  App.js              - Main app component
  package.json        - Frontend dependencies

SETUP.md              - Detailed setup instructions
FEATURES.md           - Complete feature documentation
```

## API Endpoints

- `GET /api/events` - All upcoming events with coordinates
- `GET /api/events/today` - Today's events only
- `GET /api/events/location/:name` - Events at specific location
- `GET /api/locations` - All USF campus locations
- `GET /health` - Server health check

## Screenshots

### Map View
- Shows USF campus with event markers
- Green pins = physical locations
- Blue pins = virtual events
- Tap to see details

### Event List
- Chronological event listing
- Shows time, location, organizer
- One-tap navigation
- Pull to refresh

## Impact

This app improves student life at USF by:
- **Increasing Engagement** - Makes it easy to discover campus events
- **Reducing Confusion** - Clear location info and navigation
- **Saving Time** - No more searching multiple sources for events
- **Building Community** - Helps students find events near them

## Future Enhancements

- Event filtering by category/tags
- Calendar integration
- Event reminders/notifications
- Favorites and bookmarks
- Social features (friends attending, RSVP)
- Offline support
- Accessibility improvements

## Development Team

Built for HackJam 2025 - Track #1: Tech for Good / USF

## Documentation

- [Setup Guide](SETUP.md) - How to run the app
- [Feature Documentation](FEATURES.md) - Complete feature list
- Code comments throughout

## License

MIT License - Built for educational purposes at HackJam 2025
