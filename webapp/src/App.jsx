import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const API_URL = 'http://localhost:3000/api';

// Create custom icon
const createCustomIcon = (count) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#006747;color:white;width:35px;height:35px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);font-size:14px;">${count}</div>`,
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.events.sort((a, b) => new Date(a.startsOn) - new Date(b.startsOn)));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const openNav = (coords) => {
    if (!coords || coords.isVirtual) return;
    window.open(`https://maps.google.com/?q=${coords.latitude},${coords.longitude}`, '_blank');
  };

  const locationGroups = events.reduce((acc, event) => {
    if (event.locationCoords && !event.locationCoords.isVirtual) {
      const key = `${event.locationCoords.latitude},${event.locationCoords.longitude}`;
      if (!acc[key]) acc[key] = { coords: event.locationCoords, events: [] };
      acc[key].events.push(event);
    }
    return acc;
  }, {});

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="app">
      <header className="header">
        <h1>🎓 USF Events Map</h1>
        <p>Discover campus events near you</p>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>🗺️ Map</button>
        <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>📋 List</button>
      </div>

      <div className="container">
        {activeTab === 'map' ? (
          <div>
            <div className="stats"><div className="stats-number">{Object.keys(locationGroups).length}</div><div className="stats-label">Locations</div></div>
            <MapContainer center={[28.0654, -82.4184]} zoom={15} style={{ height: 'calc(100vh - 250px)', width: '100%', borderRadius: '12px' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {Object.values(locationGroups).map((group, idx) => (
                <Marker key={idx} position={[group.coords.latitude, group.coords.longitude]} icon={createCustomIcon(group.events.length)}>
                  <Popup maxWidth={300}>
                    <div style={{ padding: '10px' }}>
                      <h3 style={{ color: '#006747', marginBottom: '10px' }}>{group.coords.name}</h3>
                      {group.events.slice(0, 5).map((e, i) => (
                        <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{e.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{formatDate(e.startsOn)}</div>
                        </div>
                      ))}
                      <button onClick={() => openNav(group.coords)} style={{ width: '100%', padding: '10px', background: '#006747', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}>🧭 Navigate</button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div>
            <div className="stats"><div className="stats-number">{events.length}</div><div className="stats-label">Events</div></div>
            {events.map((event, idx) => (
              <div key={idx} className="event-card">
                <div className="event-name">{event.name}</div>
                <div className="event-detail">📅 {formatDate(event.startsOn)}</div>
                {event.locationCoords && <div className="event-detail">📍 {event.locationCoords.name}{event.locationCoords.isVirtual && ' (Virtual)'}</div>}
                {event.organizationName && <div className="event-org">👥 {event.organizationName}</div>}
                {event.locationCoords && !event.locationCoords.isVirtual && (
                  <button className="navigate-btn" onClick={() => openNav(event.locationCoords)}>🧭 Navigate</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
