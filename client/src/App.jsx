import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import MapView from './components/MapView';
import ListView from './components/ListView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>USF Events Map</h1>
            <p className="subtitle">Discover campus events at University of South Florida</p>
          </div>
          <nav className="nav-tabs">
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              end
            >
              Map View
            </NavLink>
            <NavLink
              to="/list"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              List View
            </NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/list" element={<ListView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
