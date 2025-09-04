import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <Header />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: '250px',
          background: '#f5f5f5',
          padding: '16px',
          borderRight: '1px solid #ddd'
        }}>
          <nav>
            <Link 
              to="/" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              Home
            </Link>
            <Link 
              to="/music" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              Music Publishing
            </Link>
            <Link 
              to="/publishing" 
              style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#333',
                textDecoration: 'none',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              Digital Publishing
            </Link>
          </nav>
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1, padding: '16px' }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        a:hover {
          background-color: #e0e0e0 !important;
        }
      `}</style>
    </>
  );
};

export default MainLayout;