import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Cookie Policy - ChargeNext",
  description: "ChargeNext Cookie Policy explaining what cookies we use and how to manage them.",
};

export default function CookiePolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm font-semibold text-sky-600 hover:text-sky-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Cookie Policy</h1>
          <p className="text-slate-600">Last updated: July 19, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
          {/* Introduction */}
          <section className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <p className="text-slate-900 font-semibold mb-2">What This Policy Covers</p>
            <p>
              This Cookie Policy explains how ChargeNext uses cookies and similar tracking technologies on our website 
              to enhance your experience, improve functionality, and understand how you use our services. This policy 
              applies to all visitors to chargenext.com.
            </p>
          </section>

          {/* 1. What Are Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. What Are Cookies?</h2>
            <p className="mb-4">
              Cookies are small text files stored on your browser or device that help websites recognize you and remember information. 
              We also use similar technologies like:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Local Storage:</strong> Browser storage for client-side data (preferences, consent choices)</li>
              <li><strong>Session Storage:</strong> Temporary storage for the current browsing session</li>
              <li><strong>Web Beacons:</strong> Transparent images used to track interactions</li>
              <li><strong>Pixels:</strong> Small code snippets for analytics and tracking</li>
            </ul>
          </section>

          {/* 2. Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Types of Cookies We Use</h2>

            <div className="space-y-6">
              {/* Essential */}
              <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-5">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">🔒 Essential Cookies (Required)</h3>
                <p className="text-sm text-emerald-800 mb-3">
                  These cookies are necessary for the website to function properly and cannot be disabled. They include:
                </p>
                <div className="space-y-2 text-sm text-emerald-800 bg-white rounded p-3">
                  <p><strong>chargenext:session</strong> - Maintains your browsing session and authentication state</p>
                  <p><strong>chargenext:payment:pending</strong> - Stores verification state during payment flow for recovery</p>
                  <p><strong>chargenext:checkout</strong> - Maintains Stripe checkout session ID</p>
                  <p><strong>CSRF Tokens</strong> - Prevents cross-site request forgery attacks</p>
                  <p><strong>Security Flags</strong> - Tracks fraud prevention and security measures</p>
                </div>
              </div>

              {/* Analytics */}
              <div className="rounded-lg border-2 border-sky-200 bg-sky-50 p-5">
                <h3 className="text-lg font-semibold text-sky-900 mb-2">📊 Analytics Cookies (Opt-In)</h3>
                <p className="text-sm text-sky-800 mb-3">
                  Helps us understand how visitors interact with our website to improve performance and user experience. 
                  Only loaded with your consent.
                </p>
                <div className="space-y-2 text-sm text-sky-800 bg-white rounded p-3">
                  <p><strong>_ga, _ga_*</strong> - Google Analytics (if enabled) for website usage insights</p>
                  <p><strong>Performance Metrics</strong> - Page load times, feature usage patterns</p>
                  <p><strong>Referral Source</strong> - How you discovered ChargeNext</p>
                  <p><strong>Data Retention:</strong> Typically 12-24 months</p>
                </div>
              </div>

              {/* Marketing */}
              <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-5">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">🎯 Marketing Cookies (Opt-In)</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Used to deliver personalized content and track campaign effectiveness. Only loaded with your consent.
                </p>
                <div className="space-y-2 text-sm text-purple-800 bg-white rounded p-3">
                  <p><strong>Conversion Tracking</strong> - Tracks if you complete desired actions</p>
                  <p><strong>Retargeting Pixels</strong> - Shows relevant ads on other websites (if opted in)</p>
                  <p><strong>Campaign Source</strong> - Tracks which marketing campaign led to your visit</p>
                  <p><strong>Data Retention:</strong> Typically 30-90 days</p>
                </div>
              </div>

              {/* Preferences */}
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-5">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">⚙️ Preference Cookies (Opt-In)</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Remembers your choices to personalize your experience. Only loaded with your consent.
                </p>
                <div className="space-y-2 text-sm text-amber-800 bg-white rounded p-3">
                  <p><strong>chargenext:cookie-consent</strong> - Your cookie consent preferences</p>
                  <p><strong>chargenext:theme</strong> - Your preferred display theme (light/dark)</p>
                  <p><strong>Language Preference</strong> - Your selected language</p>
                  <p><strong>Location Preference</strong> - Saved emergency location data</p>
                  <p><strong>Data Retention:</strong> Up to 365 days (or until cleared)</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Third-Party Cookies</h2>
            <p className="mb-4">
              We use services from third parties that may place cookies on your device:
            </p>
            <div className="space-y-4">
              <div className="rounded border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Stripe (Payment Processing)</h4>
                <p className="text-sm text-slate-600">
                  Sets cookies for secure payment processing and fraud prevention. 
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 ml-1">
                    Stripe Privacy Policy
                  </a>
                </p>
              </div>
              <div className="rounded border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Google Analytics</h4>
                <p className="text-sm text-slate-600">
                  Tracks website usage analytics (only with consent). 
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 ml-1">
                    Google Privacy Policy
                  </a>
                </p>
              </div>
              <div className="rounded border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-900 mb-2">SMS/Messaging Providers</h4>
                <p className="text-sm text-slate-600">
                  May set cookies for verification code delivery. These are essential for service functionality.
                </p>
              </div>
            </div>
          </section>

          {/* 4. How to Manage Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. How to Manage Your Cookies</h2>

            <h3 className="text-lg font-semibold text-slate-900 mb-3">On ChargeNext</h3>
            <p className="mb-4">
              When you first visit ChargeNext, you'll see a cookie consent banner at the bottom of the page. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Accept All:</strong> Accept all cookies (essential, analytics, marketing, preferences)</li>
              <li><strong>Reject Non-Essential:</strong> Only accept essential cookies required for functionality</li>
              <li><strong>Cookie Settings:</strong> Customize which optional cookies to accept</li>
              <li><strong>Withdraw Consent:</strong> Change your preferences anytime from the banner again</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mb-3">In Your Browser</h3>
            <p className="mb-4">
              You can also manage cookies directly in your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and other site permissions</li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">
              <strong>Note:</strong> Disabling essential cookies may prevent ChargeNext from functioning properly, 
              including payment processing and emergency service verification.
            </p>
          </section>

          {/* 5. Do Not Track */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Do Not Track (DNT)</h2>
            <p>
              Some browsers include a "Do Not Track" feature. When enabled, we respect DNT signals and minimize optional tracking. 
              However, essential cookies and functionality required for services will still be used to ensure you can use ChargeNext.
            </p>
          </section>

          {/* 6. Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy to reflect new technologies, legal requirements, or changes to our practices. 
              We will notify you of significant changes by updating the "Last updated" date and posting a notice on our website.
            </p>
          </section>

          {/* 7. Contact Us */}
          <section className="rounded-lg bg-slate-100 border border-slate-300 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Questions About Cookies?</h2>
            <p className="mb-4">
              If you have questions about how ChargeNext uses cookies or want to exercise your data rights, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> <a href="mailto:privacy@chargenext.com" className="text-sky-600 hover:text-sky-700">privacy@chargenext.com</a></p>
              <p><strong>Website:</strong> <a href="https://chargenext.com" className="text-sky-600 hover:text-sky-700">chargenext.com</a></p>
              <p><strong>Related Policies:</strong> <Link href="/privacy" className="text-sky-600 hover:text-sky-700">Privacy Policy</Link> • <Link href="/terms" className="text-sky-600 hover:text-sky-700">Terms of Service</Link></p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
