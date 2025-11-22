# USF Events Map

An interactive web application that visualizes University of South Florida campus events on an interactive map. Built for HackJam 2025 - Track #1: Tech for Good / USF.

![USF Bulls Logo](https://www.usf.edu/images/usf-logo.svg)

## Features

- **Interactive Map View**: Visualize all campus events on an interactive map of USF Tampa campus
- **List View**: Browse events in a card-based grid layout similar to Bulls Connect
- **Real-time Data**: Fetches live event data from Bulls Connect API
- **Smart Location Mapping**: Automatically geocodes event locations to campus buildings
- **Filtering & Search**:
  - Filter events by date
  - Filter by event category
  - Search by event name, organization, or location
- **Event Details**: View comprehensive information including:
  - Event name and description
  - Date and time
  - Location on campus
  - Hosting organization
  - Attendee count
  - Capacity status
  - Event images

## Tech Stack

### Frontend

- **React 19** - UI framework
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **React Leaflet** - React wrapper for Leaflet
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Axios** - HTTP client for API requests
- **Node-Cache** - In-memory caching (15 min TTL)
- **CORS** - Cross-origin resource sharing

## Project Structure

```
HackJam-2025/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.jsx      # Interactive map component
│   │   │   ├── MapView.css
│   │   │   ├── ListView.jsx     # List view component
│   │   │   └── ListView.css
│   │   ├── App.jsx              # Main app with routing
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── server/
│   └── index.js            # Express server & API
├── package.json            # Root package.json
├── .env.example           # Environment variables template
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd HackJam-2025
```

### Step 2: Install Dependencies

Install both backend and frontend dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

Or use the convenience script:

```bash
npm run install-all
```

### Step 3: Environment Variables (Optional)

Create a `.env` file in the root directory:

```bash
touch .env
```

The server will run on port 3001 by default. You can modify this in `.env`:

```env
PORT=3001
```

#### Getting Full Location Details (Required for Private Locations)

To get full location details instead of "Private Location (sign in to display)", add your Bulls Connect session cookies:

1. Log in to https://bullsconnect.usf.edu in your browser
2. Open Developer Tools (F12 or Right-click > Inspect)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Navigate to **Cookies** > `bullsconnect.usf.edu`
5. Copy **all** cookies - you'll need to format them as a cookie string:
   - Look for cookies like `PHPSESSID`, `session`, `auth`, `csrf_token`, etc.
   - Copy them in the format: `cookie1=value1; cookie2=value2; cookie3=value3`
   - Or copy the entire cookie string from the browser's Network tab when making a request
6. Add it to your `.env` file:

```env
BULLSCONNECT_COOKIE=PHPSESSID=abc123; csrf_token=xyz789; session=def456
```

**Alternative method (easier):**

1. After logging in, open Network tab in Developer Tools
2. Make any request to bullsconnect.usf.edu (refresh the page)
3. Click on any request and look at the **Request Headers**
4. Find the `Cookie:` header
5. Copy the entire value after `Cookie: `
6. Paste it into your `.env` file

**Important Notes:**

- **Each user needs their own cookie** - Cookies are tied to individual login sessions, so each person using the app needs to get their own cookie from their own Bulls Connect login
- **Cookies expire** - Session cookies typically expire after a few hours or when you log out, so you may need to update this periodically
- **For production use** - Consider implementing user authentication directly in the app so users can log in without manually copying cookies

After updating your cookie, restart the server and click "Refresh" in the app.

### Step 4: Run the Application

From the root directory, run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Backend:**

```bash
npm run server
```

**Terminal 2 - Frontend:**

```bash
npm run client
```

### Step 5: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/events

## API Endpoints

### GET /api/events

Fetches all events from Bulls Connect with geocoded coordinates.

**Response:**

```json
[
  {
    "id": "event_id",
    "uid": "event_uid",
    "name": "Event Name",
    "datetime": "Day, Month Date, Year Start Time – End Time",
    "category": "Meeting",
    "location": "Marshall Student Center",
    "coordinates": {
      "lat": 28.065,
      "lng": -82.4194,
      "name": "Marshall Student Center"
    },
    "organizationName": "Student Organization",
    "attendeeCount": 25,
    "imageUrl": "https://...",
    "capacityStatus": "22 Spots Left"
  }
]
```

### GET /api/health

Health check endpoint.

## How It Works

1. **Data Fetching**: The backend server fetches event data from Bulls Connect's mobile API endpoint
2. **Location Geocoding**: Event locations are matched against a dictionary of known USF campus buildings
3. **Caching**: Events are cached for 15 minutes to reduce API calls and improve performance
4. **Map Visualization**: Events are displayed as markers on an interactive Leaflet map
5. **Grouping**: Multiple events at the same location are grouped under a single pin
6. **User Interaction**: Users can click pins to see all events at that location, or switch to list view for a different perspective

## Known USF Locations

The app includes a pre-configured dictionary of common USF campus locations:

- Marshall Student Center (MSC)
- Cooper Hall
- USF Library
- Campus Recreation Center
- Yuengling Center (Sun Dome)
- Juniper-Poplar Hall (JPop)
- The Village
- Beta Hall
- And more...

## Future Enhancements

- [ ] Mobile app version (React Native)
- [ ] User authentication and event registration
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Push notifications for upcoming events
- [ ] Favorites/bookmarking system
- [ ] Directions to event locations
- [ ] Social features (share events, invite friends)
- [ ] Event check-in via QR codes
- [ ] Integration with Google Maps Geocoding API for more precise locations
- [ ] Dark mode

## Contributing

This project was created for HackJam 2025. Contributions, issues, and feature requests are welcome!

## License

MIT

## Acknowledgments

- University of South Florida
- Bulls Connect
- HackJam 2025 organizers
- OpenStreetMap contributors

## Contact

For questions or feedback about this project, please open an issue on GitHub.

---

**Built with ❤️ for the USF community**
