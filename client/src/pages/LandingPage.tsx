import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Clock,
  Brain,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFormatPreview, setActiveFormatPreview] = useState<'mcq' | 'true_false' | 'short_answer'>('mcq');

  const sampleMaterials = [
    {
      name: 'Cell_Biology_Organelles.pdf',
      type: 'PDF',
      size: '2.4 MB',
      status: 'Ready',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      questions: 15,
      sampleText:
        'The mitochondrion is often described as the powerhouse of eukaryotic cells. It generates adenosine triphosphate (ATP) through oxidative phosphorylation. The inner mitochondrial membrane contains the electron transport chain complexes (Complex I-IV) and ATP synthase. Mitochondria also have their own circular double-stranded DNA genome (mtDNA) and replicate independently via binary fission.',
    },
    {
      name: 'Machine_Learning_Lecture4.pptx',
      type: 'PPTX',
      size: '5.1 MB',
      status: 'Generating quiz…',
      statusColor: 'bg-brand-blue-light text-brand-blue-dark border-brand-blue/30 animate-pulse',
      questions: 20,
      sampleText:
        'Supervised learning requires labeled training data pairs (x, y). In contrast, unsupervised learning discovers hidden patterns in unlabeled input data. Common unsupervised learning algorithms include K-Means clustering, Principal Component Analysis (PCA) for dimensionality reduction, and autoencoders.',
    },
    {
      name: 'Macroeconomics_Inflation_Ch3.docx',
      type: 'DOCX',
      size: '1.2 MB',
      status: 'Generated 10 questions',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      questions: 10,
      sampleText:
        'Inflation is the general rise in the price level of goods and services in an economy over time. Demand-pull inflation occurs when aggregate demand for goods and services exceeds aggregate supply. Cost-push inflation is caused by substantial increases in the cost of important goods or services where no suitable alternative is available.',
    },
  ];

  const handleTrySample = (sample: typeof sampleMaterials[0]) => {
    navigate('/upload', {
      state: {
        sampleText: sample.sampleText,
        sourceName: sample.name,
        sourceType: sample.type.toLowerCase(),
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with subtle dotted background */}
      <section className="relative overflow-hidden bg-dots-pattern pt-12 pb-20 md:pt-20 md:pb-32 border-b border-brand-border">
        {/* Subtle radial ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-blue/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-border shadow-xs text-xs sm:text-sm font-medium text-brand-ink mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-ping" />
              <span>Instant AI Quiz Generator</span>
              <span className="text-brand-muted">•</span>
              <span className="text-brand-blue font-semibold">100% focused on your material</span>
            </div>

            {/* Headline: regular weight with one bold line for emphasis */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-brand-ink tracking-tight leading-[1.15] mb-6">
              Turn your study notes into <br />
              <span className="font-bold text-brand-blue">instant quizzes with AI.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed mb-8">
              Upload your lecture slides, PDFs, or notes. StayAheadd extracts the core concepts and builds active-recall quizzes with instant explanations in seconds.
            </p>

            {/* Pill CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/upload" className="btn-pill-primary w-full sm:w-auto text-base px-8 py-3.5 shadow-lg">
                <UploadCloud className="w-5 h-5 mr-2 text-white" />
                Upload notes — it's free
              </Link>
              <button
                onClick={() => handleTrySample(sampleMaterials[0])}
                className="btn-pill-outline w-full sm:w-auto text-base px-7 py-3.5"
              >
                <Sparkles className="w-4 h-4 mr-2 text-brand-orange" />
                Try sample quiz
              </button>
            </div>

            <p className="text-xs text-brand-muted mt-4">
              No credit card required • Supports PDF, PPTX, DOCX, and pasted text
            </p>
          </div>

          {/* Mock "Upload Preview" Card with Sample Files & Status Badges */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="card-soft border-brand-blue/20 bg-white/95 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-brand-muted ml-2">StayAheadd Study Session</span>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-ink mt-1">
                    Uploaded material queue
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-muted bg-slate-50 px-3 py-1.5 rounded-full border border-brand-border">
                  <Clock className="w-3.5 h-3.5 text-brand-blue" />
                  Average generation time: 6 seconds
                </div>
              </div>

              {/* Sample files list */}
              <div className="divide-y divide-brand-border mt-4">
                {sampleMaterials.map((file, idx) => (
                  <div
                    key={idx}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue-light/60 flex items-center justify-center text-brand-blue-dark">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-brand-ink group-hover:text-brand-blue transition-colors">
                          {file.name}
                        </div>
                        <div className="text-xs text-brand-muted">
                          {file.type} file • {file.size} • {file.questions} target questions
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-medium inline-flex items-center gap-1.5 ${file.statusColor}`}
                      >
                        {file.status === 'Generating quiz…' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-ping" />
                        )}
                        {file.status === 'Ready' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {file.status}
                      </span>
                      <button
                        onClick={() => handleTrySample(file)}
                        className="btn-pill-primary text-xs py-1.5 px-3.5"
                      >
                        Test quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer Banner */}
              <div className="mt-6 pt-5 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted bg-brand-blue-subtle/50 -mx-6 -mb-6 p-4 sm:px-8 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-blue" />
                  <span>Strict schema validation ensures zero broken questions or missing options</span>
                </div>
                <Link to="/upload" className="text-brand-blue font-semibold hover:underline inline-flex items-center gap-1">
                  Upload your own file <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Section) */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
              Step-by-step
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-brand-ink mt-2">
              From study notes to <span className="font-bold text-brand-ink">mastery in four steps</span>
            </h2>
            <p className="text-base text-brand-muted mt-3">
              No complicated prompts or manual flashcard creation. Just upload and quiz yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="card-soft relative group">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue-light text-brand-blue-dark flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-lg font-semibold text-brand-ink mb-2">Upload material</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Drop your PDF lectures, PowerPoint presentations, Word documents, or paste notes directly into the text box.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-soft relative group">
              <div className="w-12 h-12 rounded-2xl bg-brand-orange-light text-brand-orange flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-lg font-semibold text-brand-ink mb-2">Configure parameters</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Choose question styles (MCQ, True/False, Short Answer, or Mixed), choose quantity (10, 20, 30), and select difficulty.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-soft relative group">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue-light text-brand-blue-dark flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-lg font-semibold text-brand-ink mb-2">AI extracts concepts</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Gemini 2.0 Flash synthesizes key principles, dates, and definitions to generate rigorous, grounded questions.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-soft relative group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="text-lg font-semibold text-brand-ink mb-2">Test with explanations</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                Answer one question at a time with instant color-coded feedback and detailed explanations for any mistakes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (3 Columns) */}
      <section id="features" className="py-20 md:py-28 bg-brand-bg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">
              Engineered for learning
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-brand-ink mt-2">
              Everything you need to <span className="font-bold text-brand-ink">study smarter</span>
            </h2>
            <p className="text-base text-brand-muted mt-3">
              Built specifically to support active recall and spaced self-testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-soft bg-white p-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue-light text-brand-blue flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-brand-ink mb-3">Deep conceptual extraction</h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-4">
                Rather than generic surface trivia, our extractor identifies the central thesis, equations, definitions, and relationships inside your documents.
              </p>
              <ul className="text-xs text-brand-muted space-y-2 border-t border-brand-border pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                  Extracts from slide decks and tables
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                  Preserves complex scientific definitions
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card-soft bg-white p-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-orange-light text-brand-orange flex items-center justify-center mb-6">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-brand-ink mb-3">Customizable chip settings</h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-4">
                Adapt your study session in one tap. Switch between rapid True/False checks, comprehensive 4-option MCQs, or deeper short-answer recalls.
              </p>
              <ul className="text-xs text-brand-muted space-y-2 border-t border-brand-border pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                  Easy, medium, and hard difficulty tuning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                  Custom question count slider (5 to 40)
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card-soft bg-white p-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-brand-ink mb-3">Instant feedback & insights</h3>
              <p className="text-sm text-brand-muted leading-relaxed mb-4">
                Never wonder why an answer was wrong. Every question features an instant explanation highlighting common misconceptions and key takeaways.
              </p>
              <ul className="text-xs text-brand-muted space-y-2 border-t border-brand-border pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  One-question-at-a-time focus mode
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Detailed performance dashboard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Format & Config Preview Playground Section */}
      <section className="py-20 md:py-28 bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-brand-blue uppercase tracking-wider">
                Interactive preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-brand-ink mt-2">
                Tailored question formats for <span className="font-bold text-brand-ink">every study style</span>
              </h2>
              <p className="text-base text-brand-muted mt-4 leading-relaxed">
                Test your knowledge through diverse assessment styles. Switch between format chips below to preview how StayAheadd presents each question type.
              </p>

              {/* Format selection chips */}
              <div className="flex flex-wrap gap-2.5 mt-6">
                {[
                  { id: 'mcq', label: 'Multiple choice' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'short_answer', label: 'Short answer' },
                ].map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setActiveFormatPreview(format.id as any)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      activeFormatPreview === format.id
                        ? 'bg-brand-blue text-white shadow-pill'
                        : 'bg-slate-100 text-brand-muted hover:bg-slate-200'
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/upload" className="btn-pill-primary inline-flex items-center gap-2">
                  Configure your quiz <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="card-soft border-brand-blue/30 bg-slate-50/50 p-6 sm:p-8">
              <div className="flex items-center justify-between text-xs text-brand-muted mb-4 pb-3 border-b border-brand-border">
                <span className="font-medium text-brand-blue">Question 1 of 1</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-brand-border font-medium text-brand-ink">
                  Medium difficulty
                </span>
              </div>

              {activeFormatPreview === 'mcq' && (
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-medium text-brand-ink">
                    Which organelle contains its own circular DNA and generates ATP via oxidative phosphorylation?
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { text: 'Mitochondria', correct: true },
                      { text: 'Golgi apparatus', correct: false },
                      { text: 'Endoplasmic reticulum', correct: false },
                      { text: 'Lysosome', correct: false },
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border text-sm transition-colors flex items-center justify-between ${
                          opt.correct
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                            : 'border-brand-border bg-white text-brand-muted'
                        }`}
                      >
                        <span>{opt.text}</span>
                        {opt.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
                    <strong>Explanation:</strong> Mitochondria replicate independently and generate cellular energy via ATP synthase on their inner cristae.
                  </div>
                </div>
              )}

              {activeFormatPreview === 'true_false' && (
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-medium text-brand-ink">
                    Unsupervised machine learning models require labeled training pairs (x, y) to make predictions.
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-brand-border bg-white text-center text-sm font-medium text-brand-muted">
                      True
                    </div>
                    <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-50 text-center text-sm font-medium text-emerald-950 flex items-center justify-center gap-2">
                      <span>False</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800">
                    <strong>Explanation:</strong> Supervised learning uses labeled pairs (x, y). Unsupervised learning identifies patterns in unlabeled data.
                  </div>
                </div>
              )}

              {activeFormatPreview === 'short_answer' && (
                <div className="space-y-4">
                  <h4 className="text-base sm:text-lg font-medium text-brand-ink">
                    What type of inflation is triggered when aggregate consumer demand outpaces the economy's total supply?
                  </h4>
                  <div className="p-3.5 rounded-xl border border-brand-border bg-white text-sm text-brand-ink">
                    Demand-pull inflation
                  </div>
                  <div className="p-3.5 rounded-xl bg-brand-blue-light/50 border border-brand-blue/30 text-xs text-brand-blue-dark">
                    <strong>Model answer:</strong> Demand-pull inflation occurs when aggregate demand for goods exceeds the aggregate productive capacity.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band with subtle blue gradient */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-brand-blue-dark via-brand-blue to-cyan-400 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Ready to test what you know?
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto mb-8">
            Upload your first document right now. It takes less than 10 seconds to generate your customized quiz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="btn-pill bg-white text-brand-blue-dark font-semibold px-8 py-3.5 shadow-xl hover:bg-slate-50 active:scale-95"
            >
              Start studying for free
            </Link>
            <Link
              to="/auth"
              className="btn-pill border border-white/40 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 hover:bg-white/20"
            >
              Sign up / Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
