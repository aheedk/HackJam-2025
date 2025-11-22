# Contributing to USF Events Map

Thank you for your interest in improving the USF Events Map!

## Development Setup

1. Fork the repository
2. Clone your fork
3. Follow the [Quick Start Guide](QUICKSTART.md)
4. Create a new branch for your feature

```bash
git checkout -b feature/your-feature-name
```

## Project Structure

```
HackJam-2025/
├── server/
│   └── index.js              # Express backend server
├── client/
│   └── src/
│       ├── components/       # React components
│       │   ├── MapView.jsx   # Map view component
│       │   ├── MapView.css
│       │   ├── ListView.jsx  # List view component
│       │   └── ListView.css
│       ├── App.jsx           # Main app with routing
│       └── main.jsx          # Entry point
└── README.md
```

## Areas for Contribution

### High Priority
- [ ] Mobile app version (React Native)
- [ ] Event registration/RSVP system
- [ ] Google Maps Geocoding API integration for precise coordinates
- [ ] Calendar export (iCal, Google Calendar)
- [ ] Better error handling and loading states

### Features
- [ ] Dark mode toggle
- [ ] User favorites/bookmarks
- [ ] Share events on social media
- [ ] Directions to events (Google Maps integration)
- [ ] Filter by organization
- [ ] Filter by event type
- [ ] Time-based filtering (today, this week, etc.)
- [ ] Event reminders/notifications

### UI/UX Improvements
- [ ] Better mobile responsive design
- [ ] Animations and transitions
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Multiple map style options
- [ ] Custom event pin icons by category
- [ ] Clustering for multiple events at same location

### Backend Improvements
- [ ] Database for caching (Redis, MongoDB)
- [ ] Event details scraping
- [ ] User authentication (Google OAuth, etc.)
- [ ] Rate limiting
- [ ] API pagination
- [ ] Webhook for real-time event updates

## Code Style

- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Add comments for complex logic
- Use meaningful variable names

## Testing

Currently, there are no automated tests. This would be a great contribution!

Potential testing additions:
- Unit tests for components (Jest + React Testing Library)
- Integration tests for API endpoints
- E2E tests (Cypress, Playwright)

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the QUICKSTART.md if you change setup/run instructions
3. Test your changes locally
4. Create a pull request with a clear description of changes
5. Reference any related issues

## Adding New Campus Locations

To add more known USF locations for better geocoding, edit [server/index.js](server/index.js):

```javascript
const USF_LOCATIONS = {
  'new building': {
    lat: 28.xxxx,
    lng: -82.xxxx,
    name: 'New Building Name'
  },
  // ... more locations
};
```

## API Integration

The app uses Bulls Connect's mobile API:
- Endpoint: `https://bullsconnect.usf.edu/mobile_ws/v17/mobile_events_list`
- No authentication required
- Returns events in positional array format (p0, p1, p2...)

## Questions?

Open an issue or reach out to the maintainers!

---

Built for HackJam 2025 - Track #1: Tech for Good / USF
