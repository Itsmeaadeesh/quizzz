import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-brand-border dark:border-brand-dark-border bg-white dark:bg-brand-dark-bg mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-brand-muted dark:text-brand-dark-muted max-w-sm leading-relaxed">
              StayAheadd helps students and lifelong learners transform dense study materials, lecture slides, and notes into interactive, concept-grounded quizzes in seconds.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue-subtle dark:bg-brand-blue/10 border border-brand-blue/20 text-xs text-brand-blue-dark dark:text-brand-blue">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              Powered by Gemini 3.6 Flash AI
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-brand-ink dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-muted dark:text-brand-dark-muted">
              <li>
                <Link to="/upload" className="hover:text-brand-blue transition-colors">
                  Upload study material
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-blue transition-colors">
                  Quiz history & analytics
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-brand-blue transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-brand-blue transition-colors">
                  Features & formats
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Formats */}
          <div>
            <h4 className="text-xs font-semibold text-brand-ink dark:text-white uppercase tracking-wider mb-4">
              Supported material
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-muted dark:text-brand-dark-muted">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>PDF documents & ebooks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>PowerPoint presentations (.pptx)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Microsoft Word notes (.docx)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Pasted lecture notes & text</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-brand-border dark:border-brand-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted dark:text-brand-dark-muted">
          <p>© {new Date().getFullYear()} StayAheadd. Designed for focused learning.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1">
              Built for students with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
            <a href="#privacy" className="hover:text-brand-ink dark:hover:text-white transition-colors">
              Privacy policy
            </a>
            <a href="#terms" className="hover:text-brand-ink dark:hover:text-white transition-colors">
              Terms of service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
