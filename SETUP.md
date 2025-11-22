# Setup Guide - USF Events Map

Follow these steps to get the app running for HackJam 2025!

## Prerequisites

- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

You should see: `🚀 Server running on http://localhost:3000`

Keep this terminal window open!

### 2. Frontend Setup

Open a **NEW terminal window**:

```bash
cd frontend
npm install
npx expo start
```

### 3. Test on Your Phone

1. Make sure your phone and computer are on the **same WiFi network**
2. Open the Expo Go app on your phone
3. Scan the QR code from the terminal

## Important Configuration

### Testing on Physical Device

If testing on your phone instead of a simulator:

1. Find your computer's IP address:
   - **Mac/Linux**: Open Terminal and run `ifconfig | grep inet`
   - **Windows**: Open Command Prompt and run `ipconfig`
   - Look for something like `192.168.1.XXX`

2. Update the API URL in [frontend/services/api.js](frontend/services/api.js):
   ```javascript
   const API_BASE_URL = 'http://YOUR-IP-HERE:3000/api';
   // Example: 'http://192.168.1.100:3000/api'
   ```

### Google Maps API Key (Optional)

For production use, you'll need a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Maps SDK for iOS and Android
4. Create credentials (API Key)
5. Update [frontend/app.json](frontend/app.json) with your API key

**For the hackathon**: The app will work without this on iOS (uses Apple Maps). Android requires it.

## Testing the Backend

Test if the backend is working:

```bash
curl http://localhost:3000/api/events
```

You should see JSON data with USF events!

## Troubleshooting

### "Network request failed"

- Make sure backend is running (`npm start` in backend folder)
- Check that you updated the IP address in `frontend/services/api.js`
- Both phone and computer must be on same WiFi

### "Unable to resolve module"

```bash
cd frontend
rm -rf node_modules
npm install
npx expo start --clear
```

### Maps not showing

- For iOS: Should work out of the box
- For Android: You need a Google Maps API key (see above)

### Events not loading

- Check backend console for errors
- Verify Bulls Connect website is accessible
- Try clearing the cache by restarting the backend

## Development Tips

### Hot Reload

- Save any file in the frontend folder
- App will automatically reload on your phone!

### Debugging

- Shake your phone to open Expo developer menu
- Select "Debug Remote JS" to use Chrome DevTools

### Adding More USF Locations

Edit [backend/usfLocations.json](backend/usfLocations.json) to add more campus locations:

```json
{
  "name": "Building Name",
  "aliases": ["Nickname", "Abbreviation"],
  "latitude": 28.XXXX,
  "longitude": -82.XXXX,
  "address": "Full address"
}
```

## Features

- ✅ Map view with event markers
- ✅ Click locations to see events
- ✅ List view of all events
- ✅ Navigate to event locations
- ✅ Real-time data from Bulls Connect
- ✅ Auto-refresh events

## Next Steps

Ideas to expand the app:

- Filter events by category/tag
- Add event to calendar
- Share events with friends
- Event reminders/notifications
- Search functionality
- User favorites
- Dark mode

Good luck with your HackJam presentation! 🎉
