import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { GeneratedQuiz, QuizAttempt, UserAnswer } from '../types';

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const quiz: GeneratedQuiz | undefined = location.state?.quiz;
  const attempt: QuizAttempt | undefined = location.state?.attempt;
  const userAnswers: UserAnswer[] = location.state?.userAnswers || [];

  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  useEffect(() => {
    // Fire celebratory confetti if user scored >= 60%
    if (attempt && attempt.percentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C3F4', '#FAA722', '#10B981', '#1C8FBF'],
      });
    }
  }, [attempt]);

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen bg-dots-pattern flex items-center justify-center p-4">
        <div className="card-soft bg-white dark:bg-brand-dark-card dark:border-brand-dark-border text-center max-w-md p-8">
          <h2 className="text-xl font-semibold text-brand-ink dark:text-white mb-2">No quiz session found</h2>
          <p className="text-sm text-brand-muted dark:text-brand-dark-muted mb-6">
            Please generate a quiz or choose one from your study dashboard.
          </p>
          <Link to="/upload" className="btn-pill-primary">
            Upload study notes
          </Link>
        </div>
      </div>
    );
  }

  const filteredQuestions = quiz.questions.filter((q) => {
    const ans = userAnswers.find((a) => a.questionId === q.id);
    if (filter === 'correct') return ans?.isCorrect;
    if (filter === 'incorrect') return !ans?.isCorrect;
    return true;
  });

  const getBadge = (pct: number) => {
    if (pct >= 90) return { label: 'Concept mastery', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 70) return { label: 'Solid grasp', color: 'bg-brand-blue-light text-brand-blue-dark border-brand-blue/30' };
    if (pct >= 50) return { label: 'Keep reviewing', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Needs more study', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const badge = getBadge(attempt.percentage);

  return (
    <div className="min-h-screen bg-dots-pattern py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Score Summary Card */}
        <div className="card-soft bg-white dark:bg-brand-dark-card dark:border-brand-dark-border p-8 sm:p-12 text-center mb-10 shadow-xl border-brand-blue/20">
          <div className="w-20 h-20 rounded-full bg-brand-blue-light dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-brand-orange" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border mb-4 capitalize">
            <span className={`px-2.5 py-0.5 rounded-full border ${badge.color}`}>{badge.label}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold text-brand-ink dark:text-white mb-2">
            {attempt.score} / {attempt.totalQuestions}
          </h1>
          <p className="text-base text-brand-muted dark:text-brand-dark-muted mb-8">
            You scored <strong className="text-brand-ink dark:text-white font-semibold">{attempt.percentage}%</strong> on{' '}
            <span className="text-brand-blue font-medium">{quiz.title}</span>.
          </p>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border text-center">
              <div className="text-xs text-brand-muted dark:text-brand-dark-muted">Accuracy</div>
              <div className="text-lg font-bold text-brand-ink dark:text-white mt-0.5">{attempt.percentage}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border text-center">
              <div className="text-xs text-brand-muted dark:text-brand-dark-muted">Correct</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{attempt.score}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border text-center">
              <div className="text-xs text-brand-muted dark:text-brand-dark-muted">Time taken</div>
              <div className="text-lg font-bold text-brand-ink dark:text-white mt-0.5">
                {Math.floor(attempt.timeTakenSeconds / 60)}m {attempt.timeTakenSeconds % 60}s
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/quiz/${quiz.id}`, { state: { quiz } })}
              className="btn-pill-primary text-sm px-6 py-3"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake quiz
            </button>
            <Link to="/upload" className="btn-pill-outline text-sm px-6 py-3">
              <Sparkles className="w-4 h-4 mr-2 text-brand-orange" />
              Generate new quiz
            </Link>
            <Link to="/dashboard" className="btn-pill-ghost text-sm px-6 py-3 border border-brand-border dark:border-brand-dark-border">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              View study dashboard
            </Link>
          </div>
        </div>

        {/* Detailed Question Review Breakdown */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border dark:border-brand-dark-border">
            <div>
              <h2 className="text-xl font-semibold text-brand-ink dark:text-white">Question breakdown & explanations</h2>
              <p className="text-xs text-brand-muted dark:text-brand-dark-muted mt-0.5">
                Review your answers, verify key concepts, and inspect why specific options were correct.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border">
              {[
                { id: 'all', label: `All (${quiz.questions.length})` },
                { id: 'incorrect', label: `Incorrect (${attempt.totalQuestions - attempt.score})` },
                { id: 'correct', label: `Correct (${attempt.score})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === tab.id
                      ? 'bg-white dark:bg-brand-dark-card text-brand-ink dark:text-white shadow-xs font-semibold'
                      : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of reviewed questions */}
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const ans = userAnswers.find((a) => a.questionId === q.id);
              const isCorrect = ans?.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`card-soft bg-white dark:bg-brand-dark-card p-6 transition-all ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : 'border-rose-200 dark:border-rose-900/60 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-brand-muted dark:text-brand-dark-muted">Q{q.id}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Incorrect
                          </>
                        )}
                      </span>
                    </div>

                    <span className="text-[11px] text-brand-muted dark:text-brand-dark-muted capitalize">{q.difficulty}</span>
                  </div>

                  <h3 className="text-base font-medium text-brand-ink dark:text-white mb-4">{q.question}</h3>

                  {/* MCQ Options Display */}
                  {q.options && (
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, i) => {
                        const isChosen = ans?.userAnswer === opt;
                        const isActualCorrect =
                          opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

                        let optClass =
                          'border-brand-border bg-slate-50 dark:bg-brand-dark-surface dark:border-brand-dark-border text-brand-muted dark:text-slate-300';
                        if (isActualCorrect) {
                          optClass =
                            'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-500 text-emerald-950 dark:text-emerald-200 font-medium';
                        } else if (isChosen && !isActualCorrect) {
                          optClass =
                            'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 dark:border-rose-500 text-rose-950 dark:text-rose-200 font-medium';
                        }

                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${optClass}`}
                          >
                            <span>{opt}</span>
                            {isActualCorrect && (
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Correct choice</span>
                            )}
                            {isChosen && !isActualCorrect && (
                              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Your choice</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short answer review */}
                  {q.type === 'short_answer' && (
                    <div className="space-y-2 mb-4 text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border dark:text-slate-200">
                        <strong className="text-brand-muted dark:text-brand-dark-muted">Your answer: </strong>
                        <span>{ans?.userAnswer || 'No response recorded'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-brand-blue-light/40 dark:bg-brand-blue/10 border border-brand-blue/30 dark:text-slate-200">
                        <strong className="text-brand-blue-dark dark:text-brand-blue">Correct key concept: </strong>
                        <span>{q.correct_answer}</span>
                      </div>
                    </div>
                  )}

                  {/* Explanation card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border text-xs sm:text-sm text-brand-ink dark:text-slate-200 leading-relaxed">
                    <strong className="font-semibold text-brand-ink dark:text-white block mb-1">Concept explanation:</strong>
                    {q.explanation}
                    {q.key_takeaway && (
                      <div className="mt-2 text-xs text-brand-blue-dark dark:text-brand-blue font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                        <span>Takeaway: {q.key_takeaway}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
