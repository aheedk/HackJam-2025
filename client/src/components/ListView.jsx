import { useEffect, useState } from 'react';
import axios from 'axios';
import './ListView.css';

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

function ListView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      
      // Double-filter on client side to ensure no invalid events
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

  // Get unique categories
  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];

  // Filter events - also filter out invalid events
  const filteredEvents = events.filter(event => {
    // Skip events with invalid names (double-check)
    if (!event.name) return false;
    const nameStr = String(event.name).trim().toLowerCase();
    if (nameStr === '' || nameStr === 'false' || nameStr === 'null' || nameStr === 'undefined') {
      return false;
    }
    
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="list-container">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchEvents} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events, organizations, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories ({events.length})</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category} ({events.filter(e => e.category === category).length})
              </option>
            ))}
          </select>
          <button onClick={() => fetchEvents(true)} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      <div className="results-count">
        Showing {filteredEvents.length} of {events.length} events
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="no-results">
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              {event.imageUrl && (
                <div className="event-image-container">
                  <img
                    src={event.imageUrl}
                    alt={event.name || 'Event'}
                    className="event-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="event-content">
                <div className="event-header">
                  <h3 className="event-title">{event.name || 'Untitled Event'}</h3>
                  {event.category && (
                    <span className="event-category-badge">{event.category}</span>
                  )}
                </div>

                <div className="event-details">
                  {event.organizationName && (
                    <div className="event-detail-row">
                      <span className="detail-label">Organization:</span>
                      <span className="detail-text">{event.organizationName}</span>
                    </div>
                  )}

                  {event.datetime && (
                    <div className="event-detail-row">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-text">{parseDateTime(event.datetime)}</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="event-detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-text">{event.location}</span>
                    </div>
                  )}

                  {event.attendeeCount > 0 && (
                    <div className="event-detail-row">
                      <span className="detail-label">Attendees:</span>
                      <span className="detail-text">{event.attendeeCount}</span>
                    </div>
                  )}

                  {event.capacityStatus && (
                    <div className="event-capacity-badge">
                      {parseDateTime(event.capacityStatus)}
                    </div>
                  )}
                </div>

                {event.tags && (
                  <div className="event-tags">
                    {event.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="event-tag">{parseDateTime(tag.trim())}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ListView;
