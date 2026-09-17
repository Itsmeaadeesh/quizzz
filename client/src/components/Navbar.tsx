import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sparkles, LayoutDashboard, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-border">
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
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/') ? 'text-brand-blue bg-brand-blue-light/50' : 'text-brand-muted hover:text-brand-ink hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <a
              href="/#how-it-works"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-brand-muted hover:text-brand-ink hover:bg-slate-50 transition-colors"
            >
              How it works
            </a>
            <a
              href="/#features"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-brand-muted hover:text-brand-ink hover:bg-slate-50 transition-colors"
            >
              Features
            </a>
            <Link
              to="/upload"
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                isActive('/upload') ? 'text-brand-blue bg-brand-blue-light/50' : 'text-brand-muted hover:text-brand-ink hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              Generate quiz
            </Link>
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                isActive('/dashboard') ? 'text-brand-blue bg-brand-blue-light/50' : 'text-brand-muted hover:text-brand-ink hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-brand-border text-xs font-medium text-brand-ink hover:bg-slate-100 transition-colors"
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
                  className="p-2 rounded-full text-brand-muted hover:text-brand-ink hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-pill-outline text-xs px-4 py-2">
                Log in
              </Link>
            )}

            <Link to="/upload" className="btn-pill-primary text-xs md:text-sm px-5 py-2.5">
              Upload notes
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/upload" className="btn-pill-primary text-xs px-3.5 py-1.5">
              Upload
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-ink hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-ink hover:bg-slate-50"
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:bg-slate-50"
          >
            How it works
          </a>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:bg-slate-50"
          >
            Features
          </a>
          <Link
            to="/upload"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-blue bg-brand-blue-light/40"
          >
            Generate quiz
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-medium text-brand-ink hover:bg-slate-50"
          >
            Dashboard
          </Link>

          <div className="pt-4 border-t border-brand-border flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-brand-muted">Signed in as {user.name}</span>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-500 font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-pill-outline w-full text-center text-sm py-2"
              >
                Log in / Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
