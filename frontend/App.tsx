import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Header from './components/Header';
import DashboardCard from './components/DashboardCard';
import ToastContainer from './components/ToastContainer';
import FullScreenLoader from './components/FullScreenLoader';
import OnboardingTour, { TOUR_STEPS } from './components/OnboardingTour';
import MusicPublishingView from './pages/music/MusicPage';
import DigitalPublishingAIView from './pages/publishing/PublishingPage';
import { useAppStore } from './store/appStore';

export default function App() {
  const { isInitialized, initializeApp, view, setView, tourStepIndex, startTour, nextTourStep, skipTour } = useAppStore(state => ({
    isInitialized: state.isInitialized,
    initializeApp: state.initializeApp,
    view: state.view,
    setView: state.setView,
    tourStepIndex: state.onboarding.tourStepIndex,
    startTour: state.startTour,
    nextTourStep: state.nextTourStep,
    skipTour: state.skipTour,
  }));
  const currentTourStep = tourStepIndex >= 0 ? TOUR_STEPS[tourStepIndex] : null;

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    if (isInitialized) {
      const onboardingComplete = useAppStore.getState().onboarding.onboardingComplete;
      if (!onboardingComplete) {
        startTour();
      }
    }
  }, [isInitialized, startTour]);

  if (!isInitialized) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <Header />
      <main className="container">
        {view === 'DASHBOARD' && (
          <>
            <div className="main-heading">
              <h1>Your Creative Universe</h1>
              <p>One unified dashboard for your music and literature projects, supercharged by AI.</p>
            </div>
            <div className="dashboard-grid">
              <DashboardCard icon="🎵" title="Music Publishing" description="Manage your releases, from metadata generation and cover art to sync licensing and royalty splits." onClick={() => setView('MUSIC')} />
              <DashboardCard icon="📚" title="Digital Publishing" description="Tools for authors to write, edit, market, and distribute their books, with AI-powered assistance at every step." onClick={() => setView('PUBLISHING')} />
            </div>
          </>
        )}
        {view === 'MUSIC' && <MusicPublishingView />}
        {view === 'PUBLISHING' && <DigitalPublishingAIView />}
      </main>
      {currentTourStep && (
        <OnboardingTour stepConfig={currentTourStep} onNext={nextTourStep} onSkip={skipTour} isLastStep={tourStepIndex === TOUR_STEPS.length - 1} />
      )}
      <ToastContainer />
    </>
  );
}