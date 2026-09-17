import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Home,
  User,
  HelpCircle,
  Zap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-brand-dark-bg/95 backdrop-blur-md border-b border-brand-border dark:border-brand-dark-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo size="md" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] inline-flex items-center ${
                  isActive('/')
                    ? 'text-brand-blue bg-brand-blue-light/50 dark:bg-brand-blue/15'
                    : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-brand-dark-surface'
                }`}
              >
                Home
              </Link>
              <a
                href="/#how-it-works"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-brand-dark-surface transition-colors min-h-[44px] inline-flex items-center"
              >
                How it works
              </a>
              <a
                href="/#features"
                className="px-3.5 py-2 rounded-full text-sm font-medium text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-brand-dark-surface transition-colors min-h-[44px] inline-flex items-center"
              >
                Features
              </a>
              <Link
                to="/upload"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 min-h-[44px] ${
                  isActive('/upload')
                    ? 'text-brand-blue bg-brand-blue-light/50 dark:bg-brand-blue/15'
                    : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-brand-dark-surface'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                Generate quiz
              </Link>
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 min-h-[44px] ${
                  isActive('/dashboard')
                    ? 'text-brand-blue bg-brand-blue-light/50 dark:bg-brand-blue/15'
                    : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white hover:bg-slate-50 dark:hover:bg-brand-dark-surface'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </nav>

            {/* Desktop Right Action buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border text-xs font-medium text-brand-ink dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark-card transition-colors min-h-[44px]"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    {user.isGuest && <span className="text-[10px] text-brand-orange font-semibold">(Guest)</span>}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    title="Sign out"
                    className="p-2.5 rounded-full text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white hover:bg-slate-100 dark:hover:bg-brand-dark-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="btn-pill-outline text-xs px-4 py-2 min-h-[44px]">
                  Log in
                </Link>
              )}

              <Link to="/upload" className="btn-pill-primary text-xs md:text-sm px-5 py-2.5 min-h-[44px]">
                Upload notes
              </Link>
            </div>

            {/* Mobile Header Actions: Theme Toggle + Branded Pill Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-brand-border dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-surface text-brand-ink dark:text-white min-h-[44px] min-w-[44px] hover:border-brand-blue/50 active:scale-95 transition-all"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <>
                    <X className="w-4 h-4 text-brand-orange" />
                    <span className="text-xs font-medium">Close</span>
                  </>
                ) : (
                  <>
                    <Menu className="w-4 h-4 text-brand-blue" />
                    <span className="text-xs font-medium">Menu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide-down menu sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-border/60 dark:border-brand-dark-border/60">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Quick Navigation</span>
              <span className="text-[11px] text-brand-blue font-medium">StayAheadd PWA</span>
            </div>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors min-h-[44px] ${
                isActive('/')
                  ? 'bg-brand-blue-subtle text-brand-blue dark:bg-brand-blue/15'
                  : 'text-brand-ink dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-brand-dark-surface'
              }`}
            >
              <Home className="w-4 h-4 text-brand-blue" />
              <span>Home</span>
            </Link>

            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-brand-muted dark:text-brand-dark-muted hover:bg-slate-50 dark:hover:bg-brand-dark-surface min-h-[44px]"
            >
              <HelpCircle className="w-4 h-4 text-brand-orange" />
              <span>How it works</span>
            </a>

            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-brand-muted dark:text-brand-dark-muted hover:bg-slate-50 dark:hover:bg-brand-dark-surface min-h-[44px]"
            >
              <Zap className="w-4 h-4 text-brand-blue" />
              <span>Features</span>
            </a>

            <Link
              to="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark min-h-[44px] shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-white" />
                <span>Create New Quiz</span>
              </div>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Instant</span>
            </Link>

            <div className="pt-3 mt-2 border-t border-brand-border dark:border-brand-dark-border">
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-brand-ink dark:text-white truncate max-w-[150px]">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-brand-muted dark:text-brand-dark-muted">
                        {user.isGuest ? 'Guest User' : user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors min-h-[44px] flex items-center"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-pill-outline w-full text-center text-sm py-3 min-h-[44px]"
                >
                  Log in or Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Native Mobile Bottom Navigation Bar (Pill / Rounded Brand Styling) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-brand-dark-bg/95 backdrop-blur-xl border-t border-brand-border dark:border-brand-dark-border transition-colors pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-4 items-center h-16 px-2 max-w-md mx-auto">
          {/* Home Tab */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors rounded-xl ${
              isActive('/')
                ? 'text-brand-blue font-semibold'
                : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive('/') ? 'bg-brand-blue/10' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          {/* Generate Quiz Center Tab (Elevated brand pill) */}
          <Link
            to="/upload"
            className="flex flex-col items-center justify-center h-full min-h-[44px] relative -top-2 group"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                isActive('/upload')
                  ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20 shadow-orange-500/30'
                  : 'bg-brand-blue text-white shadow-brand-blue/40 group-hover:scale-105'
              }`}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-0.5 font-semibold text-brand-ink dark:text-white">Create</span>
          </Link>

          {/* Dashboard Tab */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors rounded-xl ${
              isActive('/dashboard')
                ? 'text-brand-blue font-semibold'
                : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive('/dashboard') ? 'bg-brand-blue/10' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">History</span>
          </Link>

          {/* Account / Auth Tab */}
          <Link
            to={user ? '/dashboard' : '/auth'}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors rounded-xl ${
              isActive('/auth')
                ? 'text-brand-blue font-semibold'
                : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive('/auth') ? 'bg-brand-blue/10' : ''}`}>
              {user ? (
                <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
              {user ? 'Account' : 'Sign in'}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};
