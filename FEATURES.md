# USF Events Map - Feature Documentation

## Core Features

### 1. Interactive Map View 🗺️

**What it does:**
- Shows USF campus with event markers
- Each marker represents a location with events
- Green markers = physical locations
- Blue markers = virtual events
- Tap markers to see quick info

**User Flow:**
1. Open app → Map tab loads
2. See your current location (blue dot)
3. See event markers across campus
4. Tap marker → see location name + event count
5. Tap callout → open full event details modal

**Technical Details:**
- Uses React Native Maps with Google Maps
- Groups events by location coordinates
- Requests location permission on first load
- Centers on USF campus (28.0654, -82.4184)

### 2. Event Details Modal

**What it does:**
- Shows all events at a selected location
- Lists event name, time, organizer
- Provides navigation button

**Features:**
- Swipe down to close
- Scrollable event list
- "Navigate Here" button opens Google/Apple Maps
- Shows address
- Virtual events = no navigation button

### 3. Event List View 📋

**What it does:**
- Shows all upcoming events in chronological order
- Displays key info for each event
- Quick navigation to event locations

**Features:**
- Pull-to-refresh to update events
- Shows relative dates (Today, Tomorrow, Wednesday)
- Displays time, location, organizer
- Event descriptions (truncated)
- "Navigate to Event" button per event

**Sorting:**
- Events sorted by start date (earliest first)
- Past events are still shown if in API

### 4. Navigation Integration 🧭

**What it does:**
- Opens device's map app with event location
- Works with Google Maps and Apple Maps
- Provides turn-by-turn directions

**User Flow:**
1. Click "Navigate to Event" or "Navigate Here"
2. Opens external map app
3. Shows route from current location to event

**Technical:**
- Uses `Linking.openURL()` with geo coordinates
- Format: `https://maps.google.com/?q=LAT,LONG`
- Automatically opens preferred map app

### 5. Real-time Event Data ⚡

**How it works:**
- Backend scrapes Bulls Connect every 15 minutes
- Events cached to reduce server load
- Pull-to-refresh to force update

**Data Shown:**
- Event name
- Description
- Date & time
- Location (text + coordinates)
- Organizer/Organization
- Event image (if available)

## Backend API

### Endpoints

**GET /api/events**
- Returns all upcoming events
- Cached for 15 minutes
- Includes location coordinates

**GET /api/events/today**
- Returns only today's events
- Useful for "happening now" feature

**GET /api/events/location/:locationName**
- Returns events at specific location
- Example: `/api/events/location/marshall`

**GET /api/locations**
- Returns all known USF locations with coordinates
- Used for location matching

### Location Matching Algorithm

The backend matches text locations to coordinates:

1. Check for virtual event keywords (zoom, online, virtual)
2. Match against known location names
3. Match against location aliases
4. Default to Marshall Student Center if no match

**Known Locations:**
- Marshall Student Center
- Library
- Recreation Center
- Juniper Poplar Hall
- Cooper Hall
- Engineering Building
- Business Building
- Sun Dome
- Student Services
- The Oval

## User Experience

### Color Scheme

- Primary: `#006747` (USF Green)
- Background: `#f5f5f5` (Light gray)
- Text: `#333` (Dark gray)
- Secondary text: `#666`
- Links: `#006747`

### Permissions

**Location Permission:**
- Requested on app launch
- Used to show user position on map
- Not required for core functionality
- Can deny and still see events

### Loading States

- Spinner + "Loading events..." message
- Shown while fetching data
- Pull-to-refresh animation

### Error Handling

- Network errors → Alert dialog
- No events → "No events found" message
- Location permission denied → Alert with explanation

## Future Enhancements

### Potential Features:

1. **Event Filters**
   - By category/tags
   - By date range
   - By organization
   - Virtual vs in-person

2. **Search**
   - Search events by name
   - Search by keyword
   - Search by organization

3. **Calendar Integration**
   - Add event to device calendar
   - Set reminders

4. **Favorites**
   - Save favorite events
   - Get notifications

5. **Social Features**
   - Share events
   - See friends attending
   - RSVP integration

6. **Personalization**
   - Follow organizations
   - Suggested events
   - Event history

7. **Offline Support**
   - Cache events locally
   - Work without internet

8. **Accessibility**
   - Screen reader support
   - High contrast mode
   - Font size options

## Technical Stack

### Frontend
- **Framework:** React Native 0.73
- **Navigation:** React Navigation 6.x
- **Maps:** React Native Maps
- **HTTP:** Axios
- **Development:** Expo SDK 50

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **HTTP Client:** Axios
- **Caching:** node-cache
- **CORS:** Enabled for mobile access

### Data Source
- Bulls Connect API
- Endpoint: `bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list`
- Format: JSON

## Performance

### Optimization Strategies

1. **Backend Caching**
   - 15-minute cache TTL
   - Reduces API calls to Bulls Connect
   - Faster response times

2. **Event Grouping**
   - Groups events by location
   - Reduces marker clutter
   - Better map performance

3. **Lazy Loading**
   - FlatList for efficient rendering
   - Only renders visible items

4. **Image Optimization**
   - Could add image caching (future)
   - Currently uses Bulls Connect URLs

## Deployment

### Development
- Backend: `npm start` on localhost:3000
- Frontend: `npx expo start` with Expo Go

### Production Options

**Backend:**
- Deploy to Heroku, Railway, or Render
- Set environment variable for production
- Enable HTTPS

**Frontend:**
- Build with Expo EAS
- Publish to App Store / Play Store
- Or use Expo Go for testing

## Security

**Current Considerations:**
- No authentication required
- Public data only
- No user data stored
- CORS enabled for mobile access

**Future Security:**
- Rate limiting
- API key for mobile app
- User authentication if needed
- Secure HTTPS backend

## Accessibility

**Current:**
- Semantic component usage
- Touchable elements properly sized
- Color contrast for readability

**Needs:**
- Screen reader labels
- Keyboard navigation
- Voice control support

## Browser/Platform Support

- **iOS:** 13.0+
- **Android:** 5.0+
- **Expo Go:** Required for development
- **Maps:** Google Maps (Android), Apple Maps (iOS)
