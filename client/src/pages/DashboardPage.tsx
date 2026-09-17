import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  FileText,
  Moon,
  Sun,
} from 'lucide-react';
import { GeneratedQuiz, QuizAttempt } from '../types';
import { fetchHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [quizzes, setQuizzes] = useState<GeneratedQuiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchHistory(user?.id);
      setQuizzes(data.quizzes);
      setAttempts(data.attempts);
      setLoading(false);
    };
    load();
  }, [user]);

  // Aggregate stats
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0;
  const totalQuestionsMastered = attempts.reduce((acc, a) => acc + a.score, 0);

  return (
    <div className="min-h-screen bg-dots-pattern py-10 md:py-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue-light dark:bg-brand-blue/15 text-brand-blue-dark dark:text-brand-blue text-xs font-semibold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Student Study Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-brand-ink dark:text-white">
              Welcome back, <span className="font-bold text-brand-blue">{user?.name || 'Scholar'}</span>
            </h1>
            <p className="text-sm text-brand-muted dark:text-brand-dark-muted mt-1">
              Track your quiz history, retake past materials, and monitor your concept retention.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Dashboard Dedicated Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-card text-xs font-medium text-brand-ink dark:text-slate-200 shadow-xs hover:border-brand-blue transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-brand-blue" />
                  <span>Dark mode</span>
                </>
              )}
            </button>

            <Link to="/upload" className="btn-pill-primary text-sm px-6 py-3">
              <Sparkles className="w-4 h-4 mr-2 text-white" />
              Create new quiz
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="card-soft p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue-light dark:bg-brand-blue/15 text-brand-blue flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink dark:text-white">{totalQuizzes}</div>
            <div className="text-xs text-brand-muted dark:text-brand-dark-muted mt-1">Study materials uploaded</div>
          </div>

          <div className="card-soft p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-light dark:bg-brand-orange/15 text-brand-orange flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink dark:text-white">{totalAttempts}</div>
            <div className="text-xs text-brand-muted dark:text-brand-dark-muted mt-1">Total quiz sessions completed</div>
          </div>

          <div className="card-soft p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink dark:text-white">{avgScore}%</div>
            <div className="text-xs text-brand-muted dark:text-brand-dark-muted mt-1">Average retention accuracy</div>
          </div>

          <div className="card-soft p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink dark:text-white">{totalQuestionsMastered}</div>
            <div className="text-xs text-brand-muted dark:text-brand-dark-muted mt-1">Concepts correctly mastered</div>
          </div>
        </div>

        {/* Quizzes and Attempts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-3">
            <h2 className="text-lg font-semibold text-brand-ink dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-blue" />
              Your saved study quizzes ({quizzes.length})
            </h2>
            <Link to="/upload" className="text-xs text-brand-blue font-semibold hover:underline">
              + Upload notes
            </Link>
          </div>

          {loading ? (
            <div className="card-soft text-center p-12">
              <Sparkles className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-3" />
              <div className="text-sm text-brand-muted dark:text-brand-dark-muted">Loading your study quizzes…</div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="card-soft p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue-light dark:bg-brand-blue/15 text-brand-blue flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-brand-ink dark:text-white mb-1">No quizzes generated yet</h3>
              <p className="text-sm text-brand-muted dark:text-brand-dark-muted max-w-sm mx-auto mb-6">
                Upload your first lecture slides or notes to get an instant tailored quiz.
              </p>
              <Link to="/upload" className="btn-pill-primary text-sm px-6 py-2.5">
                Generate your first quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((q) => {
                const latestAttempt = attempts.find((a) => a.quizId === q.id);

                return (
                  <div key={q.id} className="card-soft flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-slate-100 dark:bg-brand-dark-surface text-brand-muted dark:text-brand-dark-muted">
                          {q.sourceType}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-brand-blue-light dark:bg-brand-blue/20 text-brand-blue-dark dark:text-brand-blue">
                          {q.config?.difficulty || 'medium'}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-brand-ink dark:text-white group-hover:text-brand-blue transition-colors line-clamp-1 mb-1">
                        {q.title}
                      </h3>

                      <p className="text-xs text-brand-muted dark:text-brand-dark-muted line-clamp-2 mb-4">{q.summary}</p>

                      <div className="space-y-1.5 text-xs text-brand-muted dark:text-brand-dark-muted border-t border-brand-border dark:border-brand-dark-border pt-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span>Questions</span>
                          <span className="font-semibold text-brand-ink dark:text-slate-200">{q.questions?.length || 10}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Format</span>
                          <span className="capitalize font-medium text-brand-ink dark:text-slate-200">
                            {q.config?.questionType || 'MCQ'}
                          </span>
                        </div>
                        {latestAttempt && (
                          <div className="flex items-center justify-between">
                            <span>Latest score</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {latestAttempt.percentage}% ({latestAttempt.score}/{latestAttempt.totalQuestions})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => navigate(`/quiz/${q.id}`, { state: { quiz: q } })}
                        className="btn-pill-primary text-xs w-full py-2.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Take quiz
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
