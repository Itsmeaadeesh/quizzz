import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  FileUp,
  X,
} from 'lucide-react';
import { QuizConfig, QuestionType, Difficulty } from '../types';
import { generateQuiz } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Mode: file upload or paste text
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [sourceTitle, setSourceTitle] = useState('Study Notes');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-voice error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quiz configuration
  const [config, setConfig] = useState<QuizConfig>({
    questionType: 'mcq',
    numQuestions: 10,
    difficulty: 'medium',
  });
  const [isCustomCount, setIsCustomCount] = useState(false);

  // Loading & stage state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<string>('Reading document content…');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Pre-fill sample if passed via route state
  useEffect(() => {
    if (location.state?.sampleText) {
      setActiveTab('paste');
      setPastedText(location.state.sampleText);
      setSourceTitle(location.state.sourceName || 'Sample Material');
    }
  }, [location.state]);

  // Loading stages simulation
  useEffect(() => {
    if (isGenerating) {
      setGenerationProgress(10);
      setGenerationStage('Reading and extracting core study material…');

      const s1 = setTimeout(() => {
        setGenerationProgress(35);
        setGenerationStage('Identifying core concepts, definitions, and key formulas…');
      }, 1500);

      const s2 = setTimeout(() => {
        setGenerationProgress(65);
        setGenerationStage('Formulating grounded questions with Gemini AI…');
      }, 3500);

      const s3 = setTimeout(() => {
        setGenerationProgress(88);
        setGenerationStage('Validating answers and formatting instant explanations…');
      }, 6500);

      return () => {
        clearTimeout(s1);
        clearTimeout(s2);
        clearTimeout(s3);
      };
    }
  }, [isGenerating]);

  // File validation (10MB limit)
  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSizeBytes) {
      setErrorMessage(
        'Whoa, that file is over 10MB! Please upload a file under 10MB or paste your notes directly.'
      );
      setSelectedFile(null);
      return;
    }

    const allowed = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt', '.md'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = allowed.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      setErrorMessage(
        `We couldn't recognize "${file.name}". StayAheadd supports PDF, PPTX, DOCX, or plain text notes!`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleGenerate = async () => {
    setErrorMessage(null);

    if (activeTab === 'upload' && !selectedFile) {
      setErrorMessage('Please choose a document to upload first, or switch to the paste notes tab.');
      return;
    }

    if (activeTab === 'paste' && pastedText.trim().split(/\s+/).length < 15) {
      setErrorMessage(
        'Your pasted notes are a bit brief! Please paste at least a paragraph (15+ words) so we can create meaningful questions.'
      );
      return;
    }

    setIsGenerating(true);

    try {
      const quiz = await generateQuiz({
        file: activeTab === 'upload' ? selectedFile || undefined : undefined,
        rawText: activeTab === 'paste' ? pastedText : undefined,
        sourceName: activeTab === 'upload' ? selectedFile?.name : sourceTitle,
        sourceType: activeTab === 'upload' ? selectedFile?.name.split('.').pop() || 'file' : 'text',
        config,
        userId: user?.id,
      });

      setGenerationProgress(100);
      setGenerationStage('Quiz ready! Opening session…');

      setTimeout(() => {
        navigate(`/quiz/${quiz.id}`, { state: { quiz } });
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while generating your quiz. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dots-pattern py-6 sm:py-10 md:py-16 transition-colors overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-blue-light dark:bg-brand-blue/15 text-brand-blue-dark dark:text-brand-blue text-xs font-semibold mb-3 border border-brand-blue/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            Study Material to Quiz
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-brand-ink dark:text-white tracking-tight">
            Upload notes and <span className="font-bold text-brand-blue">configure your quiz</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-brand-muted dark:text-brand-dark-muted mt-2 max-w-xl mx-auto">
            Choose your format preferences, select your document, and let StayAheadd build your study questions.
          </p>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed flex-1">
              <strong className="font-semibold">Notice: </strong>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-500 hover:text-amber-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Form Container */}
        <div className="space-y-6 sm:space-y-8">
          {/* Section 1: Material Input */}
          <div className="card-soft bg-white dark:bg-brand-dark-card border-brand-border dark:border-brand-dark-border p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border dark:border-brand-dark-border pb-4 mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-brand-ink dark:text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-brand-blue" />
                1. Provide study material
              </h2>

              <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all min-h-[40px] flex items-center ${
                    activeTab === 'upload'
                      ? 'bg-white dark:bg-brand-dark-card text-brand-ink dark:text-white shadow-xs font-semibold'
                      : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white'
                  }`}
                >
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('paste');
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all min-h-[40px] flex items-center ${
                    activeTab === 'paste'
                      ? 'bg-white dark:bg-brand-dark-card text-brand-ink dark:text-white shadow-xs font-semibold'
                      : 'text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white'
                  }`}
                >
                  Paste text
                </button>
              </div>
            </div>

            {/* TAB: FILE UPLOAD */}
            {activeTab === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-brand-blue bg-brand-blue-subtle/80 dark:bg-brand-blue/15 scale-[1.01]'
                        : 'border-brand-border dark:border-brand-dark-border hover:border-brand-blue/60 dark:hover:border-brand-blue/70 bg-slate-50/50 dark:bg-brand-dark-surface/50 hover:bg-brand-blue-subtle/30 dark:hover:bg-brand-dark-surface'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-brand-blue-light dark:bg-brand-blue/20 text-brand-blue flex items-center justify-center mx-auto mb-4">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-brand-ink dark:text-white mb-1">
                      Drag & drop your study file here, or{' '}
                      <span className="text-brand-blue underline underline-offset-2">browse</span>
                    </h3>
                    <p className="text-xs text-brand-muted dark:text-brand-dark-muted max-w-sm mx-auto mb-4">
                      Supports PDF, PPTX (PowerPoint), DOCX (Word), and TXT documents.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-brand-dark-card border border-brand-border dark:border-brand-dark-border text-[11px] text-brand-muted dark:text-slate-300">
                      Maximum file size: 10MB
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 rounded-2xl border border-brand-blue/30 bg-brand-blue-subtle/40 dark:bg-brand-blue/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-brand-ink dark:text-white truncate max-w-[200px] sm:max-w-md">
                          {selectedFile.name}
                        </div>
                        <div className="text-xs text-brand-muted dark:text-brand-dark-muted">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for quiz generation
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs font-medium text-red-500 hover:text-red-700 px-3.5 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[44px] flex items-center"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PASTE TEXT */}
            {activeTab === 'paste' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted mb-1.5">
                    Quiz title or subject name
                  </label>
                  <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="e.g. Cognitive Psychology Chapter 4"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-brand-ink dark:text-white text-base md:text-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue min-h-[44px]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-brand-muted dark:text-brand-dark-muted">
                      Paste lecture notes or study concepts
                    </label>
                    <span className="text-[11px] text-brand-muted dark:text-brand-dark-muted">
                      {pastedText.trim() ? `${pastedText.trim().split(/\s+/).length} words` : '0 words'}
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your paragraphs, definitions, lecture notes, or key concepts here..."
                    className="w-full p-4 rounded-xl border border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-surface text-brand-ink dark:text-white text-base md:text-sm leading-relaxed focus:border-brand-blue focus:ring-1 focus:ring-brand-blue placeholder:text-brand-muted/60 dark:placeholder:text-brand-dark-muted"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Quiz Configuration (Thumb-Reachable in Lower Half) */}
          <div className="card-soft bg-white dark:bg-brand-dark-card border-brand-border dark:border-brand-dark-border p-5 sm:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-brand-ink dark:text-white flex items-center gap-2 border-b border-brand-border dark:border-brand-dark-border pb-4 mb-5">
              <SlidersHorizontal className="w-5 h-5 text-brand-orange" />
              2. Quiz configuration
            </h2>

            <div className="space-y-6">
              {/* Question Format Chips (Thumb friendly wrapping grid) */}
              <div>
                <label className="block text-xs font-semibold text-brand-ink dark:text-slate-200 uppercase tracking-wider mb-2.5">
                  Question format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'mcq', label: 'Multiple choice', desc: '4 distinct options' },
                    { id: 'true_false', label: 'True / False', desc: 'Fast recall check' },
                    { id: 'short_answer', label: 'Short answer', desc: 'Explain in words' },
                    { id: 'mixed', label: 'Mixed formats', desc: 'Balanced variety' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setConfig({ ...config, questionType: item.id as QuestionType })}
                      className={`p-3.5 rounded-2xl border text-left transition-all min-h-[56px] flex flex-col justify-center active:scale-[0.98] ${
                        config.questionType === item.id
                          ? 'border-brand-blue bg-brand-blue-subtle dark:bg-brand-blue/20 ring-2 ring-brand-blue/30 shadow-xs'
                          : 'border-brand-border dark:border-brand-dark-border hover:border-brand-blue/40 dark:hover:border-brand-blue/50 bg-white dark:bg-brand-dark-surface'
                      }`}
                    >
                      <div className="text-xs font-semibold text-brand-ink dark:text-white flex items-center justify-between">
                        <span>{item.label}</span>
                        {config.questionType === item.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                        )}
                      </div>
                      <div className="text-[11px] text-brand-muted dark:text-brand-dark-muted mt-0.5 leading-tight">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions Chips */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold text-brand-ink dark:text-slate-200 uppercase tracking-wider">
                    Question count
                  </label>
                  <span className="text-xs font-bold text-brand-blue px-2.5 py-0.5 rounded-full bg-brand-blue/10">
                    {config.numQuestions} questions
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
                  {[10, 20, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setConfig({ ...config, numQuestions: num });
                        setIsCustomCount(false);
                      }}
                      className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center active:scale-95 ${
                        !isCustomCount && config.numQuestions === num
                          ? 'bg-brand-blue text-white shadow-pill'
                          : 'bg-slate-100 dark:bg-brand-dark-surface text-brand-muted dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-brand-dark-card border border-transparent dark:border-brand-dark-border'
                      }`}
                    >
                      {num} questions
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCustomCount(!isCustomCount)}
                    className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center active:scale-95 ${
                      isCustomCount
                        ? 'bg-brand-orange text-white shadow-md'
                        : 'bg-slate-100 dark:bg-brand-dark-surface text-brand-muted dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-brand-dark-card border border-transparent dark:border-brand-dark-border'
                    }`}
                  >
                    Custom count
                  </button>
                </div>

                {isCustomCount && (
                  <div className="mt-3.5 p-4 rounded-xl bg-slate-50 dark:bg-brand-dark-surface border border-brand-border dark:border-brand-dark-border">
                    <div className="flex items-center justify-between text-xs text-brand-muted dark:text-brand-dark-muted mb-2">
                      <span>5 (quick drill)</span>
                      <span className="font-bold text-brand-ink dark:text-white">{config.numQuestions} questions</span>
                      <span>40 (exam mode)</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={config.numQuestions}
                      onChange={(e) => setConfig({ ...config, numQuestions: Number(e.target.value) })}
                      className="w-full accent-brand-blue cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg min-h-[44px]"
                    />
                  </div>
                )}
              </div>

              {/* Difficulty Level Chips */}
              <div>
                <label className="block text-xs font-semibold text-brand-ink dark:text-slate-200 uppercase tracking-wider mb-2.5">
                  Target difficulty
                </label>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {[
                    { id: 'easy', label: 'Easy', desc: 'Definitions' },
                    { id: 'medium', label: 'Medium', desc: 'Comprehension' },
                    { id: 'hard', label: 'Hard', desc: 'Application' },
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setConfig({ ...config, difficulty: level.id as Difficulty })}
                      className={`p-3 rounded-2xl border text-center transition-all min-h-[52px] flex flex-col justify-center active:scale-[0.98] ${
                        config.difficulty === level.id
                          ? 'border-brand-blue bg-brand-blue-subtle dark:bg-brand-blue/20 ring-2 ring-brand-blue/30 shadow-xs'
                          : 'border-brand-border dark:border-brand-dark-border hover:border-brand-blue/40 dark:hover:border-brand-blue/50 bg-white dark:bg-brand-dark-surface'
                      }`}
                    >
                      <div className="text-xs font-semibold text-brand-ink dark:text-white">{level.label}</div>
                      <div className="text-[10px] text-brand-muted dark:text-brand-dark-muted mt-0.5">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Generate Action & Skeleton Loader State */}
          <div className="text-center pt-2 pb-16 md:pb-12">
            {!isGenerating ? (
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full sm:w-auto btn-pill-primary text-base px-10 py-4 shadow-xl hover:shadow-2xl active:scale-95 transition-all min-h-[52px]"
              >
                <Sparkles className="w-5 h-5 mr-2 text-white" />
                Generate quiz from notes
              </button>
            ) : (
              <div className="card-soft bg-white dark:bg-brand-dark-card max-w-lg mx-auto p-6 text-left border-brand-blue/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-ping" />
                    <span className="text-xs font-bold text-brand-blue">
                      Generating Quiz… {generationProgress}%
                    </span>
                  </div>
                  <span className="text-xs text-brand-muted dark:text-brand-dark-muted">Estimated: 5-8s</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-blue h-full transition-all duration-500 rounded-full"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>

                <div className="text-xs text-brand-muted dark:text-brand-dark-muted flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-orange animate-spin flex-shrink-0" />
                  <span className="truncate">{generationStage}</span>
                </div>

                {/* Skeleton Preview Mock Cards */}
                <div className="pt-3 border-t border-brand-border dark:border-brand-dark-border space-y-2.5">
                  <div className="h-4 skeleton-brand rounded-md w-3/4" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-9 skeleton-brand rounded-xl" />
                    <div className="h-9 skeleton-brand rounded-xl" />
                    <div className="h-9 skeleton-brand rounded-xl" />
                    <div className="h-9 skeleton-brand rounded-xl" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
