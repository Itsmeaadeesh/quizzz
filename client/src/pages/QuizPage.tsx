import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { GeneratedQuiz, QuizQuestion, UserAnswer } from '../types';
import { getLocalQuizzes, recordQuizAttempt } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [startTime] = useState(Date.now());

  // Load quiz from state or storage
  useEffect(() => {
    if (location.state?.quiz) {
      setQuiz(location.state.quiz);
    } else if (id) {
      const stored = getLocalQuizzes().find((q) => q.id === id);
      if (stored) {
        setQuiz(stored);
      } else {
        navigate('/upload');
      }
    }
  }, [id, location.state, navigate]);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dots-pattern">
        <div className="card-soft text-center p-8 max-w-md bg-white dark:bg-brand-dark-card border border-brand-border dark:border-brand-dark-border">
          <div className="w-12 h-12 rounded-full bg-brand-blue-light dark:bg-brand-blue/15 text-brand-blue mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-brand-ink dark:text-white mb-2">Preparing your study session…</h2>
          <p className="text-sm text-brand-muted dark:text-brand-dark-muted">Loading your quiz questions and study materials.</p>
        </div>
      </div>
    );
  }

  const currentQ: QuizQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  // Handle option select for MCQ & True/False
  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
    setIsSubmitted(true);

    const isCorrect = option.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        userAnswer: option,
        isCorrect,
      },
    ]);
  };

  // Handle submit for Short Answer
  const handleShortAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortAnswerInput.trim() || isSubmitted) return;

    setSelectedOption(shortAnswerInput.trim());
    setIsSubmitted(true);

    const cleanUser = shortAnswerInput.toLowerCase();
    const cleanCorrect = currentQ.correct_answer.toLowerCase();
    const correctKeywords = cleanCorrect.split(/\s+/).filter((w) => w.length > 3);
    const matches = correctKeywords.filter((w) => cleanUser.includes(w));
    const isCorrect = matches.length >= Math.max(1, Math.floor(correctKeywords.length * 0.3));

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        userAnswer: shortAnswerInput.trim(),
        isCorrect,
      },
    ]);
  };

  // Move to next question or complete
  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShortAnswerInput('');
      setIsSubmitted(false);
    } else {
      const score = userAnswers.filter((a) => a.isCorrect).length;
      const percentage = Math.round((score / totalQuestions) * 100);
      const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

      const attempt = {
        quizId: quiz.id,
        userId: user?.id,
        score,
        totalQuestions,
        percentage,
        userAnswers,
        timeTakenSeconds,
        completedAt: new Date().toISOString(),
      };

      await recordQuizAttempt(attempt);

      navigate('/results', {
        state: {
          quiz,
          attempt,
          userAnswers,
        },
      });
    }
  };

  const isCurrentCorrect =
    selectedOption &&
    (selectedOption.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase() ||
      userAnswers.find((a) => a.questionId === currentQ.id)?.isCorrect);

  return (
    <div className="min-h-screen bg-dots-pattern py-8 md:py-14 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted dark:text-brand-dark-muted">
              <span className="max-w-[200px] sm:max-w-xs truncate text-brand-ink dark:text-slate-200">{quiz.title}</span>
              <span>•</span>
              <span className="capitalize">{currentQ.difficulty} difficulty</span>
            </div>
            <div className="text-sm font-semibold text-brand-ink dark:text-white mt-0.5">
              Question {currentIndex + 1} of {totalQuestions}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-brand-ink dark:text-slate-200 bg-white dark:bg-brand-dark-surface px-3 py-1 rounded-full border border-brand-border dark:border-brand-dark-border shadow-xs">
              Score: <strong className="text-brand-blue">{userAnswers.filter((a) => a.isCorrect).length}</strong> / {userAnswers.length}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
          <div
            className="bg-brand-blue h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Active Question Card */}
        <div className="card-soft bg-white dark:bg-brand-dark-card p-6 sm:p-10 shadow-lg border-brand-border dark:border-brand-dark-border relative">
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-brand-dark-surface text-brand-muted dark:text-slate-300 text-xs font-medium border border-transparent dark:border-brand-dark-border">
            <HelpCircle className="w-3.5 h-3.5 text-brand-blue" />
            <span className="capitalize">
              {currentQ.type === 'mcq'
                ? 'Multiple choice'
                : currentQ.type === 'true_false'
                ? 'True / False'
                : 'Short answer'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-normal text-brand-ink dark:text-white leading-relaxed mb-8">
            {currentQ.question}
          </h2>

          {/* OPTIONS: MCQ & TRUE/FALSE */}
          {(currentQ.type === 'mcq' || currentQ.type === 'true_false') && currentQ.options && (
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrectOption =
                  option.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

                let buttonStyles =
                  'border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-brand-ink dark:text-slate-100 hover:border-brand-blue/50 dark:hover:border-brand-blue/70 hover:bg-brand-blue-subtle/30 dark:hover:bg-brand-dark-card shadow-xs';

                if (isSubmitted) {
                  if (isCorrectOption) {
                    buttonStyles =
                      'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrectOption) {
                    buttonStyles =
                      'border-rose-400 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-medium ring-2 ring-rose-400/30';
                  } else {
                    buttonStyles = 'border-brand-border dark:border-brand-dark-border/40 bg-slate-50 dark:bg-brand-dark-surface/40 text-brand-muted dark:text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group text-sm sm:text-base ${buttonStyles}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                          isSubmitted && isCorrectOption
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : isSubmitted && isSelected && !isCorrectOption
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'border-brand-border dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-card text-brand-muted dark:text-slate-300 group-hover:border-brand-blue group-hover:text-brand-blue'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {isSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* SHORT ANSWER */}
          {currentQ.type === 'short_answer' && (
            <form onSubmit={handleShortAnswerSubmit} className="space-y-4 mb-6">
              {!isSubmitted ? (
                <div>
                  <textarea
                    rows={3}
                    value={shortAnswerInput}
                    onChange={(e) => setShortAnswerInput(e.target.value)}
                    placeholder="Type your explanation or response here..."
                    className="w-full p-4 rounded-2xl border border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-brand-ink dark:text-white text-sm sm:text-base focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  />
                  <button
                    type="submit"
                    disabled={!shortAnswerInput.trim()}
                    className="mt-3 btn-pill-primary text-xs sm:text-sm px-6 py-2.5"
                  >
                    Submit response
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-brand-border dark:border-brand-dark-border bg-slate-50 dark:bg-brand-dark-surface">
                    <div className="text-xs font-semibold text-brand-muted dark:text-brand-dark-muted mb-1">Your answer:</div>
                    <div className="text-sm text-brand-ink dark:text-white">{shortAnswerInput}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-brand-blue/30 bg-brand-blue-light/40 dark:bg-brand-blue/15">
                    <div className="text-xs font-semibold text-brand-blue-dark dark:text-brand-blue mb-1">Model answer:</div>
                    <div className="text-sm text-brand-ink dark:text-white">{currentQ.correct_answer}</div>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Explanation Card */}
          {isSubmitted && (
            <div
              className={`p-5 rounded-2xl border transition-all mt-6 ${
                isCurrentCorrect
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Great job! Correct.</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>Explanation & Key Concept:</span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm leading-relaxed mb-3">{currentQ.explanation}</p>

              {currentQ.key_takeaway && (
                <div className="pt-2.5 border-t border-black/5 dark:border-white/10 text-xs flex items-center gap-1.5 opacity-90">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                  <span className="font-medium">Takeaway: {currentQ.key_takeaway}</span>
                </div>
              )}
            </div>
          )}

          {/* Next Button Footer */}
          {isSubmitted && (
            <div className="mt-8 pt-6 border-t border-brand-border dark:border-brand-dark-border flex items-center justify-between">
              <span className="text-xs text-brand-muted dark:text-brand-dark-muted">
                {currentIndex === totalQuestions - 1
                  ? 'Last question complete!'
                  : `${totalQuestions - (currentIndex + 1)} questions remaining`}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="btn-pill-primary text-sm px-7 py-3 inline-flex items-center gap-2 shadow-lg"
              >
                <span>{currentIndex === totalQuestions - 1 ? 'View final results' : 'Next question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
