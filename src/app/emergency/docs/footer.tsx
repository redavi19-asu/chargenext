"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-sky-400/15 bg-[#01040b] text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        {/* Footer Content */}
        <div className="mb-8 grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">ChargeNext</h3>
            <p className="text-sm leading-relaxed">
              Mobile EV charging brought to you across DC, Maryland, and Virginia with secure, convenient service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#emergency" className="transition hover:text-sky-300">
                  Emergency Charging
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-sky-300">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#coverage" className="transition hover:text-sky-300">
                  Service Area
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="transition hover:text-sky-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="transition hover:text-sky-300">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-sky-300">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@chargenext.com" className="transition hover:text-sky-300">
                  support@chargenext.com
                </a>
              </li>
              <li>
                <a href="mailto:legal@chargenext.com" className="transition hover:text-sky-300">
                  legal@chargenext.com
                </a>
              </li>
              <li>
                <a href="mailto:privacy@chargenext.com" className="transition hover:text-sky-300">
                  privacy@chargenext.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-sky-400/15"></div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between text-xs text-slate-500 md:flex-row">
          <p className="flex items-center gap-2 mb-4 md:mb-0">
            Made with <Heart className="h-3 w-3 text-rose-500" /> for EV drivers in DC, MD, VA
          </p>
          <p>
            &copy; {currentYear} ChargeNext. All rights reserved.
          </p>
        </div>

        {/* Compliance Notice */}
        <div className="mt-8 border-t border-sky-400/15 pt-8 text-xs leading-relaxed text-slate-500">
          <p className="mb-2">
            <strong>GDPR/CCPA Compliance:</strong> ChargeNext respects your privacy rights. 
            We do not sell personal data. You can manage your cookie preferences and exercise 
            data rights anytime. See our{" "}
            <Link href="/privacy" className="text-sky-400 hover:text-sky-300">
              Privacy Policy
            </Link>
            {" "}for details.
          </p>
          <p>
            <strong>Payment Security:</strong> All payments are processed securely through Stripe and encrypted in transit. 
            Your sensitive card data is never stored on our servers.
          </p>
        </div>
      </div>
    </footer>
  );
}
