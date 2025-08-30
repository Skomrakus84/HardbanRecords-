// --- Helper Views ---
const HelpView: FC<{ title: string; topics: HelpTopic[] }> = ({ title, topics }) => (
    <div className="help-view large-span">
        <h3>{title}</h3>
        <div className="help-topics-grid">
            {topics.map((topic, i) => <HelpCard key={i} topic={topic} />)}
        </div>
    </div>
);

// Placeholder for MusicPublishingView (should be replaced with the actual implementation if available)
const MusicPublishingView: FC = () => (
    <div className="module-view large-span">
        <h2>Music Publishing Module</h2>
        <p>This is a placeholder for the Music Publishing module. Please implement the full view as needed.</p>
    </div>
);
import React, { useState, FC, ReactNode, useMemo, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { create } from 'zustand';

// Całkowicie usunięto zależność od @google/genai i sprawdzanie klucza API.
// Aplikacja nie potrzebuje już klucza po stronie przeglądarki.

// --- Helper & Type Definitions ---
// --- Typings for UI Components ---
type TooltipProps = { text: string; children: React.ReactNode; inline?: boolean };
type DashboardCardProps = { icon: React.ReactNode; title: string; description: string; onClick?: () => void };
type AIToolCardProps = { title: string; children: React.ReactNode; onGenerate?: () => void; isLoading?: boolean; buttonText?: string; tooltipText?: string };
type ModalProps = { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode };
type ConfirmationModalProps = ModalProps & { onSave: () => void; onDiscard: () => void };
type HelpTopic = { title: string; description: string };
type LoadingState = {
  metadata: boolean; releaseDate: boolean; forecast: boolean; syncMatch: boolean; coverArt: boolean; aandrScout: boolean; funding: boolean; collabFinder: boolean; listenerAnalytics: boolean; splitAgreement: boolean;
  proofread: boolean; plotAnalysis: boolean; enrichment: boolean; illustration: boolean; blurb: boolean; keywords: boolean; salesForecast: boolean; marketTrends: boolean; marketingAssets: boolean; audiobook: boolean; worldConsistency: boolean; rightsMatch: boolean; bookCover: boolean;
};
type View = 'DASHBOARD' | 'MUSIC' | 'PUBLISHING';
interface Task { id: number; text: string; dueDate: string; completed: boolean; }
interface ToastMessage { id: number; message: string; type: 'success' | 'error'; }
interface ReleaseCollaborator { name: string; share: string; }
interface Release { id: number; title: string; artist: string; status: 'Live' | 'In Review' | 'Submitted' | 'Processing'; genre?: string; releaseDate?: string; splits: ReleaseCollaborator[]; }
interface Collaborator { name: string; share: string; }
interface BookRights { territorial: boolean; translation: boolean; adaptation: boolean; audio: boolean; drm: boolean; }
interface BookChapter { title: string; content: string; }
interface BookIllustration { url: string; prompt: string; }
interface Book { id: number; title: string; author: string; genre: string; status: 'Published' | 'Processing' | 'Draft'; rights: BookRights; splits: Collaborator[]; chapters: BookChapter[]; blurb: string; keywords: string; illustrations: BookIllustration[]; coverImageUrl?: string; }
interface TourStep { title: string; content: string; style: React.CSSProperties; arrowDirection: 'top' | 'bottom' | 'left' | 'right'; view: View; targetTab?: string; }

// --- Zustand Store Definition ---
interface AppState { isInitialized: boolean; view: View; loading: LoadingState; toasts: ToastMessage[]; onboarding: { tourStepIndex: number; onboardingComplete: boolean; activeTabOverride?: string; }; music: { releases: Release[]; tasks: Task[]; }; publishing: { books: Book[]; tasks: Task[]; } }
interface AppActions {
    initializeApp: () => Promise<void>;
    setView: (view: View) => void;
    setLoading: (key: keyof LoadingState, value: boolean) => void;
    addToast: (message: string, type?: 'success' | 'error') => void;
    dismissToast: (id: number) => void;
    startTour: () => void;
    nextTourStep: () => void;
    skipTour: () => Promise<void>;
    addRelease: (release: Omit<Release, 'id' | 'status'>) => Promise<void>;
    updateMusicSplits: (releaseId: number, splits: ReleaseCollaborator[]) => Promise<void>;
    addMusicTask: (text: string, dueDate: string) => Promise<void>;
    toggleMusicTask: (id: number, currentStatus: boolean) => Promise<void>;
    addBook: (book: Omit<Book, 'id'>) => Promise<string>;
    updateBook: (bookId: number, data: Partial<Book>) => Promise<void>;
    addChapter: (bookId: number) => Promise<void>;
    updateChapterContent: (bookId: number, chapterIndex: number, newContent: string) => Promise<void>;
    addPublishingTask: (text: string, dueDate: string) => Promise<void>;
    togglePublishingTask: (id: number, currentStatus: boolean) => Promise<void>;
}
type AppStore = AppState & AppActions;

// --- Backend API Configuration ---
const API_BASE_URL = 'http://localhost:3001/api';

const api = {
    async fetchData() { const response = await fetch(`${API_BASE_URL}/data`); if (!response.ok) throw new Error(`Błąd sieci: ${response.statusText}`); return response.json(); },
    async addRelease(data: Omit<Release, 'id' | 'status'>) { const response = await fetch(`${API_BASE_URL}/music/releases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!response.ok) throw new Error('Nie udało się dodać wydania.'); return response.json(); },
    async updateMusicSplits(id: number, splits: ReleaseCollaborator[]) { const response = await fetch(`${API_BASE_URL}/music/releases/${id}/splits`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ splits }) }); if (!response.ok) throw new Error('Nie udało się zaktualizować podziałów.'); return response.json(); },
    async addMusicTask(text: string, dueDate: string) { const response = await fetch(`${API_BASE_URL}/music/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, dueDate }) }); if (!response.ok) throw new Error('Nie udało się dodać zadania.'); return response.json(); },
    async toggleMusicTask(id: number, completed: boolean) { const response = await fetch(`${API_BASE_URL}/music/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed }) }); if (!response.ok) throw new Error('Nie udało się zmienić statusu zadania.'); return response.json(); },
    async addBook(data: Omit<Book, 'id'>) { const response = await fetch(`${API_BASE_URL}/publishing/books`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!response.ok) throw new Error('Nie udało się dodać książki.'); return response.json(); },
    async updateBook(id: number, data: Partial<Book>) { const response = await fetch(`${API_BASE_URL}/publishing/books/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!response.ok) throw new Error('Nie udało się zaktualizować książki.'); return response.json(); },
    async addPublishingTask(text: string, dueDate: string) { const response = await fetch(`${API_BASE_URL}/publishing/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, dueDate }) }); if (!response.ok) throw new Error('Nie udało się dodać zadania.'); return response.json(); },
    async togglePublishingTask(id: number, completed: boolean) { const response = await fetch(`${API_BASE_URL}/publishing/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed }) }); if (!response.ok) throw new Error('Nie udało się zmienić statusu zadania.'); return response.json(); },
    async getPresignedUrl(fileName: string, fileType: string) { const response = await fetch(`${API_BASE_URL}/s3-presigned-url?fileName=${encodeURIComponent(fileName)}&fileType=${encodeURIComponent(fileType)}`); if (!response.ok) throw new Error('Nie udało się uzyskać adresu do wgrania pliku.'); return response.json(); },
    async uploadFileToS3(presignedUrl: string, file: File) { const response = await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); if (!response.ok) throw new Error('Przesyłanie pliku do S3 nie powiodło się.'); },
    async generateContent(payload: { model: string, contents: any, config?: any }) { const response = await fetch(`${API_BASE_URL}/ai/generate-content`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Błąd generowania treści AI.'); } return response.json(); },
    async generateImages(payload: { model: string, prompt: string, config?: any }) { const response = await fetch(`${API_BASE_URL}/ai/generate-images`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Błąd generowania obrazu AI.'); } return response.json(); }
};

const useAppStore = create<AppStore>((set, get) => ({
    isInitialized: false, view: 'DASHBOARD', loading: { metadata: false, releaseDate: false, forecast: false, syncMatch: false, coverArt: false, aandrScout: false, funding: false, collabFinder: false, listenerAnalytics: false, splitAgreement: false, proofread: false, plotAnalysis: false, enrichment: false, illustration: false, blurb: false, keywords: false, salesForecast: false, marketTrends: false, marketingAssets: false, audiobook: false, worldConsistency: false, rightsMatch: false, bookCover: false }, toasts: [], onboarding: { tourStepIndex: -1, onboardingComplete: false, activeTabOverride: undefined }, music: { releases: [], tasks: [] }, publishing: { books: [], tasks: [] },
    initializeApp: async () => { try { const data = await api.fetchData(); set({ music: data.music, publishing: data.publishing, onboarding: { ...get().onboarding, onboardingComplete: data.onboardingComplete }, isInitialized: true, }); } catch (error) { console.error("Błąd inicjalizacji:", error); get().addToast("Nie można załadować danych z serwera. Upewnij się, że backend jest uruchomiony.", "error"); set({ isInitialized: true }); } },
    setView: (view) => set({ view }), setLoading: (key, value) => set(state => ({ loading: { ...state.loading, [key]: value } })), addToast: (message, type = 'success') => set(state => ({ toasts: [...state.toasts, { id: Date.now(), message, type }] })), dismissToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
    startTour: () => { if (!get().onboarding.onboardingComplete) { const firstStep = TOUR_STEPS[0]; set(state => ({ view: firstStep.view, onboarding: { ...state.onboarding, tourStepIndex: 0, activeTabOverride: firstStep.targetTab } })); } },
    nextTourStep: () => { const currentStepIndex = get().onboarding.tourStepIndex; if (currentStepIndex < TOUR_STEPS.length - 1) { const nextStepIndex = currentStepIndex + 1; const nextStep = TOUR_STEPS[nextStepIndex]; set(state => ({ view: nextStep.view, onboarding: { ...state.onboarding, tourStepIndex: nextStepIndex, activeTabOverride: nextStep.targetTab } })); } else { get().skipTour(); } },
    skipTour: async () => { set({ view: 'DASHBOARD', onboarding: { tourStepIndex: -1, onboardingComplete: true, activeTabOverride: undefined } }); get().addToast("You're all set! Feel free to explore.", "success"); },
    addRelease: async (releaseData) => { try { const { release } = await api.addRelease(releaseData); set(state => ({ music: { ...state.music, releases: [...state.music.releases, release] } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
    updateMusicSplits: async (releaseId, splits) => { try { await api.updateMusicSplits(releaseId, splits); set(state => ({ music: { ...state.music, releases: state.music.releases.map(r => r.id === releaseId ? { ...r, splits } : r) } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
    addMusicTask: async (text, dueDate) => { try { const { task } = await api.addMusicTask(text, dueDate); set(state => ({ music: { ...state.music, tasks: [...state.music.tasks, task] } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
    toggleMusicTask: async (id, currentStatus) => { try { await api.toggleMusicTask(id, !currentStatus); set(state => ({ music: { ...state.music, tasks: state.music.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
    addBook: async (bookData) => { try { const { book } = await api.addBook(bookData); set(state => ({ publishing: { ...state.publishing, books: [...state.publishing.books, book] } })); return book.id.toString(); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); return ""; } },
    updateBook: async (bookId, data) => { try { await api.updateBook(bookId, data); set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, ...data } : b) } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
    addChapter: async (bookId) => { const book = get().publishing.books.find(b => b.id === bookId); if (!book) return; const newChapter: BookChapter = { title: `Chapter ${book.chapters.length + 1}`, content: "" }; const updatedChapters = [...book.chapters, newChapter]; await get().updateBook(bookId, { chapters: updatedChapters }); },
    updateChapterContent: async (bookId, chapterIndex, newContent) => { const book = get().publishing.books.find(b => b.id === bookId); if (!book) return; const updatedChapters = [...book.chapters]; updatedChapters[chapterIndex] = { ...updatedChapters[chapterIndex], content: newContent }; set(state => ({ publishing: { ...state.publishing, books: state.publishing.books.map(b => b.id === bookId ? { ...b, chapters: updatedChapters } : b) } })); try { await api.updateBook(bookId, { chapters: updatedChapters }); } catch (error) { console.error(error); get().addToast('Błąd zapisu rozdziału.', 'error'); } },
    addPublishingTask: async (text, dueDate) => { try { const { task } = await api.addPublishingTask(text, dueDate); set(state => ({ publishing: { ...state.publishing, tasks: [...state.publishing.tasks, task] } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
    togglePublishingTask: async (id, currentStatus) => { try { await api.togglePublishingTask(id, !currentStatus); set(state => ({ publishing: { ...state.publishing, tasks: state.publishing.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) } })); } catch (error) { console.error(error); get().addToast((error as Error).message, 'error'); } },
}));

// --- React Components ---
const Tooltip: FC<TooltipProps> = ({ text, children, inline = false }) => ( <div className={`tooltip-container ${inline ? 'tooltip-container--inline' : ''}`}>{children}<span className="tooltip-text" role="tooltip">{text}</span></div> );
const Header = () => ( <header className="header"><div className="logo">HardbanRecords<span>Lab</span></div></header> );
const DashboardCard: FC<DashboardCardProps> = ({ icon, title, description, onClick }) => (
    <button className="card" onClick={onClick} aria-label={title}>
        <div className="card-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </button>
);
// --- Shared UI Components ---
const AIToolCard: FC<AIToolCardProps> = ({ title, children, onGenerate, isLoading, buttonText, tooltipText }) => {
    const button = (
        <button onClick={onGenerate} disabled={isLoading} className="card-button">
            {isLoading ? 'Generating...' : buttonText}
        </button>
    );
    return (
        <div className="ai-card">
            <h4>{title}</h4>
            {children}
            {onGenerate && buttonText && (tooltipText ? <Tooltip text={tooltipText}>{button}</Tooltip> : button)}
        </div>
    );
};

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                <div className="modal-body">{children}</div>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    <button type="button" className="card-button" onClick={onClose} style={{ minWidth: '120px' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

// (removed duplicate ConfirmationModal definition)
const ModuleView: FC<{ title: string; children: ReactNode, onBack: () => void }> = ({ title, children, onBack }) => ( <div className="module-view"><div className="module-header"><button onClick={onBack} className="back-button" aria-label="Back to Dashboard">&larr; Back to Dashboard</button><h1>{title}</h1></div>{children}</div> );
const TaskManager: FC<{ module: 'music' | 'publishing' }> = ({ module }) => { const { music, publishing, addMusicTask, toggleMusicTask, addPublishingTask, togglePublishingTask } = useAppStore(); const [newTask, setNewTask] = useState(''); const [newDueDate, setNewDueDate] = useState(''); const tasks = module === 'music' ? music.tasks : publishing.tasks; const addTask = module === 'music' ? addMusicTask : addPublishingTask; const toggleTask = module === 'music' ? toggleMusicTask : togglePublishingTask; const handleAddTask = (e: React.FormEvent) => { e.preventDefault(); if (!newTask.trim()) return; addTask(newTask.trim(), newDueDate); setNewTask(''); setNewDueDate(''); }; return ( <div className="module-tool-card large-span"><h3>Task Management</h3><div className="task-manager"><form onSubmit={handleAddTask} className="add-task-form"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." aria-label="New task" /><input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} aria-label="Due date" /><button type="submit" aria-label="Add task">+</button></form><ul className="task-list">{[...tasks].sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1).map(task => ( <li key={task.id} className={`task-item ${task.completed ? 'task-item--completed' : ''}`}><div className="task-content"><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} id={`task-${task.id}`} aria-labelledby={`task-label-${task.id}`} /><label htmlFor={`task-${task.id}`} className="task-checkbox-label" aria-hidden="true"></label><span id={`task-label-${task.id}`}>{task.text}</span></div>{task.dueDate && <span className="due-date">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}</li>))}</ul></div></div> ); };
const Toast: FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => { useEffect(() => { const timer = setTimeout(() => { onDismiss(message.id); }, 5000); return () => clearTimeout(timer); }, [message.id, onDismiss]); return ( <div className={`toast toast--${message.type}`} role="alert"><p className="toast-message">{message.message}</p><button onClick={() => onDismiss(message.id)} className="toast-close-btn" aria-label="Dismiss">&times;</button></div> ); };
const ToastContainer: FC = () => { const { toasts, dismissToast } = useAppStore(); return ( <div className="toast-container" aria-live="assertive" aria-atomic="true">{toasts.map(toast => ( <Toast key={toast.id} message={toast} onDismiss={dismissToast} /> ))}</div> ); };
// Only one Modal definition should remain (keep the more readable multiline version if both exist)
const ConfirmationModal: FC<ConfirmationModalProps> = ({ isOpen, onClose, title, children, onSave, onDiscard }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                <div className="modal-body" style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>{children}</div>
                <div className="modal-actions">
                    <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="button-secondary" style={{ background: 'none', border: '1px solid var(--electric-coral)', color: 'var(--electric-coral)' }} onClick={onDiscard}>Discard Changes</button>
                    <button type="button" className="card-button" onClick={onSave}>Save & Continue</button>
                </div>
            </div>
        </div>
    );
};
// Remove stray or extra closing bracket if present
const TOUR_STEPS: TourStep[] = [ { title: "Welcome to Your Creative Universe!", content: "This is your dashboard. From here, you can access powerful toolkits for music and book publishing. Let's start with music.", style: { top: '55%', left: '25%', transform: 'translate(-50%, -50%)' }, arrowDirection: 'right', view: 'DASHBOARD' }, { title: "The Music Publishing Hub", content: "This is where you manage your music. Use the tabs to navigate between creating new releases, viewing analytics, managing rights, and more.", style: { top: '30%', left: '50%', transform: 'translateX(-50%)' }, arrowDirection: 'top', view: 'MUSIC' }, { title: "AI-Powered Studio", content: "In the 'Studio' tab, you can create new releases. Powerful AI tools are integrated to help you generate metadata and even create cover art instantly.", style: { top: '55%', right: '2rem' }, arrowDirection: 'left', view: 'MUSIC', targetTab: 'studio', }, { title: "Digital Publishing for Authors", content: "Now let's look at the hub for authors. This module is designed to assist you from the first draft to the final book.", style: { top: '55%', right: '25%', transform: 'translate(50%, -50%)' }, arrowDirection: 'left', view: 'DASHBOARD' }, { title: "The Digital Publishing Hub", content: "Similar to the music hub, this module is organized by tabs for every stage of publishing: writing, distribution, marketing, and rights.", style: { top: '30%', left: '50%', transform: 'translateX(-50%)' }, arrowDirection: 'top', view: 'PUBLISHING' }, { title: "Your AI Writing Partner", content: "The 'Studio' is your creative space. Here you'll find an AI Writing Assistant to proofread, analyze your plot, and enrich your prose.", style: { top: '50%', left: 'calc(50% - 175px)', transform: 'translate(-100%, -50%)' }, arrowDirection: 'right', view: 'PUBLISHING', targetTab: 'studio', }, { title: "You're Ready to Go!", content: "That's a quick overview of the platform. Feel free to explore and start creating. Enjoy your journey!", style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }, arrowDirection: 'top', view: 'DASHBOARD' } ];
const OnboardingTour: FC<{ stepConfig: TourStep; onNext: () => void; onSkip: () => void; isLastStep: boolean; }> = ({ stepConfig, onNext, onSkip, isLastStep }) => ( <div className="onboarding-overlay"><div className="onboarding-modal" style={stepConfig.style}><div className={`arrow arrow-${stepConfig.arrowDirection}`} /><h4>{stepConfig.title}</h4><p>{stepConfig.content}</p><div className="onboarding-footer"><button onClick={onSkip} className="onboarding-skip">Skip Tour</button><button onClick={onNext} className="card-button">{isLastStep ? "Finish" : "Next"}</button></div></div></div> );
const HelpCard: FC<{ topic: HelpTopic }> = ({ topic }) => (
    <div className="help-card">
        <h4>{topic.title}</h4>
        <p>{topic.description}</p>
    </div>
);

const RIGHTS_DEFINITIONS: { key: keyof BookRights; label: string, description: string }[] = [ { key: 'territorial', label: 'Worldwide Territorial Rights', description: 'Grants rights for distribution and sale worldwide.' }, { key: 'translation', label: 'Translation Rights', description: 'Grants rights for translating the work into other languages.' }, { key: 'adaptation', label: 'Film & TV Adaptation Rights', description: 'Grants rights for adapting the book into other media, like film, TV, or games.' }, { key: 'audio', label: 'Audiobook Rights', description: 'Grants rights for creating and distributing an audiobook version.' }, { key: 'drm', label: 'Digital Rights Management (DRM)', description: 'Encrypts the ebook to prevent unauthorized copying and sharing.' }, ];
const PUBLISHING_AI_HELP_TOPICS: HelpTopic[] = [ { title: "AI Writing Assistant - Proofread", description: "Scans your manuscript for grammatical errors, spelling mistakes, and typos, offering instant corrections to polish your writing." }, { title: "AI Writing Assistant - Analyze Plot", description: "Reads your chapter and provides a high-level analysis of its plot, identifying potential pacing issues, inconsistencies, or plot holes." }, { title: "AI Writing Assistant - Enrich Prose", description: "Rewrites your text to be more descriptive, evocative, and engaging, enhancing your narrative style while preserving the original meaning." }, { title: "AI Illustration Assistant", description: "Generates high-quality, professional illustrations based on a text prompt you provide. It uses the imagen-4.0-generate-001 model to bring scenes from your book to life." }, { title: "AI Book Cover Generator", description: "Designs a compelling and marketable book cover based on your title, author, and genre. It aims for a modern, eye-catching design suitable for online retailers." }, { title: "AI Sales Forecast", description: "Generates a speculative sales forecast for your book, taking into account genre trends, market conditions, and potential audience size." }, { title: "AI Blurb Generator", description: "Analyzes the beginning of your manuscript to craft a captivating book blurb designed to hook potential readers." }, { title: "AI Keyword Generator", description: "Creates a list of effective SEO keywords tailored to your book's genre and themes, improving its discoverability on platforms like Amazon." }, { title: "AI Social Media Assistant", description: "Drafts ready-to-use social media posts for announcing your book release, including relevant hashtags to maximize reach." }, { title: "AI Consistency Checker", description: "Cross-references your current manuscript chapter against your 'World Bible' to ensure consistency in character names, locations, rules, and plot points." }, ];
const DigitalPublishingAIView: FC = () => {
    type Tab = 'studio' | 'distribution' | 'analytics' | 'rights_splits' | 'marketing' | 'audiobook' | 'world_building' | 'tasks' | 'help';
    const [activeTab, setActiveTab] = useState<Tab>('studio');
    const loading = useAppStore(state => state.loading);
    const setLoading = useAppStore(state => state.setLoading);
    const addToast = useAppStore(state => state.addToast);
    const setView = useAppStore(state => state.setView);
    const books = useAppStore(state => state.publishing.books);
    const addBook = useAppStore(state => state.addBook);
    const updateBook = useAppStore(state => state.updateBook);
    const addChapter = useAppStore(state => state.addChapter);
    const updateChapterContent = useAppStore(state => state.updateChapterContent);
    const activeTabOverride = useAppStore(state => state.onboarding.activeTabOverride);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const selectedBook = useMemo(() => books.find(b => b.id === parseInt(selectedBookId, 10)), [books, selectedBookId]);
    const [isNavModalOpen, setNavModalOpen] = useState(false);
    const [nextNavigationAction, setNextNavigationAction] = useState<(() => void) | null>(null);
    const [isManuscriptDirty, setManuscriptDirty] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newBookTitle, setNewBookTitle] = useState('');
    const [newBookAuthor, setNewBookAuthor] = useState('');
    const [newBookGenre, setNewBookGenre] = useState('Sci-Fi');
    const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [manuscriptText, setManuscriptText] = useState('');
    const [lastManuscriptState, setLastManuscriptState] = useState<string | null>(null);
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const [illustrationPrompt, setIllustrationPrompt] = useState('');
    const [generatedIllustration, setGeneratedIllustration] = useState<BookIllustration | null>(null);
    const [salesForecast, setSalesForecast] = useState('');
    const [marketingAssets, setMarketingAssets] = useState('');
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [worldBuildingEntry, setWorldBuildingEntry] = useState('Characters:\n- Detective Kaito: A grizzled veteran of the force.\n\nLocations:\n- Neo-Kyoto: A sprawling metropolis drenched in neon.');
    const [consistencyResult, setConsistencyResult] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const manuscriptEditorRef = useRef<HTMLTextAreaElement>(null);
    const areSplitsDirty = useMemo(() => { if (!selectedBook || activeTab !== 'rights_splits') return false; const cleanedCurrentSplits = collaborators.filter(c => c.name.trim() !== '' || c.share.trim() !== ''); return JSON.stringify(cleanedCurrentSplits) !== JSON.stringify(selectedBook.splits); }, [collaborators, selectedBook, activeTab]);
    const isDirty = useMemo(() => { if (activeTab === 'studio') return isManuscriptDirty; if (activeTab === 'rights_splits') return areSplitsDirty; return false; }, [activeTab, isManuscriptDirty, areSplitsDirty]);
    const handleNavigate = useCallback((action: () => void) => { if (isDirty) { setNextNavigationAction(() => action); setNavModalOpen(true); } else { action(); } }, [isDirty]);
    const applyAiChange = useCallback((newText: string) => { if (selectedBook) { setLastManuscriptState(manuscriptText); setManuscriptText(newText); setManuscriptDirty(true); updateChapterContent(selectedBook.id, activeChapterIndex, newText); } }, [selectedBook, manuscriptText, activeChapterIndex, updateChapterContent]);
    const handleProofread = useCallback(async () => { if (!manuscriptText) return; setLoading('proofread', true); try { const prompt = `Proofread for grammar and spelling errors. Return only the corrected text:\n---\n${manuscriptText}`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); applyAiChange(response.text); addToast("Proofreading complete.", "success"); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('proofread', false); } }, [manuscriptText, setLoading, applyAiChange, addToast]);
    const handlePlotAnalysis = useCallback(async () => { if (!manuscriptText) return; setLoading('plotAnalysis', true); setAnalysisResult(''); try { const prompt = `Analyze the plot for issues (pacing, holes, consistency). Provide a concise bulleted list:\n---\n${manuscriptText}`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); setAnalysisResult(response.text); setAnalysisModalOpen(true); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('plotAnalysis', false); } }, [manuscriptText, setLoading, addToast]);
    const handleEnrichProse = useCallback(async () => { if (!manuscriptText) return; setLoading('enrichment', true); try { const prompt = `Rewrite to be more descriptive and engaging. Keep original meaning. Return only rewritten text:\n---\n${manuscriptText}`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); applyAiChange(response.text); addToast("Prose enriched.", "success"); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('enrichment', false); } }, [manuscriptText, setLoading, applyAiChange, addToast]);
    useEffect(() => { if (activeTabOverride) { setActiveTab(activeTabOverride as Tab); } }, [activeTabOverride]);
    useEffect(() => { if (books.length > 0 && !selectedBookId) { setSelectedBookId(books[0].id.toString()); } }, [books, selectedBookId]);
    useEffect(() => { setLastManuscriptState(null); if (selectedBook) { setManuscriptText(selectedBook.chapters[activeChapterIndex]?.content || ''); setManuscriptDirty(false); } else { setManuscriptText(''); } }, [selectedBook, activeChapterIndex]);
    useEffect(() => { if (selectedBook && activeTab === 'rights_splits') { setCollaborators([...selectedBook.splits]); } }, [selectedBook, activeTab]);
    useEffect(() => { const editor = manuscriptEditorRef.current; if (!editor) return; const handleKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && manuscriptText) { let handled = false; if (event.key.toLowerCase() === 'p') { handleProofread(); handled = true; } if (event.key.toLowerCase() === 'i') { handlePlotAnalysis(); handled = true; } if (event.key.toLowerCase() === 'e') { handleEnrichProse(); handled = true; } if (handled) event.preventDefault(); } }; editor.addEventListener('keydown', handleKeyDown); return () => editor.removeEventListener('keydown', handleKeyDown); }, [manuscriptText, handleProofread, handlePlotAnalysis, handleEnrichProse]);
    const handleManuscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { const newContent = e.target.value; setManuscriptText(newContent); setManuscriptDirty(true); if (selectedBook) { updateChapterContent(selectedBook.id, activeChapterIndex, newContent); } };
    const handleChapterChange = (index: number) => { handleNavigate(() => setActiveChapterIndex(index)); };
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file && selectedBook) { const reader = new FileReader(); reader.onload = async (e) => { const text = e.target?.result as string; const updatedChapters = [{ title: "Chapter 1 (from TXT)", content: text }]; await updateBook(selectedBook.id, { chapters: updatedChapters }); setActiveChapterIndex(0); setManuscriptText(text); setLastManuscriptState(null); setManuscriptDirty(true); addToast("Manuscript uploaded.", "success"); }; reader.readAsText(file); } if(event.target) { event.target.value = ''; } };
    const triggerFileUpload = () => { fileInputRef.current?.click(); };
    const handleCreateNewChapter = async () => { if (!selectedBook) return; const action = () => { addChapter(selectedBook.id); setActiveChapterIndex(selectedBook.chapters.length); addToast("New chapter added.", "success"); }; handleNavigate(action); };
    const handleUndo = () => { if (selectedBook && lastManuscriptState !== null) { setManuscriptText(lastManuscriptState); updateChapterContent(selectedBook.id, activeChapterIndex, lastManuscriptState); setManuscriptDirty(true); setLastManuscriptState(null); addToast("AI change reverted.", "success"); } };
    const handleGenerateIllustration = async () => { if (!illustrationPrompt) return; setLoading('illustration', true); setGeneratedIllustration(null); try { const response = await api.generateImages({ model: 'imagen-4.0-generate-001', prompt: illustrationPrompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '9:16' } }); const newIllustration = { url: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`, prompt: illustrationPrompt }; setGeneratedIllustration(newIllustration); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('illustration', false); } };
    const handleSaveIllustration = async () => { if (selectedBook && generatedIllustration) { const updatedIllustrations = [...selectedBook.illustrations, generatedIllustration]; await updateBook(selectedBook.id, { illustrations: updatedIllustrations }); setGeneratedIllustration(null); setIllustrationPrompt(''); addToast("Illustration saved.", "success"); } };
    const handleGenerateCover = async () => { if (!selectedBook) return; setLoading('bookCover', true); try { const prompt = `A professional book cover for a ${selectedBook.genre} book titled "${selectedBook.title}" by ${selectedBook.author}. Modern, eye-catching design.`; const response = await api.generateImages({ model: 'imagen-4.0-generate-001', prompt: prompt, config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '2:3' } }); const imageUrl = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`; await updateBook(selectedBook.id, { coverImageUrl: imageUrl }); addToast("Book cover generated.", "success"); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('bookCover', false); } };
    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file || !selectedBook) return; setLoading('bookCover', true); try { const { presignedUrl, fileUrl } = await api.getPresignedUrl(file.name, file.type); await api.uploadFileToS3(presignedUrl, file); await updateBook(selectedBook.id, { coverImageUrl: fileUrl }); addToast("Okładka została pomyślnie przesłana!", "success"); } catch (error) { console.error(error); addToast((error as Error).message, 'error'); } finally { setLoading('bookCover', false); if (event.target) event.target.value = ''; } };
    const handleCreateBook = async (e: React.FormEvent) => { e.preventDefault(); if (!newBookTitle.trim() || !newBookAuthor.trim()) return; const newBookData: Omit<Book, 'id'> = { title: newBookTitle, author: newBookAuthor, genre: newBookGenre, status: 'Draft', rights: { territorial: true, translation: false, adaptation: false, audio: false, drm: true }, splits: [{ name: newBookAuthor, share: '100' }], chapters: [{ title: 'Chapter 1', content: '' }], blurb: '', keywords: '', illustrations: [], coverImageUrl: '', }; const newId = await addBook(newBookData); if (newId) { setSelectedBookId(newId); setCreateModalOpen(false); setNewBookTitle(''); setNewBookAuthor(''); setActiveTab('studio'); addToast(`Book "${newBookData.title}" created!`, "success"); } };
    const handleToggleRight = async (rightKey: keyof BookRights) => { if (!selectedBook) return; const updatedRights = { ...selectedBook.rights, [rightKey]: !selectedBook.rights[rightKey] }; await updateBook(selectedBook.id, { rights: updatedRights }); };
    const handleAddCollaborator = () => setCollaborators(prev => [...prev, { name: '', share: '' }]);
    const handleCollaboratorChange = (index: number, field: 'name' | 'share', value: string) => { const newCollaborators = [...collaborators]; if (field === 'share' && (value === '' || /^\d*\.?\d*$/.test(value))) { newCollaborators[index][field] = parseFloat(value) > 100 ? '100' : value; } else if (field === 'name') { newCollaborators[index][field] = value; } setCollaborators(newCollaborators); };
    const handleSaveSplits = () => { if(!selectedBook) return; const cleanedCollaborators = collaborators.filter(c => c.name.trim() !== '' || c.share.trim() !== ''); updateBook(selectedBook.id, { splits: cleanedCollaborators }); setCollaborators(cleanedCollaborators); addToast(`Splits for "${selectedBook.title}" updated.`, 'success'); };
    const totalSplit = useMemo(() => collaborators.reduce((sum, collab) => sum + (parseFloat(collab.share) || 0), 0), [collaborators]);
    const handleGenerateSalesForecast = async () => { if (!selectedBook) return; setLoading('salesForecast', true); setSalesForecast(''); try { const prompt = `Provide a short, speculative sales forecast for a new "${selectedBook.genre}" book. For a fictional scenario.`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); setSalesForecast(response.text); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('salesForecast', false); } };
    const handleGenerateBlurb = async () => { if (!selectedBook || !manuscriptText) return; setLoading('blurb', true); try { const prompt = `Generate a compelling, one-paragraph book blurb for a ${selectedBook.genre} novel titled "${selectedBook.title}", using this excerpt:\n---\n${manuscriptText.substring(0, 2000)}`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); await updateBook(selectedBook.id, { blurb: response.text }); addToast("Blurb generated and saved.", "success"); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('blurb', false); } };
    const handleGenerateKeywords = async () => { if (!selectedBook) return; setLoading('keywords', true); try { const prompt = `Generate a comma-separated list of 10 effective SEO keywords for a ${selectedBook.genre} book titled "${selectedBook.title}".`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); await updateBook(selectedBook.id, { keywords: response.text }); addToast("Keywords generated and saved.", "success"); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('keywords', false); } };
    const handleGenerateMarketingAssets = async () => { if (!selectedBook) return; setLoading('marketingAssets', true); setMarketingAssets(''); try { const prompt = `Create a short, exciting social media post for the book release of "${selectedBook.title}" by ${selectedBook.author} (${selectedBook.genre}). Include hashtags.`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); setMarketingAssets(response.text); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('marketingAssets', false); } };
    const handleCheckConsistency = async () => { if (!manuscriptText || !worldBuildingEntry) return; setLoading('worldConsistency', true); setConsistencyResult(''); try { const prompt = `Compare the "World Bible" with the manuscript for major inconsistencies. If none, state it's consistent.\n\nWORLD BIBLE:\n${worldBuildingEntry}\n\nMANUSCRIPT:\n${manuscriptText.substring(0, 4000)}`; const response = await api.generateContent({ model: 'gemini-2.5-flash', contents: prompt }); setConsistencyResult(response.text); } catch (e) { console.error(e); addToast((e as Error).message, 'error'); } finally { setLoading('worldConsistency', false); } };
    const handleCancelNavigation = () => { setNavModalOpen(false); setNextNavigationAction(null); };
    const handleDiscardAndNavigate = () => { if (activeTab === 'studio' && selectedBook) { setManuscriptText(selectedBook.chapters[activeChapterIndex]?.content || ''); setManuscriptDirty(false); } if (activeTab === 'rights_splits' && selectedBook) { setCollaborators([...selectedBook.splits]); } if (nextNavigationAction) { nextNavigationAction(); } handleCancelNavigation(); };
    const handleSaveAndNavigate = async () => { if (activeTab === 'studio' && selectedBook && isManuscriptDirty) { await api.updateBook(selectedBook.id, { chapters: selectedBook.chapters }); setManuscriptDirty(false); } if (activeTab === 'rights_splits') { handleSaveSplits(); } if (nextNavigationAction) { nextNavigationAction(); } handleCancelNavigation(); };
    const renderContent = () => {
        if (books.length === 0 && activeTab !== 'tasks' && activeTab !== 'help') {
             return ( <div className="empty-state-card large-span"><h3>Your Bookshelf is Empty</h3><p>Start your publishing journey by creating your first book.</p><button className="card-button" onClick={() => setCreateModalOpen(true)}>Create New Book</button></div> );
        }
        switch (activeTab) {
            case 'studio': return ( <div className="studio-layout large-span"><div className="studio-editor">{selectedBook ? ( <><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}><h3>{selectedBook.title} - Editor</h3><select className="styled-select" value={selectedBookId} onChange={e => handleNavigate(() => setSelectedBookId(e.target.value))} style={{maxWidth: '200px'}}>{books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div><textarea ref={manuscriptEditorRef} className="manuscript-editor" value={manuscriptText} onChange={handleManuscriptChange} placeholder="Start writing..." /></> ) : <h3>Select a book to start editing</h3> }</div><div className="studio-sidebar">{selectedBook && ( <><div className="sidebar-section"><h4>Chapters</h4><ul className="chapter-list">{selectedBook.chapters.map((chapter, index) => ( <li key={index} className={index === activeChapterIndex ? 'active' : ''} onClick={() => handleChapterChange(index)}>{chapter.title}</li> ))}</ul><div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}><button className="button-secondary" onClick={handleCreateNewChapter} style={{flex: 1}}>New Chapter</button><input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" style={{ display: 'none' }} /><button className="button-secondary" onClick={triggerFileUpload} style={{flex: 1}}>Upload .txt</button></div></div><div className="sidebar-section"><h4>AI Writing Assistant</h4><div className="ai-assistant-tools"><Tooltip text="Proofread. (Ctrl/Cmd + P)"><button onClick={handleProofread} disabled={loading.proofread || !manuscriptText}>{loading.proofread ? '...' : 'Proofread'}</button></Tooltip><Tooltip text="Analyze plot. (Ctrl/Cmd + I)"><button onClick={handlePlotAnalysis} disabled={loading.plotAnalysis || !manuscriptText}>{loading.plotAnalysis ? '...' : 'Analyze Plot'}</button></Tooltip><Tooltip text="Enrich prose. (Ctrl/Cmd + E)"><button onClick={handleEnrichProse} disabled={loading.enrichment || !manuscriptText}>{loading.enrichment ? '...' : 'Enrich Prose'}</button></Tooltip>{lastManuscriptState !== null && (<Tooltip text="Revert AI change."><button onClick={handleUndo} className="undo-button-specific">Undo</button></Tooltip>)}</div></div><div className="sidebar-section"><h4>AI Illustration Assistant</h4><div className="form-section"><label htmlFor="illustration-prompt">Illustration Prompt</label><textarea id="illustration-prompt" className="form-section textarea" rows={3} value={illustrationPrompt} onChange={e => setIllustrationPrompt(e.target.value)} placeholder="e.g., A neon-drenched city..." /></div><button onClick={handleGenerateIllustration} disabled={loading.illustration || !illustrationPrompt} className="card-button">{loading.illustration ? 'Generating...' : 'Generate Illustration'}</button><div className="result-area small" style={{marginTop: '1rem'}}>{loading.illustration ? <div className="loader" /> : (generatedIllustration ? <img src={generatedIllustration.url} alt={generatedIllustration.prompt} /> : <p>Illustration here.</p>)}</div>{generatedIllustration && <button onClick={handleSaveIllustration} className="button-secondary" style={{width: '100%', marginTop: '0.5rem'}}>Save to Gallery</button>}{selectedBook.illustrations.length > 0 && ( <div className="illustration-gallery">{selectedBook.illustrations.map((ill, idx) => <img key={idx} src={ill.url} alt={ill.prompt} />)}</div> )}</div></> )}{!selectedBook && books.length > 0 && ( <div className="sidebar-section"><p>Select a book to begin.</p></div> )}</div></div> );
            case 'distribution': return ( <div className="module-list-card large-span"><h3>Your Books</h3><ul className="item-list">{books.map(book => ( <li key={book.id}><div><span className="item-title">{book.title}</span><span className="item-subtitle">{book.author}</span></div><span className={`item-status status--${book.status.toLowerCase().replace(' ', '-')}`}>{book.status}</span></li> ))}</ul><button className="card-button" style={{marginTop: '2rem', maxWidth: '200px'}} onClick={() => setCreateModalOpen(true)}>Create New Book</button></div> );
            case 'analytics': return ( <div className="large-span"><div className="module-info-grid"><div className="module-info-card"><h4>Total Sales</h4><div className="stat">10,482</div></div><div className="module-info-card"><h4>Total Revenue</h4><div className="stat">$41,392</div></div><div className="module-info-card"><h4>Top Retailer</h4><div className="stat">Amazon</div></div></div><div className="module-content-grid"><AIToolCard title="AI Sales Forecast" onGenerate={handleGenerateSalesForecast} isLoading={loading.salesForecast} buttonText="Forecast Sales"><p>Get a speculative sales forecast for your book.</p><div className="result-area">{loading.salesForecast ? <div className="loader"/> : <pre>{salesForecast || 'Forecast here.'}</pre>}</div></AIToolCard></div></div> );
            case 'rights_splits': return ( <div className="module-tool-card large-span"><h3>Manage Rights & Splits</h3><div className="form-section"><label htmlFor="book-select-rights">Select Book</label><select id="book-select-rights" className="styled-select" value={selectedBookId} onChange={e => handleNavigate(() => setSelectedBookId(e.target.value))}>{books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div>{selectedBook && ( <><h4>Publishing Rights</h4><div className="rights-grid">{RIGHTS_DEFINITIONS.map(right => ( <div key={right.key} className="right-item"><Tooltip text={right.description} inline><label htmlFor={right.key}>{right.label}</label></Tooltip><label className="toggle-switch"><input type="checkbox" id={right.key} checked={selectedBook.rights[right.key]} onChange={() => handleToggleRight(right.key)} /><span className="slider"></span></label></div> ))}</div><div className="split-sheet-editor" style={{marginTop: '2rem'}}><h4>Royalty Splits</h4>{collaborators.map((collab, index) => ( <div key={index} className="collaborator-row"><input type="text" placeholder="Collaborator Name" value={collab.name} onChange={e => handleCollaboratorChange(index, 'name', e.target.value)} /><input type="text" inputMode="decimal" placeholder="%" className="share-input" value={collab.share} onChange={e => handleCollaboratorChange(index, 'share', e.target.value)} /></div> ))}<button onClick={handleAddCollaborator} className="add-collaborator-btn">+ Add Collaborator</button><div className={`total-percentage ${totalSplit !== 100 ? 'total-percentage--invalid' : ''}`}>Total: {totalSplit}%</div><button onClick={handleSaveSplits} className="card-button" disabled={totalSplit !== 100}>Save Splits</button></div></> )}</div> );
            case 'marketing': return ( <div className="large-span module-content-grid"><AIToolCard title="Book Cover" onGenerate={handleGenerateCover} isLoading={loading.bookCover} buttonText="Generate Cover with AI">{selectedBook && ( <div className="cover-preview">{selectedBook.coverImageUrl && <img src={selectedBook.coverImageUrl} alt="Book cover"/>}<div className="cover-overlay"><h3 className="cover-title">{selectedBook.title}</h3><p className="cover-author">{selectedBook.author}</p></div></div> )}<p>Generate a cover or upload your own.</p><div style={{ marginTop: '1rem' }}><input type="file" id="cover-upload" accept="image/png, image/jpeg" onChange={handleCoverUpload} style={{ display: 'none' }} disabled={loading.bookCover} /><label htmlFor="cover-upload" className="card-button button-secondary" style={{ width: '100%', textAlign: 'center', display: 'inline-block', boxSizing: 'border-box' }}>{loading.bookCover ? 'Uploading...' : 'Upload Your Own Cover'}</label></div></AIToolCard><div className="module-tool-card"><h3>Marketing Content</h3><AIToolCard title="AI Blurb Generator" onGenerate={handleGenerateBlurb} isLoading={loading.blurb} buttonText="Generate Blurb"><div className="result-area small"><pre>{selectedBook?.blurb || 'Blurb here.'}</pre></div></AIToolCard><AIToolCard title="AI Keyword Generator" onGenerate={handleGenerateKeywords} isLoading={loading.keywords} buttonText="Generate Keywords"><div className="result-area small"><pre>{selectedBook?.keywords || 'Keywords here.'}</pre></div></AIToolCard><AIToolCard title="AI Social Media Assistant" onGenerate={handleGenerateMarketingAssets} isLoading={loading.marketingAssets} buttonText="Generate Social Post"><div className="result-area small"><pre>{marketingAssets || 'Post here.'}</pre></div></AIToolCard></div></div> );
            case 'world_building': return ( <div className="large-span module-content-grid"><div className="module-tool-card"><h3>World Bible Editor</h3><p>Keep track of your world's characters, locations, and rules here.</p><textarea className="world-building-editor" rows={15} value={worldBuildingEntry} onChange={e => setWorldBuildingEntry(e.target.value)} /></div><AIToolCard title="AI Consistency Checker" onGenerate={handleCheckConsistency} isLoading={loading.worldConsistency} buttonText="Check Against Manuscript"><p>AI will analyze your current chapter against your World Bible.</p><div className="result-area"><pre>{consistencyResult || 'Consistency report here.'}</pre></div></AIToolCard></div> );
            case 'tasks': return <TaskManager module="publishing" />;
            case 'help': return <HelpView title="Digital Publishing AI Tools Help" topics={PUBLISHING_AI_HELP_TOPICS} />;
            default: return null;
        }
    };
    const formatTabName = (tab: Tab): string => { const name = tab.charAt(0).toUpperCase() + tab.slice(1); if (tab === 'rights_splits') return 'Rights & Splits'; if (tab === 'world_building') return 'World Building'; return name; };
    return ( <ModuleView title="Digital Publishing AI" onBack={() => handleNavigate(() => setView('DASHBOARD'))}><div className="tabs-container"><nav className="tab-nav">{(['studio', 'distribution', 'analytics', 'rights_splits', 'marketing', 'world_building', 'tasks', 'help'] as Tab[]).map(tab => ( <button key={tab} className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => handleNavigate(() => setActiveTab(tab))}>{formatTabName(tab)}</button> ))}</nav><div className="tab-content">{renderContent()}</div></div><Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Book"><form onSubmit={handleCreateBook}><div className="form-section"><label>Title</label><input type="text" value={newBookTitle} onChange={e => setNewBookTitle(e.target.value)} required /></div><div className="form-section"><label>Author</label><input type="text" value={newBookAuthor} onChange={e => setNewBookAuthor(e.target.value)} required /></div><div className="form-section"><label>Genre</label><select className="styled-select" value={newBookGenre} onChange={e => setNewBookGenre(e.target.value)}><option>Sci-Fi</option><option>Fantasy</option><option>Thriller</option><option>Romance</option><option>Non-Fiction</option></select></div><div className="modal-actions" style={{justifyContent: 'flex-end'}}><button type="button" className="button-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button><button type="submit" className="card-button">Create Book</button></div></form></Modal><Modal isOpen={isAnalysisModalOpen} onClose={() => setAnalysisModalOpen(false)} title="AI Plot Analysis"><pre>{analysisResult}</pre></Modal><ConfirmationModal isOpen={isNavModalOpen} onClose={handleCancelNavigation} title="Unsaved Changes" onSave={handleSaveAndNavigate} onDiscard={handleDiscardAndNavigate}><p>You have unsaved changes. Would you like to save them before navigating away?</p></ConfirmationModal></ModuleView> );
};

const FullScreenLoader: FC = () => ( <div className="fullscreen-loader"><div className="loader"></div><p>Loading Your Creative Universe...</p></div> );

const App = () => {
    const view = useAppStore(state => state.view);
    const setView = useAppStore(state => state.setView);
    const isInitialized = useAppStore(state => state.isInitialized);
    const initializeApp = useAppStore(state => state.initializeApp);
    const tourStepIndex = useAppStore(state => state.onboarding.tourStepIndex);
    const startTour = useAppStore(state => state.startTour);
    const nextTourStep = useAppStore(state => state.nextTourStep);
    const skipTour = useAppStore(state => state.skipTour);
    const currentTourStep = tourStepIndex >= 0 ? TOUR_STEPS[tourStepIndex] : null;

    useEffect(() => {
        initializeApp().then(() => {
            const onboardingComplete = useAppStore.getState().onboarding.onboardingComplete;
            if (!onboardingComplete) {
                // startTour(); // Tymczasowo wyłączone dla ułatwienia developmentu
            }
        });
    }, [initializeApp]);

    if (!isInitialized) {
        return <FullScreenLoader />;
    }

    return (
        <>
            <Header />
            <main className="container">
                {view === 'DASHBOARD' && (
                    <>
                        <div className="main-heading"><h1>Your Creative Universe</h1><p>One unified dashboard for your music and literature projects, supercharged by AI.</p></div>
                        <div className="dashboard-grid">
                            <DashboardCard icon="🎵" title="Music Publishing" description="Manage your releases, from metadata generation and cover art to sync licensing and royalty splits." onClick={() => setView('MUSIC')} />
                            <DashboardCard icon="📚" title="Digital Publishing" description="Tools for authors to write, edit, market, and distribute their books, with AI-powered assistance at every step." onClick={() => setView('PUBLISHING')} />
                        </div>
                    </>
                )}
                {view === 'MUSIC' && <MusicPublishingView />}
                {view === 'PUBLISHING' && <DigitalPublishingAIView />}
            </main>
            {currentTourStep && ( <OnboardingTour stepConfig={currentTourStep} onNext={nextTourStep} onSkip={skipTour} isLastStep={tourStepIndex === TOUR_STEPS.length - 1} /> )}
            <ToastContainer />
        </>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

