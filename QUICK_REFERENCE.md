# Quick Reference - USF Events Map

## 🚀 Start the App

```bash
# Terminal 1
./start-backend.sh

# Terminal 2
./start-frontend.sh
```

## 📱 Test the App

1. Open Expo Go on phone
2. Scan QR code
3. Tap marker → see events → navigate

## 🔧 Important Files

| File | Purpose |
|------|---------|
| `backend/server.js` | API server code |
| `backend/usfLocations.json` | Campus building coordinates |
| `frontend/screens/MapScreen.js` | Map view UI |
| `frontend/screens/ListScreen.js` | List view UI |
| `frontend/services/api.js` | Backend connection |

## 🌐 API Endpoints

```bash
# All events
curl http://localhost:3000/api/events

# Today's events
curl http://localhost:3000/api/events/today

# Events at location
curl http://localhost:3000/api/events/location/marshall

# All locations
curl http://localhost:3000/api/locations

# Health check
curl http://localhost:3000/health
```

## 🐛 Common Fixes

**"Network request failed"**
```javascript
// Update frontend/services/api.js
const API_BASE_URL = 'http://YOUR-IP:3000/api';
```

**Module errors**
```bash
cd frontend
rm -rf node_modules
npm install
npx expo start --clear
```

**Backend not starting**
```bash
cd backend
npm install
npm start
```

## 📍 Add Campus Location

Edit `backend/usfLocations.json`:
```json
{
  "name": "Building Name",
  "aliases": ["Abbreviation"],
  "latitude": 28.XXXX,
  "longitude": -82.XXXX,
  "address": "Street Address"
}
```

## 🎨 Change Colors

Find in screen files:
```javascript
// USF Green
'#006747'

// Replace with your color
'#YOUR_COLOR'
```

## 📊 Project Stats

- **Lines of Code:** ~1,200
- **Files Created:** 20+
- **Features:** 8 core features
- **Tech Stack:** React Native, Node.js, Express
- **Build Time:** HackJam 2025
- **Platform:** iOS + Android

## ✅ Pre-Demo Checklist

- [ ] Backend running
- [ ] App on phone
- [ ] Phone charged
- [ ] WiFi connected
- [ ] Tested map view
- [ ] Tested list view
- [ ] Tested navigation
- [ ] Backup ready

## 💡 30-Second Pitch

"We built a mobile app that shows all USF Bulls Connect events on an interactive map. Students can tap locations to see what's happening there and get one-tap navigation to any event. It's like Google Maps for campus events."

## 🎯 Key Features

1. Interactive map with event markers
2. Location-based event discovery
3. One-tap navigation
4. Chronological event list
5. Pull-to-refresh
6. Real-time Bulls Connect data
7. Cross-platform (iOS + Android)
8. Smart location matching

## 📚 Documentation

- `README.md` - Project overview
- `SETUP.md` - Setup guide
- `FEATURES.md` - Feature details
- `PITCH.md` - Presentation guide
- `TESTING.md` - Test checklist
- `TEAM_GUIDE.md` - Team reference

## 🏆 What Makes This Special

✅ Solves real student problem
✅ Full-stack implementation
✅ Production-ready architecture
✅ Scalable to other campuses
✅ Built in one hackathon

## 📞 Emergency Contacts

**Backend Issues:** Check `backend/server.js` logs

**Frontend Issues:** Shake phone → Debug Remote JS

**Network Issues:** Update IP in `api.js`

**Demo Issues:** Use screenshots backup

---

**You got this!** 🎉
