import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useAppStore } from './store/appStore';

// --- Style CSS-in-JS dla ciemnego motywu ---
const styles: { [key: string]: React.CSSProperties } = {
  app: {
    display: 'flex',
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    backgroundColor: '#121212',
    color: '#E0E0E0',
    minHeight: '100vh',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1E1E1E',
    padding: '20px',
    borderRight: '1px solid #2D2D2D',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '40px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
  },
  navLink: {
    color: '#A0A0A0',
    textDecoration: 'none',
    fontSize: '18px',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '10px',
    transition: 'background-color 0.2s, color 0.2s',
  },
  navLinkActive: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
  },
  header: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    borderBottom: '1px solid #2D2D2D',
    paddingBottom: '15px',
  },
};

// --- Komponenty-Strony (placeholdery) ---
const Dashboard = () => <h1 style={styles.header}>Dashboard</h1>;
const Music = () => {
  const releases = useAppStore(state => state.music.releases);
  return (
    <div>
      <h1 style={styles.header}>Music Publishing</h1>
      <p>Załadowano {releases.length} wydawnictw.</p>
      <pre style={{backgroundColor: '#222', padding: '10px', borderRadius: '5px'}}>
        {JSON.stringify(releases, null, 2)}
      </pre>
    </div>
  );
};
const Publishing = () => <h1 style={styles.header}>Digital Publishing</h1>;

// --- Główny Komponent Aplikacji ---
export default function App() {
  const fetchInitialData = useAppStore((state) => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <Router>
      <div style={styles.app}>
        <nav style={styles.sidebar}>
          <div style={styles.logo}>HardbanLab</div>
          <div style={styles.nav}>
            <NavLink to="/" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>Dashboard</NavLink>
            <NavLink to="/music" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>Music AI</NavLink>
            <NavLink to="/publishing" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>Publishing AI</NavLink>
          </div>
        </nav>
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/music" element={<Music />} />
            <Route path="/publishing" element={<Publishing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}