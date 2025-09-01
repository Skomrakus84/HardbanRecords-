import { create } from 'zustand';

// --- Typy i interfejsy (przeniesione z głównego kodu) ---
type LoadingState = {
  metadata: boolean;
  releaseDate: boolean;
  forecast: boolean;
  syncMatch: boolean;
  coverArt: boolean;
  aandrScout: boolean;
  funding: boolean;
  collabFinder: boolean;
  listenerAnalytics: boolean;
  splitAgreement: boolean;
  proofread: boolean;
  plotAnalysis: boolean;
  enrichment: boolean;
  illustration: boolean;
  blurb: boolean;
  keywords: boolean;
  salesForecast: boolean;
  marketTrends: boolean;
  marketingAssets: boolean;
  worldConsistency: boolean;
  rightsMatch: boolean;
  bookCover: boolean;
};

type View = 'DASHBOARD' | 'MUSIC' | 'PUBLISHING';

interface Task {
  id: number;
  text: string;
  dueDate: string | undefined;
  completed: boolean;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ReleaseCollaborator {
  name: string;
  share: string;
}

interface Release {
  id: number;
  title: string;
  artist: string;
  status: 'Live' | 'In Review' | 'Submitted' | 'Processing';
  genre?: string;
  releaseDate?: string;
  splits: ReleaseCollaborator[];
}

interface Collaborator {
  name: string;
  share: string;
}

interface BookRights {
  territorial: boolean;
  translation: boolean;
  adaptation: boolean;
  drm: boolean;
}

interface BookChapter {
  title: string;
  content: string;
}
interface BookIllustration {
  url: string;
  prompt: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: 'Published' | 'Processing' | 'Draft';
  rights: BookRights;
  splits: Collaborator[];
  chapters: BookChapter[];
  blurb: string;
  keywords: string;
  illustrations: BookIllustration[];
  coverImageUrl: string;
}

interface AppState {
  isInitialized: boolean;
  view: View;
  loading: LoadingState;
  toasts: ToastMessage[];
  onboarding: {
    tourStepIndex: number;
    onboardingComplete: boolean;
    activeTabOverride?: string | undefined;
  };
  music: {
    releases: Release[];
    tasks: Task[];
  };
  publishing: {
    books: Book[];
    tasks: Task[];
  };
}

interface AppActions {
  initializeApp: () => void;
  setView: (view: View) => void;
  setLoading: (key: keyof LoadingState, value: boolean) => void;
  addToast: (message: string, type?: 'success' | 'error') => void;
  dismissToast: (id: number) => void;
  startTour: () => void;
  nextTourStep: () => void;
  skipTour: () => void;
  addRelease: (release: Omit<Release, 'id' | 'status'>) => void;
  updateMusicSplits: (releaseId: number, splits: ReleaseCollaborator[]) => void;
  addMusicTask: (text: string, dueDate: string) => void;
  toggleMusicTask: (id: number) => void;
  addBook: (book: Omit<Book, 'id'>) => string;
  updateBook: (bookId: number, data: Partial<Book>) => void;
  updateBookSplits: (bookId: number, splits: Collaborator[]) => void;
  addChapter: (bookId: number) => void;
  updateChapterContent: (bookId: number, chapterIndex: number, newContent: string) => void;
  replaceBookChapters: (bookId: number, chapters: BookChapter[]) => void;
  addPublishingTask: (text: string, dueDate: string) => void;
  togglePublishingTask: (id: number) => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set, get) => ({
  isInitialized: false,
  view: 'DASHBOARD',
  loading: {
    metadata: false, releaseDate: false, forecast: false, syncMatch: false, coverArt: false, aandrScout: false, funding: false, collabFinder: false, listenerAnalytics: false, splitAgreement: false,
    proofread: false, plotAnalysis: false, enrichment: false, illustration: false, blurb: false, keywords: false, salesForecast: false, marketTrends: false, marketingAssets: false, worldConsistency: false, rightsMatch: false, bookCover: false
  },
  toasts: [],
  onboarding: {
    tourStepIndex: -1,
    onboardingComplete: false,
    activeTabOverride: undefined,
  },
  music: {
    releases: [],
    tasks: [],
  },
  publishing: {
    books: [],
    tasks: [],
  },
  initializeApp: () => {
    // Inicjalizacja z przykładowymi danymi
    const mockData = {
      music: {
        releases: [
          { id: 1, title: 'Cybernetic Dreams', artist: 'Void Runner', status: 'Live' as const, genre: 'Darksynth', releaseDate: '2023-10-26', splits: [{ name: 'Void Runner', share: '100' }] }
        ],
        tasks: [
          { id: 101, text: 'Master final track for EP', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false },
          { id: 102, text: 'Design cover art concepts', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: true }
        ]
      },
      publishing: {
        books: [
          {
            id: 201,
            title: 'The Last Datastream',
            author: 'Alex Chen',
            genre: 'Sci-Fi',
            status: 'Published' as const,
            rights: { territorial: true, translation: true, adaptation: false, drm: true },
            splits: [{ name: 'Alex Chen', share: '100' }],
            chapters: [{ title: 'Chapter 1', content: 'The rain fell in digital sheets across the neon-drenched canyons of Neo-Kyoto. Below, Detective Kaito navigated his spinner through the chaotic sky-lanes, the city\'s holographic ghosts flickering against his cockpit\'s viewport.' }],
            blurb: 'In a city that never sleeps, a reclusive hacker uncovers a conspiracy that could rewrite reality itself.',
            keywords: 'cyberpunk, sci-fi, conspiracy, hacker, future, dystopian, neon',
            illustrations: [],
            coverImageUrl: ''
          }
        ],
        tasks: [
          { id: 202, text: 'Outline sequel novel', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: false }
        ]
      },
      onboardingComplete: false
    };
    set({
      music: mockData.music,
      publishing: mockData.publishing,
      onboarding: { ...get().onboarding, onboardingComplete: mockData.onboardingComplete },
      isInitialized: true,
    });
  },
  setView: (view) => set({ view }),
  setLoading: (key, value) => set(state => ({ loading: { ...state.loading, [key]: value } })),
  addToast: (message, type = 'success') => set(state => ({ toasts: [...state.toasts, { id: Date.now(), message, type }] })),
  dismissToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  startTour: () => {
    if (!get().onboarding.onboardingComplete) {
      set(state => ({ onboarding: { ...state.onboarding, tourStepIndex: 0 } }));
    }
  },
  nextTourStep: () => {
    const currentStepIndex = get().onboarding.tourStepIndex;
    set(state => ({ onboarding: { ...state.onboarding, tourStepIndex: currentStepIndex + 1 } }));
  },
  skipTour: () => {
    set({ onboarding: { tourStepIndex: -1, onboardingComplete: true, activeTabOverride: undefined } });
    get().addToast("You're all set! Feel free to explore.", "success");
  },
  addRelease: (releaseData) => {
    const newRelease: Release = { ...releaseData, id: Date.now(), status: 'Submitted' };
    set(state => ({ music: { ...state.music, releases: [...state.music.releases, newRelease] } }));
  },
  updateMusicSplits: (releaseId, splits) => {
    set(state => ({ music: { ...state.music, releases: state.music.releases.map(r => r.id === releaseId ? { ...r, splits } : r) } }));
    get().addToast('Splits updated successfully.', 'success');
  },
  addMusicTask: (text, dueDate) => {
    const newTask: Task = { id: Date.now(), text, dueDate, completed: false };
    set(state => ({ music: { ...state.music, tasks: [...state.music.tasks, newTask] } }));
  },
  toggleMusicTask: (id) => {
    set(state => ({ music: { ...state.music, tasks: state.music.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) } }));
  },
  addBook: (bookData) => {
    const newBook: Book = { ...bookData, id: Date.now() };
    set(state => ({ publishing: { ...state.publishing, books: [...state.publishing.books, newBook] } }));
    return newBook.id.toString();
  },
  updateBook: (bookId, data) => {
    set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, ...data } : b) } }));
  },
  updateBookSplits: (bookId, splits) => {
    set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, splits } : b) } }));
    get().addToast('Splits updated successfully.', 'success');
  },
  addChapter: (bookId) => {
    const book = get().publishing.books.find(b => b.id === bookId);
    if (!book) return;
    const newChapter: BookChapter = { title: `Chapter ${book.chapters.length + 1}`, content: "" };
    const updatedChapters = [...book.chapters, newChapter];
    set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, chapters: updatedChapters } : b) } }));
  },
  updateChapterContent: (bookId, chapterIndex, newContent) => {
    const book = get().publishing.books.find(b => b.id === bookId);
    if (!book || !book.chapters[chapterIndex]) return;
    const updatedChapters = book.chapters.map((chapter, index) =>
      index === chapterIndex ? { ...chapter, content: newContent } : chapter
    );
    set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, chapters: updatedChapters } : b) } }));
  },
  replaceBookChapters: (bookId, chapters) => {
    set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, chapters } : b) } }));
  },
  addPublishingTask: (text, dueDate) => {
    const newTask: Task = { id: Date.now(), text, dueDate, completed: false };
    set(state => ({ publishing: { ...state.publishing, tasks: [...state.publishing.tasks, newTask] } }));
  },
  togglePublishingTask: (id) => {
    set(state => ({ publishing: { ...state.publishing, tasks: state.publishing.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) } }));
  },
}));