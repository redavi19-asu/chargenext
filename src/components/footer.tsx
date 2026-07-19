"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Footer Content */}
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">ChargeNext</h3>
            <p className="text-sm leading-relaxed">
              Mobile EV charging brought to you across DC, Maryland, and Virginia with secure, convenient service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#emergency" className="hover:text-white transition">
                  Emergency Charging
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-white transition">
                  Service Area
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@chargenext.com" className="hover:text-white transition">
                  support@chargenext.com
                </a>
              </li>
              <li>
                <a href="mailto:legal@chargenext.com" className="hover:text-white transition">
                  legal@chargenext.com
                </a>
              </li>
              <li>
                <a href="mailto:privacy@chargenext.com" className="hover:text-white transition">
                  privacy@chargenext.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p className="flex items-center gap-2 mb-4 md:mb-0">
            Made with <Heart className="h-3 w-3 text-rose-500" /> for EV drivers in DC, MD, VA
          </p>
          <p>
            &copy; {currentYear} ChargeNext. All rights reserved.
          </p>
        </div>

        {/* Compliance Notice */}
        <div className="mt-8 pt-8 border-t border-slate-700 text-xs text-slate-400">
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
