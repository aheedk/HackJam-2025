# Testing Checklist - USF Events Map

## Pre-Demo Testing

Complete this checklist before your hackathon presentation!

## Backend Testing

### 1. Server Starts Successfully

```bash
cd backend
npm install
npm start
```

**Expected Output:**
```
🚀 Server running on http://localhost:3000
📍 USF Events API ready!
```

✅ Server running
✅ No error messages
✅ Port 3000 is available

### 2. Health Check

```bash
curl http://localhost:3000/health
```

**Expected:** `{"status":"ok"}`

✅ Health endpoint responds

### 3. Events API

```bash
curl http://localhost:3000/api/events
```

**Expected:**
- JSON response with `success: true`
- Array of events with proper structure
- Each event has: id, name, location, locationCoords, startsOn

✅ Events endpoint works
✅ Events have location coordinates
✅ Response time < 2 seconds

### 4. Locations API

```bash
curl http://localhost:3000/api/locations
```

**Expected:**
- List of USF locations
- Each has: name, latitude, longitude, address

✅ Locations endpoint works

### 5. Cache Working

Run events API twice in quick succession:

```bash
curl http://localhost:3000/api/events
# Wait 1 second
curl http://localhost:3000/api/events
```

**Check backend console:**
- First call: "Cache miss - fetching new events"
- Second call: "Cache hit - returning cached events"

✅ Caching works correctly

## Frontend Testing

### 1. App Starts Successfully

```bash
cd frontend
npm install
npx expo start
```

**Expected:**
- QR code appears
- No red error messages
- Development server runs

✅ Expo starts
✅ No bundling errors

### 2. Device Connection

**On your phone:**
- Open Expo Go app
- Scan QR code
- App loads

✅ App opens on phone
✅ No crash on launch

### 3. Map View Tests

#### Test 3.1: Map Loads

**Expected:**
- Map appears showing USF campus
- Your location appears (blue dot) - if permission granted
- Loading spinner shows while fetching events

✅ Map renders
✅ Campus centered correctly
✅ Loading state shows

#### Test 3.2: Event Markers

**Expected:**
- Green pins appear on map
- Pins at multiple locations
- Blue pins for virtual events

✅ Markers appear
✅ Multiple locations shown
✅ Correct marker colors

#### Test 3.3: Marker Tap

**Actions:**
1. Tap a marker

**Expected:**
- Callout appears above marker
- Shows location name
- Shows event count
- Shows "Tap for details"

✅ Callout shows
✅ Information is accurate

#### Test 3.4: Event Details Modal

**Actions:**
1. Tap marker
2. Tap callout

**Expected:**
- Modal slides up from bottom
- Shows location name and address
- Shows "Navigate Here" button (if not virtual)
- Lists all events at that location
- Each event shows: name, time, organizer

✅ Modal opens
✅ All information displays
✅ Events are listed

#### Test 3.5: Close Modal

**Actions:**
1. Tap X button
2. OR swipe down on modal

**Expected:**
- Modal closes smoothly
- Returns to map view

✅ Modal closes

#### Test 3.6: Navigation

**Actions:**
1. Open event modal
2. Tap "Navigate Here"

**Expected:**
- Phone prompts to open Maps app
- Maps opens with location marked
- Route shows from current location

✅ Maps app opens
✅ Correct location shown

### 4. List View Tests

#### Test 4.1: Switch to List Tab

**Actions:**
1. Tap "List" tab at bottom

**Expected:**
- Switches to list view
- Shows loading state
- Events appear in list

✅ Tab switches
✅ List loads

#### Test 4.2: Event List Content

**Expected:**
- Events sorted by date (earliest first)
- Each card shows:
  - Event name
  - Date & time (with relative labels: Today, Tomorrow)
  - Location
  - Organizer
  - Navigate button (if not virtual)

✅ Events display correctly
✅ Sorting is correct
✅ All info shows

#### Test 4.3: Pull to Refresh

**Actions:**
1. Pull down on list

