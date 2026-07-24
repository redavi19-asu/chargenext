import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Terms of Service - ChargeNext",
  description: "ChargeNext Terms of Service outlining the legal agreement and usage terms.",
};

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm font-semibold text-sky-600 hover:text-sky-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600">Last updated: July 19, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
          {/* Introduction */}
          <section className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <p className="text-slate-900 font-semibold mb-2">Legal Agreement</p>
            <p>
              By accessing and using the ChargeNext website and services, you accept and agree to be bound by these Terms of Service. 
              If you do not agree with any part of these terms, you may not use our services.
            </p>
          </section>

          {/* 1. Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Description of Service</h2>
            <p className="mb-4">
              ChargeNext provides on-demand mobile EV charging services in Washington DC, Maryland, and Virginia. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Emergency EV charging requests through our website</li>
              <li>Secure payment processing via Stripe</li>
              <li>Dispatch of qualified charging providers to your location</li>
              <li>Real-time tracking of provider status</li>
              <li>Customer support and service verification</li>
            </ul>
          </section>

          {/* 2. User Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Eligibility</h2>
            <p className="mb-4">
              By using ChargeNext, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>You are at least 18 years of age</li>
              <li>You have the legal right to enter into these terms</li>
              <li>Your vehicle is legally parked and you have authority to request charging at that location</li>
              <li>All information provided is accurate, current, and complete</li>
              <li>You are within our service area (DC, Maryland, Virginia)</li>
            </ul>
          </section>

          {/* 3. User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Responsibilities</h2>
            <p className="mb-4">
              As a ChargeNext user, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate phone number and location information</li>
              <li>Respond to SMS verification codes promptly</li>
              <li>Be present and accessible at the location provided</li>
              <li>Grant safe access to your vehicle for charging</li>
              <li>Not use the service for fraudulent or illegal purposes</li>
              <li>Not misrepresent your emergency circumstances</li>
              <li>Comply with local traffic laws and parking regulations</li>
              <li>Not abuse or harass service providers</li>
            </ul>
          </section>

          {/* 4. Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Payment Terms</h2>
            <p className="mb-4">
              <strong>Pricing:</strong> ChargeNext service pricing is displayed clearly before payment. Prices may vary based on:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Amount of charge required</li>
              <li>Distance and time availability of providers</li>
              <li>Time of day and demand</li>
              <li>Current service area location</li>
            </ul>

            <p className="mb-4">
              <strong>Payment Processing:</strong> All payments are processed securely through Stripe. We do not store your complete credit card information.
            </p>

            <p className="mb-4">
              <strong>Refunds:</strong> Refunds are issued only if:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>No provider could be located despite successful payment</li>
              <li>ChargeNext cancels the service request</li>
              <li>A technical error occurred on our platform</li>
            </ul>

            <p className="mt-4 text-sm font-semibold text-slate-900">
              Refunds will not be issued if you cancel after a provider has been dispatched.
            </p>
          </section>

          {/* 5. Service Availability and Guarantees */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Service Availability and Guarantees</h2>
            <p className="mb-4">
              <strong>Important Disclaimer:</strong> ChargeNext makes NO guarantee of provider availability. 
              While we strive to locate an available charging provider after payment verification, we cannot guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>A provider will be available at your location</li>
              <li>A provider will arrive within any specific timeframe</li>
              <li>The availability of specific charging rates or amounts</li>
            </ul>

            <p className="mt-4">
              Service availability depends on provider capacity, vehicle compatibility, weather conditions, and other factors beyond our control.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHARGENEXT SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Lost profits or revenue</li>
              <li>Damage to your vehicle during service</li>
              <li>Inability to locate a charging provider</li>
              <li>Service provider conduct or professionalism</li>
              <li>Website downtime or technical issues</li>
              <li>Data loss or security breaches (except due to our negligence)</li>
            </ul>

            <p className="mt-4">
              ChargeNext's total liability shall not exceed the amount you paid for the service in question.
            </p>
          </section>

          {/* 7. Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless ChargeNext, its officers, directors, employees, and agents from any claims, 
              damages, losses, or expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Your use of our service</li>
              <li>Violation of these Terms of Service</li>
              <li>Violation of any applicable law or third-party rights</li>
              <li>Content you provide or actions you take</li>
              <li>Your interaction with service providers</li>
            </ul>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Intellectual Property</h2>
            <p className="mb-4">
              All content on ChargeNext (text, graphics, logos, images, software) is owned by or licensed to ChargeNext and 
              protected by international copyright and trademark laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Reproduce or distribute content without permission</li>
              <li>Modify or create derivative works</li>
              <li>Use content for commercial purposes</li>
              <li>Reverse engineer or attempt to access source code</li>
            </ul>
          </section>

          {/* 9. Acceptable Use Policy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Acceptable Use Policy</h2>
            <p className="mb-4">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the service for illegal purposes or fraud</li>
              <li>Provide false or misleading information</li>
              <li>Harass, abuse, or threaten service providers or staff</li>
              <li>Attempt to manipulate or hack our systems</li>
              <li>Make excessive requests that strain our infrastructure</li>
              <li>Violate others' privacy or intellectual property rights</li>
              <li>Share your account with unauthorized users</li>
              <li>Use the service in any way that violates these terms</li>
            </ul>
          </section>

          {/* 10. Account Suspension and Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Account Suspension and Termination</h2>
            <p className="mb-4">
              ChargeNext reserves the right to suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent activity</li>
              <li>Abuse service providers or staff</li>
              <li>Provide false information repeatedly</li>
              <li>Violate applicable laws</li>
            </ul>

            <p className="mt-4">
              Suspension or termination may result in forfeiture of any account credit or pending transactions.
            </p>
          </section>

          {/* 11. Privacy and Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Privacy and Data Protection</h2>
            <p>
              Your use of ChargeNext is also governed by our{" "}
              <Link href="/privacy" className="text-sky-600 hover:text-sky-700 font-semibold">
                Privacy Policy
              </Link>
              {" "}and{" "}
              <Link href="/cookies" className="text-sky-600 hover:text-sky-700 font-semibold">
                Cookie Policy
              </Link>
              . By using our service, you consent to our data practices as outlined in these policies.
            </p>
          </section>

          {/* 12. Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Third-Party Services</h2>
            <p className="mb-4">
              ChargeNext integrates with third-party services including:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700">Stripe Terms</a>)</li>
              <li><strong>Google Maps:</strong> Location services and mapping</li>
              <li><strong>SMS Providers:</strong> Two-factor authentication and verification</li>
            </ul>
            <p>
              These third parties have their own terms and privacy policies. We are not responsible for their services, policies, or conduct.
            </p>
          </section>

          {/* 13. Disclaimer of Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Disclaimer of Warranties</h2>
            <p>
              CHARGENEXT SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
              WE DISCLAIM ALL WARRANTIES INCLUDING:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Fitness for a particular purpose</li>
              <li>Merchantability</li>
              <li>Non-infringement</li>
              <li>Uninterrupted service</li>
            </ul>
          </section>

          {/* 14. Modifications to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Modifications to Terms</h2>
            <p>
              ChargeNext reserves the right to modify these Terms of Service at any time. Changes will be effective upon posting to this page. 
              Your continued use of the service constitutes acceptance of the updated terms. We will notify users of significant changes via email.
            </p>
          </section>

          {/* 15. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Governing Law and Jurisdiction</h2>
            <p className="mb-4">
              These Terms of Service are governed by the laws of Washington, DC, without regard to its conflict of law provisions. 
              You agree to submit to the exclusive jurisdiction of the federal and state courts located in Washington, DC.
            </p>
          </section>

          {/* 16. Contact Us */}
          <section className="rounded-lg bg-slate-100 border border-slate-300 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">16. Contact Us</h2>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> <a href="mailto:support@chargenext.com" className="text-sky-600 hover:text-sky-700">support@chargenext.com</a></p>
              <p><strong>Legal Inquiries:</strong> <a href="mailto:legal@chargenext.com" className="text-sky-600 hover:text-sky-700">legal@chargenext.com</a></p>
              <p><strong>Mailing Address:</strong> ChargeNext, Washington DC, MD, VA</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
