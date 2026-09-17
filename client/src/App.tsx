import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { InstallPromptBanner } from './components/InstallPromptBanner';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-brand-dark-bg text-brand-ink dark:text-slate-100 selection:bg-brand-blue/20 selection:text-brand-ink transition-colors duration-200 pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
      <Footer />
      <InstallPromptBanner />
    </div>
  );
};

export default App;
