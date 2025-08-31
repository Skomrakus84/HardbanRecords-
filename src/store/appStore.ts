import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Lepiej zdefiniowane typy
interface MusicRelease {
  id: number;
  title: string;
  artist: string;
  genre: string;
  status: string;
  releaseDate?: string;
  splits: { name: string; share: string }[];
}

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: string;
}

interface Music {
  releases: MusicRelease[];
  tasks: any[];
}

interface Publishing {
  books: Book[];
  tasks: any[];
}

interface AppState {
  music: Music;
  publishing: Publishing;
  isLoading: boolean;
  error: string | null;
  onboardingComplete: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  addRelease: (release: Omit<MusicRelease, 'id'>) => Promise<void>;
  updateRelease: (id: number, data: Partial<MusicRelease>) => Promise<void>;
  deleteRelease: (id: number) => Promise<void>;
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  updateBook: (id: number, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  music: { releases: [], tasks: [] },
  publishing: { books: [], tasks: [] },
  isLoading: false,
  error: null,
  onboardingComplete: false,

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`${API_URL}/data`);
      set({
        music: data.music || { releases: [], tasks: [] },
        publishing: data.publishing || { books: [], tasks: [] },
        onboardingComplete: data.onboardingComplete || false,
        error: null
      });
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
      set({ 
        error: axios.isAxiosError(error) 
          ? error.response?.data?.message || 'Failed to fetch initial data'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addRelease: async (release) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/music/releases`, release);
      set(state => ({
        music: {
          ...state.music,
          releases: [...state.music.releases, data]
        },
        error: null
      }));
    } catch (error) {
      console.error('Błąd podczas dodawania release:', error);
      set({ 
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to add release'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRelease: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.patch(`${API_URL}/music/releases/${id}`, updateData);
      set(state => ({
        music: {
          ...state.music,
          releases: state.music.releases.map(release =>
            release.id === id ? { ...release, ...data } : release
          )
        },
        error: null
      }));
    } catch (error) {
      console.error('Błąd podczas aktualizacji release:', error);
      set({ 
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update release'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRelease: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/music/releases/${id}`);
      set(state => ({
        music: {
          ...state.music,
          releases: state.music.releases.filter(release => release.id !== id)
        },
        error: null
      }));
    } catch (error) {
      console.error('Błąd podczas usuwania release:', error);
      set({ 
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete release'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addBook: async (book) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`${API_URL}/publishing/books`, book);
      set(state => ({
        publishing: {
          ...state.publishing,
          books: [...state.publishing.books, data]
        },
        error: null
      }));
    } catch (error) {
      console.error('Błąd podczas dodawania książki:', error);
      set({ 
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to add book'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBook: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.patch(`${API_URL}/publishing/books/${id}`, updateData);
      set(state => ({
        publishing: {
          ...state.publishing,
          books: state.publishing.books.map(book =>
            book.id === id ? { ...book, ...data } : book
          )
        },
        error: null
      }));
    } catch (error) {
      console.error('Błąd podczas aktualizacji książki:', error);
      set({ 
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to update book'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBook: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/publishing/books/${id}`);
      set(state => ({
        publishing: {
          ...state.publishing,
          books: state.publishing.books.filter(book => book.id !== id)
        },
        error: null
      }));
    } catch (error) {
      console.error('Błąd podczas usuwania książki:', error);
      set({ 
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to delete book'
          : 'Network error occurred'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));