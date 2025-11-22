# USF Events Map - Hackathon Pitch Guide

## 30-Second Elevator Pitch

"We built a mobile app that solves event discovery at USF. Students can see all Bulls Connect events on an interactive map, click locations to see what's happening there, and get one-tap navigation to any event. It's like Google Maps, but specifically for USF campus events."

## 3-Minute Demo Flow

### 1. The Problem (30 seconds)

"As USF students, we noticed three main pain points:
- Students don't know what events are happening on campus
- It's hard to find where events are located
- Getting directions to unfamiliar buildings is frustrating

Bulls Connect exists, but it's just a list. There's no spatial context."

### 2. The Solution (30 seconds)

"We built USF Events Map - a mobile app that shows all campus events on an interactive map.

[Show phone screen]

See? Every green pin is a location with events. The map is centered on USF campus, and you can see your current location too."

### 3. Core Features Demo (90 seconds)

**Feature 1: Map View**
- "Let me tap this pin at Marshall Student Center..."
- "It shows there are 3 events here today"
- "Now I tap to see details..."

**Feature 2: Event Details**
- "Here's the modal with all events at this location"
- "I can see event names, times, and organizers"
- "And here's the magic - one tap to navigate"
- [Click Navigate Here]
- "It opens my map app with turn-by-turn directions"

**Feature 3: List View**
- "If I prefer a list view, I can switch tabs"
- "All events in chronological order"
- "Shows today's events first, then tomorrow, and so on"
- "Each event has a navigate button"
- "And pull-to-refresh updates the data"

### 4. Technical Achievement (30 seconds)

"This is a full-stack app:
- **Backend**: Node.js server that scrapes Bulls Connect API every 15 minutes
- **Location Matching**: We built an algorithm that converts text locations like 'MSC Room 123' into GPS coordinates
- **Frontend**: React Native with Expo - works on both iOS and Android
- Built in [X hours] for this hackathon"

## Key Talking Points

### Impact on Student Life

✅ **Increases Engagement**
- Makes event discovery effortless
- Students are more likely to attend when they can see what's nearby

✅ **Reduces Friction**
- No more copying addresses into Google Maps
- One tap from discovery to navigation

✅ **Improves Campus Navigation**
- Helps new students learn building locations
- Reduces "where is this?" confusion

### Technical Highlights

🔧 **Smart Location Matching**
- Handles various location formats
- Aliases for common abbreviations (MSC → Marshall Student Center)
- Falls back gracefully for unknown locations

🔧 **Performance Optimization**
- Backend caching reduces API calls
- Events grouped by location on map
- Fast load times

🔧 **Real-World Ready**
- Error handling for network issues
- Works offline with cached data
- Location permissions handled properly

### Scalability

📈 **Easy to Extend**
- Add more campus buildings to JSON file
- Filter by event categories
- Add calendar integration
- Push notifications for nearby events
- Social features (see who's going)

📈 **Multi-Campus Support**
- Could expand to USF St. Pete, Sarasota
- Same codebase works for any campus

## Questions You Might Get

### Q: How do you get event data?

"We use Bulls Connect's mobile API endpoint. Our backend scrapes it every 15 minutes and caches the results. This reduces load on their servers and makes our app faster."

### Q: What about locations that aren't in your database?

"Great question! We have 10+ major campus locations mapped. If we encounter an unknown location, we default to Marshall Student Center as a central meeting point. In production, we'd use Google's Geocoding API to handle any location."

### Q: Why build a new app instead of improving Bulls Connect?

"Our app complements Bulls Connect. We're adding a visual, map-based interface that makes spatial discovery easy. Students can still use Bulls Connect for RSVPs and event management."

### Q: How long did this take to build?

"We built the entire full-stack app during this hackathon - about [X hours]. The core features work now, and we have a roadmap for additional features."

### Q: Can other schools use this?

"Absolutely! The architecture is modular. You'd just need to:
1. Point to their event API
2. Update the location mapping for their campus
3. Adjust the map center coordinates

We could make this open source."

## Demo Backup Plans

### If WiFi Fails
- Show screenshots/screen recording
- Walk through code architecture
- Explain features with static images

### If Phone Dies
- Use simulator on laptop
- Have screenshots ready
- Focus on technical architecture

### If Backend Is Down
- Use cached data explanation
- Show code for API integration
- Explain how it works normally

## Closing Statement

"USF Events Map makes campus life better by removing friction from event discovery. Students can see what's happening, where it's happening, and get there with one tap.

This is just the MVP - imagine adding filters, favorites, calendar sync, and social features. We believe this could significantly increase student engagement with campus events.

Thank you! Questions?"

## Visual Aids Checklist

- [ ] Phone with app running
- [ ] Backup phone/charger
- [ ] Laptop with terminal showing backend logs
- [ ] Architecture diagram (if time permits)
- [ ] Screenshots of key features
- [ ] Team intro slide (optional)

## Timing Breakdown (for 5-minute presentation)

- Problem: 45 seconds
- Solution intro: 30 seconds
- Live demo: 2 minutes
- Technical details: 1 minute
- Impact & future: 45 seconds
- Questions: Remaining time

## Confidence Boosters

**You Built:**
- A full-stack mobile application
- Real-time data scraping
- Location-based services
- Cross-platform mobile app
- RESTful API
- Smart location matching algorithm

**You Solved:**
- Real problem students face daily
- Technical challenges (location matching, API integration)
- UX challenges (intuitive map interface)

**You Can Expand:**
- Clear roadmap for additional features
- Scalable architecture
- Production-ready with minor tweaks

## Good Luck! 🍀

Remember:
- Speak clearly and confidently
- Make eye contact with judges
- Show enthusiasm for the problem you solved
- Demonstrate the app smoothly
- Have fun - you built something cool!
