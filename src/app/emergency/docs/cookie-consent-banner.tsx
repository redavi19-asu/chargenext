"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Cookie } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { 
  getCookieConsent, 
  hasUserConsentedToCookies, 
  saveCookieChoice,
  type CookieConsent 
} from "@/lib/cookie-utils";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Only run on client side
    const hasConsented = hasUserConsentedToCookies();
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    saveCookieChoice("accept-all");
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveCookieChoice("reject-non-essential");
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    saveCookieChoice("custom", {
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      preferences: preferences.preferences,
    });
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-6xl"
        >
          <div className="m-4 rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 shadow-2xl">
            <div className="p-6 md:p-8">
              {!showSettings ? (
                <>
                  {/* Banner Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-sky-500/10 p-3 flex-shrink-0">
                        <Cookie className="h-5 w-5 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Privacy & Cookies</h3>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                          We use cookies and similar technologies to improve your experience, remember your preferences, 
                          process secure payments, and analyze website traffic. By clicking Accept, you agree to our use of cookies.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="text-slate-400 hover:text-slate-200 transition flex-shrink-0 mt-1"
                      aria-label="Close cookie banner"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Cookie Types Info */}
                  <div className="grid gap-3 md:grid-cols-4 mb-6 text-xs">
                    <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                      <p className="font-semibold text-white mb-1">🔒 Essential</p>
                      <p className="text-slate-300">Login, security, payment</p>
                    </div>
                    <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                      <p className="font-semibold text-white mb-1">📊 Analytics</p>
                      <p className="text-slate-300">Usage patterns, performance</p>
                    </div>
                    <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                      <p className="font-semibold text-white mb-1">🎯 Marketing</p>
                      <p className="text-slate-300">Personalized content</p>
                    </div>
                    <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3">
                      <p className="font-semibold text-white mb-1">⚙️ Preferences</p>
                      <p className="text-slate-300">User preferences, settings</p>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-2 mb-6 text-xs">
                    <Link
                      href="/privacy"
                      className="text-sky-400 hover:text-sky-300 underline transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-slate-500">•</span>
                    <Link
                      href="/cookies"
                      className="text-sky-400 hover:text-sky-300 underline transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </Link>
                    <span className="text-slate-500">•</span>
                    <Link
                      href="/terms"
                      className="text-sky-400 hover:text-sky-300 underline transition"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row justify-end">
                    <Button
                      variant="secondary"
                      onClick={handleRejectNonEssential}
                      className="rounded-lg h-10 text-sm font-medium"
                    >
                      Reject Non-Essential
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowSettings(true)}
                      className="rounded-lg h-10 text-sm font-medium"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cookie Settings
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="rounded-lg h-10 text-sm font-medium"
                    >
                      Accept All
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Cookie Settings Form */}
                  <div className="space-y-5">
                    <h4 className="text-lg font-bold text-white">Cookie Preferences</h4>

                    {/* Essential Cookies - Always On */}
                    <div className="flex items-start gap-3 rounded-lg bg-slate-700/30 border border-slate-600 p-4">
                      <input
                        type="checkbox"
                        id="essential"
                        checked={true}
                        disabled
                        className="mt-1 rounded h-5 w-5 accent-sky-500 cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <label htmlFor="essential" className="block text-sm font-semibold text-white cursor-not-allowed">
                          Essential Cookies (Required)
                        </label>
                        <p className="text-xs text-slate-300 mt-1">
                          Necessary for security, payment processing, and basic website functionality. These cannot be disabled.
                        </p>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-600 p-4 hover:bg-slate-700/20 transition">
                      <input
                        type="checkbox"
                        id="analytics"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="mt-1 rounded h-5 w-5 accent-sky-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <label htmlFor="analytics" className="block text-sm font-semibold text-white cursor-pointer">
                          Analytics Cookies
                        </label>
                        <p className="text-xs text-slate-300 mt-1">
                          Help us understand how you use our site to improve performance and user experience.
                        </p>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-600 p-4 hover:bg-slate-700/20 transition">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="mt-1 rounded h-5 w-5 accent-sky-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <label htmlFor="marketing" className="block text-sm font-semibold text-white cursor-pointer">
                          Marketing Cookies
                        </label>
                        <p className="text-xs text-slate-300 mt-1">
                          Used to show personalized content and advertisements based on your interests.
                        </p>
                      </div>
                    </div>

                    {/* Preference Cookies */}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-600 p-4 hover:bg-slate-700/20 transition">
                      <input
                        type="checkbox"
                        id="preferences"
                        checked={preferences.preferences}
                        onChange={(e) =>
                          setPreferences({ ...preferences, preferences: e.target.checked })
                        }
                        className="mt-1 rounded h-5 w-5 accent-sky-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <label htmlFor="preferences" className="block text-sm font-semibold text-white cursor-pointer">
                          Preference Cookies
                        </label>
                        <p className="text-xs text-slate-300 mt-1">
                          Remember your preferences, language settings, and other customizations.
                        </p>
                      </div>
                    </div>

                    {/* Settings Action Buttons */}
                    <div className="flex flex-col gap-2 sm:flex-row justify-end pt-4 border-t border-slate-600">
                      <Button
                        variant="secondary"
                        onClick={() => setShowSettings(false)}
                        className="rounded-lg h-10 text-sm font-medium"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSaveSettings}
                        className="rounded-lg h-10 text-sm font-medium"
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
