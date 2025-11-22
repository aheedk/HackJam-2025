# Quick Start Guide

Get the USF Events Map running in 3 simple steps!

## Prerequisites
- Node.js 18+ installed
- Internet connection (to fetch events from Bulls Connect)

## Installation & Running

### Step 1: Install Dependencies
```bash
# From the project root
npm install
cd client && npm install && cd ..
```

Or use the convenience command:
```bash
npm run install-all
```

### Step 2: Start the Application
```bash
# From the project root - this starts both backend and frontend
npm run dev
```

This will:
- Start the backend server on `http://localhost:3001`
- Start the frontend dev server on `http://localhost:5173`

### Step 3: Open in Browser
Navigate to: **http://localhost:5173**

## What You'll See

### Map View (Home)
- Interactive map of USF Tampa campus
- Event markers showing locations
- Click markers to see events at that location
- Filter events by date
- Refresh button to get latest events

### List View
- Card-based grid of all events
- Search events by name, organization, or location
- Filter by event category
- Responsive design

## Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use:

1. Stop the process using that port
2. Or change the port in `.env`:
   ```env
   PORT=3002
   ```

### Backend Not Loading Events
- Check your internet connection
- The Bulls Connect API must be accessible
- Check console for error messages

### Frontend Can't Connect to Backend
- Make sure the backend is running on port 3001
- Check that CORS is enabled (it's configured by default)

## Running Backend & Frontend Separately

If you prefer to run them in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Building for Production

### Build Frontend
```bash
cd client
npm run build
```

The production build will be in `client/dist/`

### Serve Production Build
```bash
cd client
npm run preview
```

## Testing the API

Test if the backend is working:
```bash
curl http://localhost:3001/api/events
```

Should return JSON array of events.

## Need Help?

See the main [README.md](README.md) for:
- Detailed architecture
- API documentation
- Feature list
- Future enhancements

---

Happy hacking! 🐂
