/**
 * Cookie consent utility functions for GDPR/CCPA compliance
 */

export type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
  version: number;
};

export type CookieConsentChoice = "accept-all" | "reject-non-essential" | "custom";

const COOKIE_CONSENT_KEY = "chargenext:cookie-consent";
const COOKIE_CONSENT_VERSION = 1;
const COOKIE_EXPIRY_DAYS = 365;

/**
 * Get the current cookie consent preference from localStorage
 */
export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as CookieConsent;
    
    // Check if consent is expired (older than 1 year)
    const ageInDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
    if (ageInDays > COOKIE_EXPIRY_DAYS) {
      clearCookieConsent();
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error("Failed to parse cookie consent", error);
    return null;
  }
}

/**
 * Save user's cookie consent preference
 */
export function setCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === "undefined") return;
  
  const consentData: CookieConsent = {
    essential: true, // Always true - essential cookies are always enabled
    analytics: consent.analytics ?? false,
    marketing: consent.marketing ?? false,
    preferences: consent.preferences ?? false,
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };
  
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    
    // Set cookie as backup (for server-side access if needed)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
    document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to save cookie consent", error);
  }
}

/**
 * Clear cookie consent (typically on "Manage Preferences" or reset)
 */
export function clearCookieConsent(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    document.cookie = `${COOKIE_CONSENT_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to clear cookie consent", error);
  }
}

/**
 * Check if user has made a consent choice
 */
export function hasUserConsentedToCookies(): boolean {
  return getCookieConsent() !== null;
}

/**
 * Save consent choice (simplified version for banner)
 */
export function saveCookieChoice(choice: CookieConsentChoice, customSettings?: Partial<CookieConsent>): void {
  if (choice === "accept-all") {
    setCookieConsent({
      analytics: true,
      marketing: true,
      preferences: true,
    });
  } else if (choice === "reject-non-essential") {
    setCookieConsent({
      analytics: false,
      marketing: false,
      preferences: false,
    });
  } else if (choice === "custom" && customSettings) {
    setCookieConsent(customSettings);
  }
}

/**
 * Load analytics only if user has consented
 */
export function shouldLoadAnalytics(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics ?? false;
}

/**
 * Load marketing trackers only if user has consented
 */
export function shouldLoadMarketing(): boolean {
  const consent = getCookieConsent();
  return consent?.marketing ?? false;
}

/**
 * Load preference cookies
 */
export function shouldLoadPreferences(): boolean {
  const consent = getCookieConsent();
  return consent?.preferences ?? false;
}
