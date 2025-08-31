import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';

interface AddReleaseFormProps {
  onClose: () => void;
}

export const AddReleaseForm = ({ onClose }: AddReleaseFormProps) => {
  const addRelease = useAppStore(state => state.addRelease);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    releaseDate: '',
    splits: [{ name: '', share: '' }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRelease(formData);
    onClose();
  };

  const addSplit = () => {
    setFormData(prev => ({
      ...prev,
      splits: [...prev.splits, { name: '', share: '' }]
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#1E1E1E',
      padding: '20px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '500px'
    }}>
      <h2 style={{ marginBottom: '20px' }}>Add New Release</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Title:
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Artist:
            <input
              type="text"
              value={formData.artist}
              onChange={e => setFormData(prev => ({ ...prev, artist: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Genre:
            <input
              type="text"
              value={formData.genre}
              onChange={e => setFormData(prev => ({ ...prev, genre: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Release Date:
            <input
              type="date"
              value={formData.releaseDate}
              onChange={e => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3>Splits</h3>
          {formData.splits.map((split, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                placeholder="Name"
                value={split.name}
                onChange={e => {
                  const newSplits = [...formData.splits];
                  newSplits[index].name = e.target.value;
                  setFormData(prev => ({ ...prev, splits: newSplits }));
                }}
                style={{
                  flex: 2,
                  padding: '8px',
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
              <input
                placeholder="Share %"
                value={split.share}
                onChange={e => {
                  const newSplits = [...formData.splits];
                  newSplits[index].share = e.target.value;
                  setFormData(prev => ({ ...prev, splits: newSplits }));
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white'
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addSplit}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px',
              marginTop: '10px'
            }}
          >
            Add Split
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#666',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Create Release
          </button>
        </div>
      </form>
    </div>
  );
};