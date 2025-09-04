import React from 'react';
import { useAppStore } from '../store/appStore';
import AssistantPanel from '../components/AssistantPanel';

const HomePage: React.FC = () => {
  const { music, publishing, isLoading } = useAppStore();

  return (
    <div>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>HardbanRecords-Lab</h1>
      <p>Witamy w aplikacji!</p>
      {isLoading ? (
        <div>Loading dashboard data...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Music Stats */}
            <div style={{ 
              backgroundColor: '#1E1E1E', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Music Publishing</h2>
              <div>
                <p>Active Releases: {music.releases.length}</p>
                <p>Pending Tasks: {music.tasks.filter(t => !t.completed).length}</p>
              </div>
            </div>
            {/* Publishing Stats */}
            <div style={{ 
              backgroundColor: '#1E1E1E', 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Digital Publishing</h2>
              <div>
                <p>Books in Library: {publishing.books.length}</p>
                <p>Pending Tasks: {publishing.tasks.filter(t => !t.completed).length}</p>
              </div>
            </div>
          </div>
          <div style={{ margin: '40px auto 0', maxWidth: 480 }}>
            <AssistantPanel />
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;