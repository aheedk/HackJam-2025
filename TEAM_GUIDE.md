# Team Guide - USF Events Map

## What We Built

A full-stack mobile app that shows USF Bulls Connect events on an interactive map with one-tap navigation to event locations.

## Quick Start for Team Members

### First Time Setup

1. **Clone/Access the project:**
   ```bash
   cd HackJam-2025
   ```

2. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Version 16+ required

3. **Install Expo Go on your phone:**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Running the App

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

**On your phone:**
- Open Expo Go
- Scan the QR code
- App will load!

## File Structure Overview

```
HackJam-2025/
│
├── backend/                    # Backend API server
│   ├── server.js              # Main server code
│   ├── usfLocations.json      # Campus building coordinates
│   └── package.json           # Dependencies
│
├── frontend/                  # Mobile app
│   ├── App.js                 # Main app entry point
│   ├── screens/               # Screen components
│   │   ├── MapScreen.js       # Map view with markers
│   │   └── ListScreen.js      # Event list view
│   ├── services/              # API integration
│   │   └── api.js             # Backend API calls
│   └── package.json           # Dependencies
│
├── README.md                  # Project overview
├── SETUP.md                   # Detailed setup instructions
├── FEATURES.md                # Feature documentation
├── PITCH.md                   # Presentation guide
├── TESTING.md                 # Testing checklist
└── TEAM_GUIDE.md             # This file
```

## Key Files Explained

### Backend Files

**server.js** - The heart of the backend:
- Scrapes Bulls Connect API
- Matches text locations to GPS coordinates
- Caches events for 15 minutes
- Provides REST API endpoints

**usfLocations.json** - Location database:
- 10+ USF campus buildings
- Each has name, coordinates, aliases
- Easy to add more locations

### Frontend Files

**App.js** - Main entry point:
- Sets up navigation (tab bar)
- Configures Map and List tabs
- USF green color scheme

**MapScreen.js** - Map view:
- Shows USF campus map
- Displays event markers
- Handles marker taps
- Opens event details modal
- Navigation integration

**ListScreen.js** - List view:
- Shows all events chronologically
- Pull-to-refresh
- Navigate to each event
- Formats dates nicely

**api.js** - Backend communication:
- All API calls centralized here
- Easy to update backend URL
- Error handling

## How It Works

### Data Flow

1. **Backend scrapes Bulls Connect** every 15 minutes
2. **Location matching** converts "Marshall Student Center" → GPS coordinates
3. **Events cached** for performance
4. **Frontend requests** events via API
5. **Map displays** markers at GPS coordinates
6. **User taps** marker → sees events → navigates

### Location Matching Algorithm

```javascript
Text Location → Check for virtual keywords
            → Check known location names
            → Check aliases (MSC, JPH, etc.)
            → Default to Marshall Student Center
            → Return GPS coordinates
```

### Key Technologies

**Backend:**
- Express.js for API server
- Axios for HTTP requests
- Node-cache for caching
- CORS for mobile access

**Frontend:**
- React Native (cross-platform)
- Expo (easy deployment)
- React Native Maps
- React Navigation

## Making Changes

### Add a New Campus Location

Edit [backend/usfLocations.json](backend/usfLocations.json):

```json
{
  "name": "New Building",
  "aliases": ["NB", "Building Abbreviation"],
  "latitude": 28.XXXX,
  "longitude": -82.XXXX,
  "address": "Street Address"
}
```

Restart backend to apply changes.

### Change Backend URL

Edit [frontend/services/api.js](frontend/services/api.js):

```javascript
const API_BASE_URL = 'http://YOUR-IP:3000/api';
```

For physical device testing, use your computer's IP address.

### Customize Colors

Colors defined in screen files:

```javascript
// USF Green
backgroundColor: '#006747'

// Change to any color you want
```

### Add New API Endpoint

In [backend/server.js](backend/server.js):

```javascript
app.get('/api/your-endpoint', async (req, res) => {
  // Your code here
  res.json({ data: 'your response' });
});
```

## Team Roles

### Frontend Developer
**Focus areas:**
- [frontend/screens/](frontend/screens/) - UI components
- [frontend/App.js](frontend/App.js) - Navigation
- Styling and user experience
- Testing on different devices

**Key tasks:**
- Polish UI/UX
- Add loading states
- Improve error messages
- Test on iOS and Android