**Expected:**
- Refresh animation
- Events reload
- List updates

✅ Pull to refresh works

#### Test 4.4: Navigate from List

**Actions:**
1. Tap "Navigate to Event" on an event

**Expected:**
- Maps app opens
- Shows event location

✅ Navigation works from list

### 5. Cross-Feature Tests

#### Test 5.1: Data Consistency

**Check:**
- Same events appear in map and list
- Event counts match
- Information is consistent

✅ Data matches across views

#### Test 5.2: Tab Switching

**Actions:**
1. Switch between Map and List tabs multiple times

**Expected:**
- No crashes
- Data persists
- Smooth transitions

✅ Tab switching works smoothly

#### Test 5.3: Location Permission

**If permission granted:**
- Blue dot shows on map
- Map can center on your location

**If permission denied:**
- App still works
- Map shows campus
- No crashes

✅ Permission handling works

## Network Testing

### Test: Backend Down

**Actions:**
1. Stop backend server
2. Pull to refresh in app

**Expected:**
- Alert shows "Failed to load events"
- App doesn't crash
- Can retry

✅ Graceful error handling

### Test: Slow Network

**Actions:**
1. Enable slow 3G in phone settings
2. Load events

**Expected:**
- Loading indicator shows
- Eventually loads (or times out gracefully)
- No crash

✅ Handles slow network

## Edge Cases

### Test: No Events

**If Bulls Connect has no upcoming events:**

**Expected:**
- Map shows but no markers
- List shows "No events found"
- No crashes

✅ Empty state handled

### Test: Virtual Events Only

**Expected:**
- Blue markers on map
- No "Navigate Here" button in modal
- Shows "(Virtual)" in location

✅ Virtual events handled

## Performance Tests

### Test: Many Events

**Expected:**
- App remains responsive
- Map doesn't lag
- List scrolls smoothly

✅ Performs well with many events

### Test: Rapid Actions

**Actions:**
1. Quickly tap multiple markers
2. Open/close modals rapidly
3. Switch tabs quickly

**Expected:**
- No crashes
- UI remains responsive

✅ Handles rapid interaction

## Pre-Presentation Checklist

One hour before demo:

- [ ] Backend is running and responding
- [ ] Frontend is built and on phone
- [ ] Phone is charged (80%+)
- [ ] Connected to WiFi (or using hotspot)
- [ ] Tested basic flow (map → marker → modal → navigate)
- [ ] Tested list view and navigation
- [ ] Know your IP address (for API connection)
- [ ] Have backup plan (screenshots/simulator)

## Common Issues & Fixes

### Issue: "Network request failed"

**Fix:**
1. Check backend is running
2. Update IP address in `frontend/services/api.js`
3. Ensure phone and computer on same WiFi

### Issue: "Unable to resolve module"

**Fix:**
```bash
cd frontend
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: Maps don't show (Android)

**Fix:**
- Need Google Maps API key in `app.json`
- For demo, use iOS device or simulator

### Issue: No events showing

**Fix:**
1. Check backend logs for errors
2. Test backend directly: `curl http://localhost:3000/api/events`
3. Check Bulls Connect is accessible
4. Clear cache by restarting backend

### Issue: Location permission denied

**Fix:**
- Go to phone Settings → Apps → Expo Go → Permissions
- Enable Location
- Restart app

## Success Criteria

Your app is ready to demo when:

✅ Backend starts without errors
✅ Frontend loads on phone
✅ Map shows with event markers
✅ Can tap marker and see events
✅ Navigation opens Maps app
✅ List view shows all events
✅ Pull to refresh works
✅ No crashes during 5-minute demo

## Quick Smoke Test (2 minutes)

Before presenting:

1. Start backend ✓
2. Open app on phone ✓
3. See map with markers ✓
4. Tap one marker ✓
5. See event details ✓
6. Tap navigate ✓
7. Maps opens ✓
8. Switch to List tab ✓
9. See events ✓
10. Tap navigate on one event ✓

All working? **You're ready to present!** 🎉
