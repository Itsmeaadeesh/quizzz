import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          navigate('/dashboard');
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    signInAsGuest();
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-dots-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold text-brand-ink dark:text-white">
          {isSignUp ? 'Create your study account' : 'Welcome back to StayAheadd'}
        </h2>
        <p className="mt-2 text-sm text-brand-muted dark:text-brand-dark-muted">
          {isSignUp
            ? 'Start converting lecture slides and notes into instant quizzes.'
            : 'Access your saved study quizzes, results, and learning history.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card-soft bg-white dark:bg-brand-dark-card dark:border-brand-dark-border p-8 sm:p-10 shadow-xl border-brand-border">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1">Full name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-muted dark:text-brand-dark-muted absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border dark:border-brand-dark-border dark:bg-brand-dark-surface dark:text-white dark:placeholder-slate-500 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted dark:text-brand-dark-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border dark:border-brand-dark-border dark:bg-brand-dark-surface dark:text-white dark:placeholder-slate-500 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted dark:text-brand-dark-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border dark:border-brand-dark-border dark:bg-brand-dark-surface dark:text-white dark:placeholder-slate-500 text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-primary w-full text-sm py-3 mt-2 shadow-md"
            >
              {loading
                ? 'Processing…'
                : isSignUp
                ? 'Sign up with email'
                : 'Sign in to StayAheadd'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-brand-border dark:bg-brand-dark-border" />
            <span className="text-xs text-brand-muted dark:text-brand-dark-muted uppercase">or</span>
            <div className="flex-1 h-px bg-brand-border dark:bg-brand-dark-border" />
          </div>

          {/* Social / Guest options */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="btn-pill-outline w-full text-xs sm:text-sm py-2.5 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={handleGuest}
              className="btn-pill bg-slate-100 dark:bg-brand-dark-surface hover:bg-slate-200 dark:hover:bg-brand-dark-card text-brand-ink dark:text-slate-200 text-xs sm:text-sm w-full py-2.5 flex items-center justify-center gap-2 border border-transparent dark:border-brand-dark-border"
            >
              <Sparkles className="w-4 h-4 text-brand-orange" />
              Continue as guest (No login required)
            </button>
          </div>

          {/* Toggle Login / Signup */}
          <div className="mt-6 text-center text-xs text-brand-muted dark:text-brand-dark-muted">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-brand-blue font-semibold hover:underline"
                >
                  Log in
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-brand-blue font-semibold hover:underline"
                >
                  Sign up for free
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
