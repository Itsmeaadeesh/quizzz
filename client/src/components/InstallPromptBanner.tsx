import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPromptBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      return; // Already installed and running as PWA
    }

    // Check if user recently dismissed
    const dismissedAt = localStorage.getItem('stayaheadd_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 5) {
        return; // Suppress for 5 days after dismissal
      }
    }

    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handler for Chrome/Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // On iOS Safari, display the banner after a gentle 3-second delay
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOSDevice && !isStandalone) {
      iosTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('stayaheadd_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Subtle floating bottom banner (sits comfortably above mobile bottom nav with safe-area spacing) */}
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white dark:bg-brand-dark-card border border-brand-blue/30 dark:border-brand-blue/40 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-xl">
          <div className="w-11 h-11 rounded-xl bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center flex-shrink-0 text-brand-blue">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-brand-ink dark:text-white leading-snug">
              Install StayAheadd
            </div>
            <p className="text-xs text-brand-muted dark:text-brand-dark-muted truncate">
              Instant access, zero lag & offline study
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-brand-muted dark:text-brand-dark-muted hover:text-brand-ink dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-brand-dark-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari 'Add to Home Screen' Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-dark-card border border-brand-border dark:border-brand-dark-border w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border dark:border-brand-dark-border mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <h3 className="font-semibold text-brand-ink dark:text-white text-base">
                  Install StayAheadd on iOS
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-2 text-brand-muted hover:text-brand-ink dark:text-brand-dark-muted dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-brand-dark-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-brand-muted dark:text-brand-dark-muted mb-4 leading-relaxed">
              To install this Progressive Web App with full screen native experience on iPhone or iPad:
            </p>

            <ol className="space-y-3.5 text-xs text-brand-ink dark:text-slate-200 mb-6">
              <li className="flex items-start gap-3 bg-slate-50 dark:bg-brand-dark-surface p-3 rounded-xl border border-brand-border dark:border-brand-dark-border">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  Tap the <strong className="inline-flex items-center gap-1 font-semibold text-brand-blue"><Share className="w-3.5 h-3.5 inline" /> Share</strong> button in Safari's bottom toolbar.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 dark:bg-brand-dark-surface p-3 rounded-xl border border-brand-border dark:border-brand-dark-border">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  Scroll down the share sheet and tap <strong className="inline-flex items-center gap-1 font-semibold text-brand-ink dark:text-white"><PlusSquare className="w-3.5 h-3.5 inline text-brand-orange" /> Add to Home Screen</strong>.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 dark:bg-brand-dark-surface p-3 rounded-xl border border-brand-border dark:border-brand-dark-border">
                <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  Confirm by tapping <strong className="font-semibold text-brand-blue">Add</strong> in the top-right corner.
                </div>
              </li>
            </ol>

            <button
              onClick={() => {
                setShowIOSModal(false);
                setIsVisible(false);
              }}
              className="w-full btn-pill-primary py-3 text-sm font-semibold min-h-[44px]"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