### Backend Developer
**Focus areas:**
- [backend/server.js](backend/server.js) - API logic
- [backend/usfLocations.json](backend/usfLocations.json) - Location data
- API endpoints
- Data processing

**Key tasks:**
- Optimize location matching
- Add more campus buildings
- Improve error handling
- Monitor API performance

### Presenter
**Focus areas:**
- [PITCH.md](PITCH.md) - Presentation guide
- [README.md](README.md) - Project overview
- Demo preparation
- Story telling

**Key tasks:**
- Practice demo flow
- Prepare for questions
- Test on presentation device
- Create backup plan

### Tester
**Focus areas:**
- [TESTING.md](TESTING.md) - Test checklist
- Quality assurance
- Bug finding
- User experience

**Key tasks:**
- Complete testing checklist
- Document bugs
- Verify fixes
- Pre-demo smoke test

## Common Tasks

### Update Event Data

Events update automatically every 15 minutes. To force refresh:

**Option 1:** Pull down on list view in app

**Option 2:** Restart backend

### Debug Backend Issues

```bash
cd backend
npm start
```

Watch console for error messages. Test with:

```bash
curl http://localhost:3000/api/events
```

### Debug Frontend Issues

1. Shake phone to open Expo menu
2. Select "Debug Remote JS"
3. Opens Chrome DevTools
4. Check Console tab for errors

### Fix Network Issues

**Problem:** "Network request failed"

**Solution:**
1. Check backend is running
2. Update IP in [frontend/services/api.js](frontend/services/api.js)
3. Confirm same WiFi network
4. Disable VPN if active

## Pre-Presentation Checklist

- [ ] Backend running and tested
- [ ] Frontend on presenter's phone
- [ ] Phone charged (80%+)
- [ ] Tested full demo flow
- [ ] Backup phone available
- [ ] Screenshots taken (backup)
- [ ] Team knows their talking points
- [ ] Practiced 3-minute demo
- [ ] Know answers to common questions

## Demo Day Tips

### Setup (30 min before)

1. Start backend on laptop
2. Test API with curl
3. Load app on phone
4. Test complete user flow
5. Have backup phone ready

### During Demo

**Do:**
- Speak clearly and confidently
- Show the problem → solution → impact
- Let the app speak for itself
- Be enthusiastic
- Make eye contact with judges

**Don't:**
- Apologize for bugs (unless it crashes)
- Spend too long on one feature
- Read from notes
- Talk too fast
- Forget to smile!

### If Something Breaks

**Plan A:** Use backup phone

**Plan B:** Switch to simulator on laptop

**Plan C:** Show screenshots and explain

**Plan D:** Focus on code/architecture instead

## Extending the App

### Easy Additions (< 1 hour)

- Add more campus locations to JSON
- Change color scheme
- Add event categories filter
- Show event images
- Add "Today" filter button

### Medium Additions (2-4 hours)

- Search functionality
- Event categories/tags
- Calendar integration
- Favorites system
- Share events

### Advanced Additions (4+ hours)

- User authentication
- RSVP integration
- Push notifications
- Offline support
- Social features

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Express.js Docs](https://expressjs.com/)

### Our Docs
- [README.md](README.md) - Overview
- [SETUP.md](SETUP.md) - Setup instructions
- [FEATURES.md](FEATURES.md) - Feature details
- [PITCH.md](PITCH.md) - Presentation guide
- [TESTING.md](TESTING.md) - Testing checklist

### Getting Help

**During Hackathon:**
- Check error messages in terminal
- Use console.log() for debugging
- Test API with curl
- Ask teammates!

**General:**
- Check our documentation
- Google error messages
- React Native/Expo communities
- Stack Overflow

## Victory Conditions

You'll know you're ready when:

✅ Backend serves events with coordinates
✅ Map shows markers on phone
✅ Tapping markers shows events
✅ Navigation opens Maps app
✅ List view displays all events
✅ Team can explain how it works
✅ Can demo smoothly in 3 minutes
✅ Have backup plan ready

## Final Thoughts

You've built a full-stack mobile app in a hackathon. That's impressive!

Key achievements:
- Real-time data scraping
- Location-based services
- Cross-platform mobile app
- RESTful API
- Smart location matching
- Intuitive UX

This solves a real problem for USF students. Be proud of what you built!

**Good luck with your presentation!** 🎉

---

*Remember: The best demo is one that shows real value. Focus on the problem you solved and how students will use this.*
