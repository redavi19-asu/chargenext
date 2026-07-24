import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy - ChargeNext",
  description: "ChargeNext Privacy Policy explaining how we collect, use, and protect customer data.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm font-semibold text-sky-600 hover:text-sky-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: July 19, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
          {/* Introduction */}
          <section className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <p className="text-slate-900 font-semibold mb-2">Important Notice</p>
            <p>
              ChargeNext ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our website and mobile emergency charging services.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Personal Information</h3>
            <p className="mb-4">When you use ChargeNext services, we collect:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Name and Contact Information:</strong> Full name and phone number for emergency service contact</li>
              <li><strong>Location Data:</strong> GPS coordinates and address of your emergency location during service requests</li>
              <li><strong>Payment Information:</strong> Payment details processed securely through Stripe (we never store complete card data)</li>
              <li><strong>Service History:</strong> Records of emergency charging requests, provider interactions, and outcomes</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Device Information:</strong> Device type, browser, IP address, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, referral sources</li>
              <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics (with user consent)</li>
              <li><strong>Geolocation:</strong> Precise location data only when you explicitly request emergency services</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use collected information for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Providing emergency charging services and locating available providers</li>
              <li>Processing payments through Stripe</li>
              <li>Sending SMS verification codes and service updates</li>
              <li>Improving website performance and user experience</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Communicating about service status and provider arrival</li>
              <li>Complying with legal obligations and law enforcement requests</li>
              <li>Analyzing usage patterns to improve our services</li>
            </ul>
          </section>

          {/* 3. Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Share Your Information</h2>
            <p className="mb-4">We share personal information only in these cases:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Service Providers:</strong> Charging providers need your location and phone number to deliver service</li>
              <li><strong>Payment Processor (Stripe):</strong> Payment data for secure transaction processing</li>
              <li><strong>SMS Service Provider:</strong> Phone number for verification code delivery</li>
              <li><strong>Analytics Providers:</strong> Usage data (only with consent, anonymized where possible)</li>
              <li><strong>Legal Requirements:</strong> When required by law enforcement or court orders</li>
            </ul>
            <p className="text-sm font-semibold text-slate-900">
              We do NOT sell or rent your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>HTTPS encryption for all data in transit</li>
              <li>Stripe PCI-DSS compliance for payment data</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Secure authentication and session management</li>
              <li>Limited access to personal data (need-to-know basis)</li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">
              While we maintain strong security practices, no system is completely secure. We cannot guarantee absolute security of your information.
            </p>
          </section>

          {/* 5. Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Your Privacy Rights (GDPR/CCPA)</h2>
            <p className="mb-4">Depending on your location, you may have rights to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (right to be forgotten)</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Opt out of marketing communications and analytics</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@chargenext.com" className="text-sky-600 hover:text-sky-700 font-semibold">
                privacy@chargenext.com
              </a>
            </p>
          </section>

          {/* 6. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
            <p>
              We retain personal information for as long as necessary to provide services and comply with legal obligations. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong>Service Records:</strong> Retained for 3 years for customer support and dispute resolution</li>
              <li><strong>Payment Records:</strong> Retained for 7 years for tax and regulatory compliance</li>
              <li><strong>Analytics Data:</strong> Anonymized and aggregated after 12 months</li>
              <li><strong>SMS Codes:</strong> Deleted immediately after verification</li>
            </ul>
          </section>

          {/* 7. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Children's Privacy</h2>
            <p>
              ChargeNext services are not intended for individuals under 18 years old. We do not knowingly collect information from children. 
              If we become aware that a child has provided information, we will delete it promptly.
            </p>
          </section>

          {/* 8. Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of external sites. 
              We encourage you to review their privacy policies before providing any information.
            </p>
          </section>

          {/* 9. Policy Updates */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Policy Updates</h2>
            <p>
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
              We will notify you of significant changes by posting the updated policy on this page with a new "Last updated" date.
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="rounded-lg bg-slate-100 border border-slate-300 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> <a href="mailto:privacy@chargenext.com" className="text-sky-600 hover:text-sky-700">privacy@chargenext.com</a></p>
              <p><strong>Mailing Address:</strong> ChargeNext, Washington DC, MD, VA</p>
              <p><strong>Data Protection Officer:</strong> Available upon request</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
