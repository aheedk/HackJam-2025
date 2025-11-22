import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Create custom numbered marker icon
function createNumberedIcon(count) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-pin">
             <span class="marker-number">${count}</span>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
}

// Utility function to parse HTML datetime string and extract clean text
function parseDateTime(htmlString) {
  if (!htmlString) return '';

  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = htmlString;

  // Extract text content and clean it up
  const text = temp.textContent || temp.innerText || '';
  return text.trim();
}

function MapView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all');

  // USF Tampa Campus center coordinates
  const usfCenter = [28.0650, -82.4170];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const url = forceRefresh 
        ? 'http://localhost:3001/api/events?refresh=true'
        : 'http://localhost:3001/api/events';
      const response = await axios.get(url);
      
      // Filter out invalid events with robust checking
      const validEvents = response.data.filter(event => {
        if (!event.name) return false;
        const nameStr = String(event.name).trim().toLowerCase();
        return nameStr !== '' && nameStr !== 'false' && nameStr !== 'null' && nameStr !== 'undefined';
      });
      
      setEvents(validEvents);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Make sure the backend server is running.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group events by location
  const eventsByLocation = events.reduce((acc, event) => {
    const key = `${event.coordinates.lat}-${event.coordinates.lng}`;
    if (!acc[key]) {
      acc[key] = {
        coordinates: event.coordinates,
        events: []
      };
    }
    acc[key].events.push(event);
    return acc;
  }, {});

  // Get unique dates for filter
  const uniqueDates = ['all', ...new Set(events.map(e => {
    const parsed = parseDateTime(e.datetime);
    return parsed.split(',')[0] || 'No date';
  }))];

  // Filter events by selected date
  const filteredEvents = selectedDate === 'all'
    ? events
    : events.filter(e => parseDateTime(e.datetime).includes(selectedDate));

  const filteredLocations = filteredEvents.reduce((acc, event) => {
    const key = `${event.coordinates.lat}-${event.coordinates.lng}`;
    if (!acc[key]) {
      acc[key] = {
        coordinates: event.coordinates,
        events: []
      };
    }
    acc[key].events.push(event);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="map-container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-controls">
        <div className="control-group">
          <label htmlFor="date-filter">Filter by date:</label>
          <select
            id="date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-filter"
          >
            <option value="all">All Dates ({events.length} events)</option>
            {uniqueDates.slice(1).map(date => (
              <option key={date} value={date}>
                {date} ({events.filter(e => parseDateTime(e.datetime).includes(date)).length})
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => fetchEvents(true)} className="refresh-button">
          Refresh
        </button>
      </div>

      <MapContainer
        center={usfCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.values(filteredLocations).map((location, idx) => (
          <Marker
            key={idx}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={createNumberedIcon(location.events.length)}
          >
            <Popup maxWidth={300}>
              <div className="popup-content">
                <div className="popup-header">
                  <h3 className="popup-location">{location.coordinates.name}</h3>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navigate-button"
                  >
                    Navigate
                  </a>
                </div>
                <div className="popup-count">
                  {location.events.length} event{location.events.length !== 1 ? 's' : ''}
                </div>
                <div className="popup-events">
                  {location.events.map((event, eventIdx) => (
                    <div key={event.id} className="popup-event">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="popup-event-image"
                        />
                      )}
                      <h4>{event.name || 'Untitled Event'}</h4>
                      {event.organizationName && (
                        <p className="event-org"><strong>Organization:</strong> {event.organizationName}</p>
                      )}
                      {event.datetime && (
                        <p className="event-time"><strong>Date & Time:</strong> {parseDateTime(event.datetime)}</p>
                      )}
                      {event.location && (
                        <p className="event-location"><strong>Location:</strong> {event.location}</p>
                      )}
                      {event.category && (
                        <span className="event-category">{event.category}</span>
                      )}
                      {event.capacityStatus && (
                        <span className="event-capacity">{parseDateTime(event.capacityStatus)}</span>
                      )}
                      {eventIdx < location.events.length - 1 && <hr />}
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
