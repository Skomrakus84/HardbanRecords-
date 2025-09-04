import React from 'react';

const SettingsPage: React.FC = () => {
  // Przykładowe ustawienia do rozbudowy
  return (
    <div style={{ padding: 32, maxWidth: 500, margin: '0 auto', color: 'white' }}>
      <h2>Ustawienia aplikacji</h2>
      <div style={{ margin: '24px 0' }}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ marginRight: 8 }}>Tryb ciemny:</span>
          <input type="checkbox" checked disabled />
          <span style={{ marginLeft: 8, color: '#aaa' }}>(Wkrótce)</span>
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ marginRight: 8 }}>Język aplikacji:</span>
          <select disabled>
            <option>Polski</option>
            <option>English</option>
          </select>
          <span style={{ marginLeft: 8, color: '#aaa' }}>(Wkrótce)</span>
        </label>
      </div>
      <div style={{ color: '#aaa', fontSize: 13 }}>
        Więcej ustawień pojawi się po wdrożeniu autoryzacji i personalizacji.
      </div>
    </div>
  );
};

export default SettingsPage;