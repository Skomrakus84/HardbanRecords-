import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { uploadFileToS3 } from '../../api/client';

interface BookFormProps {
  onClose: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ onClose }) => {
  const addBook = useAppStore(state => state.addBook);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    blurb: '',
    keywords: '',
    coverImageUrl: '',
    splits: [{ name: '', share: '' }],
    chapters: [{ title: '', content: '' }],
    rights: { territorial: false, translation: false, adaptation: false, drm: false }
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let coverImageUrl = formData.coverImageUrl;
    if (coverFile) {
      setUploading(true);
      try {
        const { fileUrl } = await uploadFileToS3(coverFile);
        coverImageUrl = fileUrl;
      } catch (err) {
        alert('Błąd uploadu pliku.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    await addBook({
      ...formData,
      coverImageUrl,
      status: 'Draft',
      illustrations: []
    });
    onClose();
  };

  return (
    <div style={{ background: '#222', padding: 24, borderRadius: 8, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: 'white' }}>Dodaj książkę</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Tytuł:
            <input type="text" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Autor:
            <input type="text" value={formData.author} onChange={e => setFormData(f => ({ ...f, author: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Gatunek:
            <input type="text" value={formData.genre} onChange={e => setFormData(f => ({ ...f, genre: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Blurb:
            <textarea value={formData.blurb} onChange={e => setFormData(f => ({ ...f, blurb: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Słowa kluczowe:
            <input type="text" value={formData.keywords} onChange={e => setFormData(f => ({ ...f, keywords: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: 'white' }}>Okładka:
            <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setCoverFile(e.target.files[0]); }} />
          </label>
          {coverFile && <span style={{ color: 'white' }}>Wybrano: {coverFile.name}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: '#666', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>Anuluj</button>
          <button type="submit" disabled={uploading} style={{ background: uploading ? '#888' : '#4CAF50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4 }}>{uploading ? 'Wysyłanie...' : 'Dodaj książkę'}</button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
