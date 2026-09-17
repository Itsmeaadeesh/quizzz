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
} from 'lucide-react';
import { GeneratedQuiz, QuizAttempt } from '../types';
import { fetchHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="min-h-screen bg-dots-pattern py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue-light text-brand-blue-dark text-xs font-semibold mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Student Study Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-brand-ink">
              Welcome back, <span className="font-bold text-brand-blue">{user?.name || 'Scholar'}</span>
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Track your quiz history, retake past materials, and monitor your concept retention.
            </p>
          </div>

          <Link to="/upload" className="btn-pill-primary text-sm px-6 py-3 self-start sm:self-auto">
            <Sparkles className="w-4 h-4 mr-2 text-white" />
            Create new quiz
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="card-soft bg-white p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink">{totalQuizzes}</div>
            <div className="text-xs text-brand-muted mt-1">Study materials uploaded</div>
          </div>

          <div className="card-soft bg-white p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-light text-brand-orange flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink">{totalAttempts}</div>
            <div className="text-xs text-brand-muted mt-1">Total quiz sessions completed</div>
          </div>

          <div className="card-soft bg-white p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink">{avgScore}%</div>
            <div className="text-xs text-brand-muted mt-1">Average retention accuracy</div>
          </div>

          <div className="card-soft bg-white p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-brand-ink">{totalQuestionsMastered}</div>
            <div className="text-xs text-brand-muted mt-1">Concepts correctly mastered</div>
          </div>
        </div>

        {/* Quizzes and Attempts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h2 className="text-lg font-semibold text-brand-ink flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-blue" />
              Your saved study quizzes ({quizzes.length})
            </h2>
            <Link to="/upload" className="text-xs text-brand-blue font-semibold hover:underline">
              + Upload notes
            </Link>
          </div>

          {loading ? (
            <div className="card-soft text-center p-12 bg-white">
              <Sparkles className="w-6 h-6 text-brand-blue animate-spin mx-auto mb-3" />
              <div className="text-sm text-brand-muted">Loading your study quizzes…</div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="card-soft bg-white p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-brand-ink mb-1">No quizzes generated yet</h3>
              <p className="text-sm text-brand-muted max-w-sm mx-auto mb-6">
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
                  <div key={q.id} className="card-soft bg-white flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-slate-100 text-brand-muted">
                          {q.sourceType}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full capitalize font-medium bg-brand-blue-light text-brand-blue-dark">
                          {q.config?.difficulty || 'medium'}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-brand-ink group-hover:text-brand-blue transition-colors line-clamp-1 mb-1">
                        {q.title}
                      </h3>

                      <p className="text-xs text-brand-muted line-clamp-2 mb-4">{q.summary}</p>

                      <div className="space-y-1.5 text-xs text-brand-muted border-t border-brand-border pt-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span>Questions</span>
                          <span className="font-semibold text-brand-ink">{q.questions?.length || 10}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Format</span>
                          <span className="capitalize font-medium text-brand-ink">
                            {q.config?.questionType || 'MCQ'}
                          </span>
                        </div>
                        {latestAttempt && (
                          <div className="flex items-center justify-between">
                            <span>Latest score</span>
                            <span className="font-bold text-emerald-600">
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
