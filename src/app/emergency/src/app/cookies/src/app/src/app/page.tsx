"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Zap,
  Plug,
  Car,
  MapPin,
  Smartphone,
  ShieldCheck,
  Menu,
  X,
  CalendarDays,
  Headphones,
  LockKeyhole,
  Star,
  Clock3,
  BatteryCharging,
  Route,
  CheckCircle2,
  MessageCircle,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmergencyRequestModal } from "@/components/emergency-request-modal";
import { PaymentVerificationModal } from "@/components/payment-verification-modal";
import { SchedulingRequestModal } from "@/components/scheduling-request-modal";
import { ServiceConfirmationModal } from "@/components/service-confirmation-modal";
import { BatteryMeter } from "@/components/ui/battery-meter";
import { FloatingEmergencyButton } from "@/components/ui/floating-button";
import { StepOneMap } from "@/components/step-one-map";
import { Footer } from "@/components/footer";
import { ElectricNetworkBackground } from "../components/electric-network-background";
import { CHARGENEXT_URLS } from "@/lib/constants";
import { type ServiceId, getService, getServiceMetadata } from "@/lib/services-config";
import { createEmergencyCheckoutSession, verifyStripeCheckoutSession } from "@/lib/emergency-api";

// Dynamically import CoverageModal to avoid SSR issues with react-leaflet
const CoverageModal = dynamic(() => import("@/components/coverage-modal").then(mod => ({ default: mod.CoverageModal })), {
  ssr: false,
});
import {
  clearPendingPaymentVerificationState,
  saveCheckoutSessionId,
  readCheckoutSessionId,
  readEmergencyCheckoutDraft,
  readPendingPaymentVerificationState,
  saveDetectedEmergencyLocation,
  savePendingPaymentVerificationState,
  saveVerifiedEmergencyRequest,
  type EmergencyLocation,
  type EmergencyVerificationRecord,
  type PendingPaymentVerificationState,
} from "@/lib/emergency-flow";

const googleMapsEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.001839478255!2d-77.0368703!3d38.9071923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7bcdf572b1f%3A0xefbdfd5714d0c857!2sWashington%2C%20DC!5e0!3m2!1sen!2sus!4v1730590800000!5m2!1sen!2sus";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

const Section = ({ children, className = "", id }: SectionProps) => (
  <section id={id} className={`relative w-full overflow-x-clip ${className}`}>{children}</section>
);

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.4,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-1 w-full origin-left"
      style={{ scaleX }}
    >
      <div className="h-full w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />
    </motion.div>
  );
}

type HeroProps = {
  onEmergencyNow: () => void;
  onScheduleCharge?: () => void;
};

function ChargeNextLogo() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-label="ChargeNext"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.65, delay: 0.2, ease: "easeOut" }}
      className="chargenext-logo-row"
    >
      <motion.span
        className="chargenext-logo-word chargenext-logo-word--charge"
        animate={prefersReducedMotion ? undefined : { x: [-8, 0], opacity: [0, 1] }}
        transition={prefersReducedMotion ? undefined : { duration: 0.8, ease: "easeOut" }}
      >
        Charge
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="chargenext-logo-core"
        animate={prefersReducedMotion ? undefined : { scale: [0.94, 1.08, 0.94] }}
        transition={prefersReducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span />
      </motion.span>

      <motion.span
        className="chargenext-logo-word chargenext-logo-word--next"
        animate={prefersReducedMotion ? undefined : { x: [8, 0], opacity: [0, 1] }}
        transition={prefersReducedMotion ? undefined : { duration: 0.8, ease: "easeOut" }}
      >
        Next
      </motion.span>
    </motion.div>
  );
}

function ElectricScanner() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0, scaleX: 0.75 }}
      animate={prefersReducedMotion ? { opacity: 1, scaleX: 1 } : { opacity: 1, scaleX: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, delay: 0.35, ease: "easeOut" }}
      className="chargenext-scanner"
    >
      <div className="chargenext-scanner-track">
        <div className="chargenext-scanner-grid" />
        {prefersReducedMotion ? (
          <div className="chargenext-scanner-beam chargenext-scanner-beam--still" />
        ) : (
          <motion.div
            className="chargenext-scanner-beam"
            animate={{ x: ["-115%", "515%", "-115%"] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}

function Hero({ onEmergencyNow, onScheduleCharge }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const intro = prefersReducedMotion ? { duration: 0 } : { duration: 0.65, ease: "easeOut" as const };

  const highlights = [
    { icon: Zap, title: "Fast Response", detail: "We come to you" },
    { icon: MapPin, title: "Live Updates", detail: "ETA in real time" },
    { icon: ShieldCheck, title: "Safe & Reliable", detail: "Trained professionals" },
  ];

  return (
    <Section className="chargenext-network-hero bg-[#01040b] text-white">
      <div className="relative overflow-hidden">
        <ElectricNetworkBackground />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,3,12,0.98)_0%,rgba(0,5,17,0.9)_43%,rgba(0,7,20,0.52)_72%,rgba(0,4,14,0.3)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,transparent_44%,rgba(0,0,0,0.92)_100%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 pb-10 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-6 sm:pb-14 lg:px-10 lg:pb-16 lg:pt-12">
          <div className="mb-4 flex items-center justify-end pr-16 lg:pr-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.12)] backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]" />
              Online
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.82fr)] lg:gap-12">
            <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={intro} className="min-w-0">
              <div className="chargenext-brand-lockup">
                <ChargeNextLogo />
                <ElectricScanner />
              </div>

              <p className="mt-5 text-sm font-extrabold tracking-[0.18em] text-sky-400 sm:text-base">DC • MD • VA</p>

              <h2 className="mt-4 font-orbitron text-[clamp(2.6rem,9vw,5.2rem)] font-black uppercase leading-[0.92] tracking-[-0.055em] text-white drop-shadow-[0_10px_36px_rgba(0,0,0,0.92)]">
                <span className="block">We Bring</span>
                <span className="mt-1 block text-white">The Charge</span>
              </h2>

              <p className="mt-5 max-w-[610px] text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl">
                24/7 mobile EV emergency charging, wherever you are. Request help, follow your ETA, and get safely back on the road.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {highlights.map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="chargenext-mini-feature">
                    <span className="chargenext-mini-feature__icon"><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0"><strong>{title}</strong><small>{detail}</small></span>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <Button className="service-cta service-cta--yellow-ring cta-btn cta-btn--danger min-h-[58px] text-base" onClick={onEmergencyNow}>
                  <Zap className="h-5 w-5" /> Emergency Charge Now
                </Button>
                <Button variant="secondary" className="service-cta service-cta--yellow-ring cta-btn cta-btn--blue min-h-[58px] text-base" onClick={onScheduleCharge}>
                  <CalendarDays className="h-5 w-5" /> Schedule a Charge
                </Button>
              </div>

              <div className="wa-alert-banner mt-5 rounded-xl border border-amber-300/35 bg-amber-100/95 px-4 py-3 text-center shadow-[0_10px_28px_rgba(245,158,11,0.1)]">
                <p className="text-xs font-bold text-amber-950 sm:text-sm">Emergency requests use secure checkout and save your GPS location before dispatch.</p>
              </div>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...intro, delay: prefersReducedMotion ? 0 : 0.18 }}
              className="chargenext-hero-visual"
            >
              <Image
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1600&q=86"
                alt="Electric vehicle ready for mobile charging service"
                width={1200}
                height={920}
                priority
                className="h-full min-h-[300px] w-full object-cover sm:min-h-[390px] lg:min-h-[520px]"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,11,0.05),rgba(1,4,11,0.18)_45%,rgba(1,4,11,0.92)_100%)]" />
              <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 sm:inset-x-5 sm:bottom-5">
                <div className="chargenext-visual-stat"><Clock3 className="h-4 w-4" /><span><strong>Fast</strong><small>Arrival</small></span></div>
                <div className="chargenext-visual-stat"><Route className="h-4 w-4" /><span><strong>Live</strong><small>Tracking</small></span></div>
                <div className="chargenext-visual-stat"><BatteryCharging className="h-4 w-4" /><span><strong>Level 2</strong><small>Power</small></span></div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...intro, delay: prefersReducedMotion ? 0 : 0.28 }} className="chargenext-trustbar mt-7">
            <div><ShieldCheck className="h-5 w-5 text-sky-300" /><span>Fully Insured</span></div>
            <div><Star className="h-5 w-5 text-amber-300" /><span>Customer Focused</span></div>
            <div><LockKeyhole className="h-5 w-5 text-sky-300" /><span>Secure Checkout</span></div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

type StoryPanelProps = {
  id?: string;
  step: number;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  image?: string;
  media?: ReactNode;
  invert?: boolean;
};

function StoryPanel({ id, step, title, subtitle, icon: Icon, image, media, invert }: StoryPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section id={id} className="bg-[#01040b] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55 }}
          className={`chargenext-story-card grid items-center gap-6 p-5 sm:p-7 md:grid-cols-2 lg:gap-10 lg:p-9 ${invert ? "md:[&>*:first-child]:order-2" : ""}`}
        >
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-300">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-[#020817]">{step}</span>
              Step {step}
            </div>
            <h2 className="flex items-start gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {Icon ? <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-sky-400/45 bg-sky-500/10 text-sky-300"><Icon className="h-5 w-5" /></span> : null}
              <span>{title}</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">{subtitle}</p>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-2xl border border-sky-400/18 bg-[#061224] shadow-[0_18px_55px_rgba(0,0,0,0.4)]">
            {media ??
              (image ? (
                <Image
                  src={image}
                  alt={title}
                  width={1280}
                  height={960}
                  className="h-auto min-h-[260px] w-full object-cover sm:min-h-[320px]"
                  loading="lazy"
                  sizes="(min-width: 1024px) 520px, (min-width: 768px) 48vw, 100vw"
                />
              ) : null)}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function Features() {
  const features = [
    { icon: MapPin, title: "DMV Coverage", text: "Mobile charging across Washington, DC, Maryland, and Virginia." },
    { icon: Smartphone, title: "Live ETA & Updates", text: "Follow arrival details and stay connected with your driver." },
    { icon: ShieldCheck, title: "Safe & Insured", text: "Professional equipment, secure checkout, and safety-first service." },
    { icon: Plug, title: "Multiple Connectors", text: "Adapters for popular EVs and major charging standards." },
  ];

  return (
    <Section id="features" className="bg-[#01040b] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chargenext-section-kicker">Built for reliability</span>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Power without the roadside drama</h3>
          <p className="mt-4 text-slate-400">Fast help, clear updates, and a safer way to get moving again.</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="chargenext-feature-card"
            >
              <span className="chargenext-feature-card__icon"><feature.icon className="h-6 w-6" /></span>
              <h4>{feature.title}</h4>
              <p>{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

type PricingProps = {
  onEmergencyNow: () => void;
  onServiceSelect: (serviceId: ServiceId) => void;
  onRequestQuote: () => void;
};

function Pricing({ onEmergencyNow, onServiceSelect, onRequestQuote }: PricingProps) {
  const pricingTiers = [
    {
      id: "emergency-boost",
      name: "Emergency Boost",
      price: "$59",
      priceNote: "per session",
      description: "When you need power now",
      bullets: ["Dispatch within standard hours", "Live ETA and updates", "Adapter included"],
      caution: null,
      isEmergency: true,
      icon: Zap,
      cardClass: "chargenext-service-card--emergency",
      accentClass: "text-red-300",
      iconClass: "border-red-400/55 bg-red-500/12 text-red-300",
    },
    {
      id: "extended-boost",
      name: "Extended Boost",
      price: "$89",
      priceNote: "per session",
      description: "Extra range for longer drives",
      bullets: ["Up to 60 minutes charging", "Live tracking included", "Ideal for continuing your trip", "All connectors available"],
      caution: null,
      isEmergency: false,
      icon: BatteryCharging,
      cardClass: "chargenext-service-card--warm",
      accentClass: "text-orange-300",
      iconClass: "border-orange-400/45 bg-orange-500/10 text-orange-300",
    },
    {
      id: "full-charge-session",
      name: "Full Charge Session",
      price: "$129",
      priceNote: "per session",
      description: "Scheduled charging service",
      bullets: ["Up to 2–3 hours charging", "Best for home or work", "Scheduled convenience", "Real-time monitoring"],
      caution: "Charging time depends on vehicle battery size.",
      isEmergency: false,
      icon: CalendarDays,
      cardClass: "chargenext-service-card--scheduled",
      accentClass: "text-sky-300",
      iconClass: "border-sky-400/55 bg-sky-500/10 text-sky-300",
    },
    {
      id: "pull-up-boost",
      name: "Pull-Up Boost",
      price: "Starting at $25",
      priceNote: "per session",
      description: "Quick boost while you wait",
      bullets: ["10–20 mile quick boost", "15–20 minute session", "Perfect for top-ups", "Available when our truck is nearby"],
      caution: null,
      isEmergency: false,
      icon: Car,
      cardClass: "chargenext-service-card--green",
      accentClass: "text-emerald-300",
      iconClass: "border-emerald-400/45 bg-emerald-500/10 text-emerald-300",
    },
    {
      id: "fleet-services",
      name: "Fleet Services",
      price: "Custom Quote",
      priceNote: "contact for details",
      description: "Charging support for multiple vehicles",
      bullets: ["Bulk service discounts", "Dedicated support", "Flexible scheduling", "Invoice billing available"],
      caution: null,
      isEmergency: false,
      icon: Building2,
      cardClass: "chargenext-service-card--fleet",
      accentClass: "text-violet-300",
      iconClass: "border-violet-400/45 bg-violet-500/10 text-violet-300",
    },
  ];

  return (
    <Section id="pricing" className="bg-[#01040b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="chargenext-section-kicker">Choose your service</span>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, transparent pricing</h3>
          <p className="mt-4 text-slate-400">Emergency help in red. Scheduled services in blue. Every customer action stays easy to find.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                id={tier.isEmergency ? "emergency" : undefined}
                className={`chargenext-service-card ${tier.cardClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${tier.iconClass}`}><Icon className="h-7 w-7" /></span>
                  <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-right text-[11px] font-bold uppercase tracking-[0.12em] ${tier.accentClass}`}>{tier.description}</span>
                </div>

                <div className="mt-5">
                  <h4 className="text-2xl font-bold text-white">{tier.name}</h4>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-3xl font-black tracking-tight text-white">{tier.price}</span>
                    {tier.priceNote ? <span className="text-sm text-slate-400">{tier.priceNote}</span> : null}
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${tier.accentClass}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {tier.caution ? <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100/80">{tier.caution}</p> : null}

                <div className="mt-7 border-t border-white/10 pt-6">
                  {tier.isEmergency ? (
                    <>
                      <Button onClick={onEmergencyNow} className="cta-btn cta-btn--danger service-cta service-cta--yellow-ring min-h-[56px] text-base">
                        <Zap className="h-5 w-5" /> Emergency Charge Now
                      </Button>
                      <p className="mt-3 text-center text-xs text-slate-400">Instant checkout and driver dispatch</p>
                    </>
                  ) : tier.id === "fleet-services" ? (
                    <Button variant="secondary" className="cta-btn cta-btn--blue service-cta service-cta--yellow-ring min-h-[56px] text-base" onClick={onRequestQuote}>
                      Request Quote
                    </Button>
                  ) : (
                    <Button variant="secondary" className="cta-btn cta-btn--blue service-cta service-cta--yellow-ring min-h-[56px] text-base" onClick={() => onServiceSelect(tier.id as ServiceId)}>
                      Request {tier.name}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
          Pricing may vary based on distance, vehicle type, battery size, and service time.
        </p>
      </div>
    </Section>
  );
}

type FinalCTAProps = {
  onEmergencyNow: () => void;
  onScheduleCharge: () => void;
};

function FinalCTA({ onEmergencyNow, onScheduleCharge }: FinalCTAProps) {
  return (
    <Section className="bg-[#01040b] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="chargenext-emergency-banner"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-red-400/65 bg-red-500/10 text-red-300 shadow-[0_0_32px_rgba(239,68,68,0.22)]"><Zap className="h-8 w-8" /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-300">Emergency charging</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">When you need power, now.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">Request an emergency charge for fast dispatch, or schedule service when you have more time.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Button onClick={onEmergencyNow} className="cta-btn cta-btn--danger service-cta service-cta--yellow-ring min-h-[58px] text-base">
              <Zap className="h-5 w-5" /> Emergency Request
            </Button>
            <Button variant="secondary" className="cta-btn cta-btn--blue service-cta service-cta--yellow-ring min-h-[58px] text-base" onClick={onScheduleCharge}>
              <CalendarDays className="h-5 w-5" /> Schedule a Charge
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function CTA({ onOpenScheduling, onOpenCoverage }: { onOpenScheduling: () => void; onOpenCoverage: () => void }) {
  return (
    <Section id="coverage" className="bg-[#01040b] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24">
        <div className="chargenext-support-card">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-amber-300/70 bg-amber-300/8 text-amber-300 shadow-[0_0_34px_rgba(250,204,21,0.2)]"><Headphones className="h-8 w-8" /></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-amber-300">Customer service</p>
              <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Need help now?</h3>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">Our team is standing by to help you choose the right service.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <a
              href={CHARGENEXT_URLS.whatsappEmergency}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn chargenext-support-button service-cta service-cta--yellow-ring min-h-[58px] text-base"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp Us
            </a>
            <Button onClick={onOpenScheduling} variant="secondary" className="cta-btn cta-btn--blue service-cta service-cta--yellow-ring min-h-[58px] text-base">
              <CalendarDays className="h-5 w-5" /> Book a Charge
            </Button>
            <Button onClick={onOpenCoverage} variant="secondary" className="cta-btn chargenext-support-button service-cta service-cta--yellow-ring min-h-[58px] text-base">
              <MapPin className="h-5 w-5" /> See Coverage
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

type MobileMenuProps = {
  onSchedule: () => void;
  onEmergencyNow: () => void;
};

function MobileMenu({ onSchedule, onEmergencyNow }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="fixed right-4 top-4 z-[60] lg:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-blue-400/50 bg-black/75 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_0_24px_rgba(59,130,246,0.12)] backdrop-blur-md"
      >
        {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>

      {isOpen ? (
        <div className="mt-2 w-[90vw] max-w-[320px] rounded-2xl border border-blue-400/25 bg-slate-950/95 p-2.5 text-white shadow-2xl backdrop-blur-xl">
          <nav className="space-y-1 text-[13px]">
            <a href="#top" onClick={closeMenu} className="block rounded-lg px-3 py-1.5 transition hover:bg-white/10">Home</a>
            <a href="#how-it-works" onClick={closeMenu} className="block rounded-lg px-3 py-1.5 transition hover:bg-white/10">How it works</a>
            <a href="#features" onClick={closeMenu} className="block rounded-lg px-3 py-1.5 transition hover:bg-white/10">Features</a>
            <a href="#pricing" onClick={closeMenu} className="block rounded-lg px-3 py-1.5 transition hover:bg-white/10">Pricing</a>
            <motion.a
              href={CHARGENEXT_URLS.whatsappEmergency}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="service-cta service-cta--yellow-ring relative inline-flex w-full items-center justify-start rounded-lg border border-amber-300/30 bg-amber-300/5 px-3 py-2 font-semibold text-amber-200 transition hover:bg-amber-300/10"
            >
              <span className="relative z-10">Customer Service via WhatsApp</span>
            </motion.a>
          </nav>

          <div className="mt-2 space-y-1.5 border-t border-white/15 pt-2.5">
            <Button
              onClick={() => {
                onEmergencyNow();
                closeMenu();
              }}
              className="service-cta service-cta--yellow-ring cta-btn cta-btn--danger h-12 w-full rounded-lg px-4 py-3 text-sm font-semibold"
            >
              Emergency
            </Button>
            <Button
              variant="secondary"
              className="service-cta service-cta--yellow-ring cta-btn cta-btn--blue h-12 w-full rounded-lg text-sm font-semibold"
              onClick={() => {
                onSchedule();
                closeMenu();
              }}
            >
              Schedule
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [isPullUpModalOpen, setIsPullUpModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [isServiceConfirmationOpen, setIsServiceConfirmationOpen] = useState(false);
  const [isServiceCheckoutProcessing, setIsServiceCheckoutProcessing] = useState(false);
  const [gpsLatitude, setGpsLatitude] = useState("");
  const [gpsLongitude, setGpsLongitude] = useState("");
  const [gpsAccuracy, setGpsAccuracy] = useState("");
  const [gpsDetected, setGpsDetected] = useState(false);
  const [isGpsDetecting, setIsGpsDetecting] = useState(false);
  const [isEmergencyRequestModalOpen, setIsEmergencyRequestModalOpen] = useState(false);
  const [isEmergencyCheckoutProcessing, setIsEmergencyCheckoutProcessing] = useState(false);
  const [hasEmergencyCheckoutSubmitted, setHasEmergencyCheckoutSubmitted] = useState(false);
  const [pendingPaymentVerification, setPendingPaymentVerification] = useState<PendingPaymentVerificationState | null>(null);
  const [paymentVerificationBootstrapping, setPaymentVerificationBootstrapping] = useState(false);
  const [paymentVerificationError, setPaymentVerificationError] = useState("");
  const [isSchedulingRequestModalOpen, setIsSchedulingRequestModalOpen] = useState(false);
  const [schedulingRequestDefaultServiceType, setSchedulingRequestDefaultServiceType] = useState("Scheduled Charging");
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);

  const captureCurrentGpsLocation = (onComplete?: (location: EmergencyLocation | null) => void) => {
    setIsGpsDetecting(true);
    setGpsDetected(false);
    setGpsLatitude("");
    setGpsLongitude("");
    setGpsAccuracy("");

    if (!navigator.geolocation) {
      setIsGpsDetecting(false);
      onComplete?.(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const accuracy = Math.round(position.coords.accuracy).toString();
        const location: EmergencyLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "gps",
        };

        saveDetectedEmergencyLocation(location);
        setGpsLatitude(lat);
        setGpsLongitude(lng);
        setGpsAccuracy(accuracy);
        setGpsDetected(true);
        setIsGpsDetecting(false);
        onComplete?.(location);
      },
      () => {
        setGpsDetected(false);
        setIsGpsDetecting(false);
        onComplete?.(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleOpenEmergencyRequestModal = () => {
    setIsEmergencyRequestModalOpen(true);
    captureCurrentGpsLocation();
  };

  const handleOpenServiceConfirmation = (serviceId: ServiceId) => {
    setSelectedService(serviceId);
    setIsServiceConfirmationOpen(true);
    captureCurrentGpsLocation();
  };

  const handleServiceLocationChange = (location: EmergencyLocation | null) => {
    if (!location) {
      setGpsDetected(false);
      setGpsLatitude("");
      setGpsLongitude("");
      setGpsAccuracy("");
      return;
    }

    setGpsDetected(true);
    setGpsLatitude(location.lat.toFixed(6));
    setGpsLongitude(location.lng.toFixed(6));
    setGpsAccuracy(location.accuracy ? String(Math.round(location.accuracy)) : "");
  };

  const handleOpenSchedulingRequest = (defaultServiceType = "Scheduled Charging") => {
    setSchedulingRequestDefaultServiceType(defaultServiceType);
    setIsSchedulingRequestModalOpen(true);
  };

  const handleConfirmService = async () => {
    if (!selectedService || isServiceCheckoutProcessing || isGpsDetecting) {
      return;
    }

    const service = getService(selectedService);
    if (!service) {
      setPaymentVerificationError("Invalid service selected");
      return;
    }

    const currentLocation = gpsDetected && gpsLatitude && gpsLongitude
      ? {
          lat: Number(gpsLatitude),
          lng: Number(gpsLongitude),
          accuracy: gpsAccuracy ? Number(gpsAccuracy) : undefined,
          source: "gps" as const,
        }
      : readEmergencyCheckoutDraft()?.location ?? null;

    setIsServiceCheckoutProcessing(true);
    setPaymentVerificationError("");

    try {
      const currentUrl = new URL(window.location.href);
      const successUrl = `${currentUrl.origin}${currentUrl.pathname}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl.origin}${currentUrl.pathname}`;
      
      const checkoutResponse = await createEmergencyCheckoutSession({
        successUrl,
        cancelUrl,
        location: currentLocation,
        tier: service.name,
        amount: service.priceAmount,
        metadata: getServiceMetadata(selectedService),
      });

      const checkoutSessionId = String(checkoutResponse.session_id || checkoutResponse.id || "");
      if (!checkoutSessionId) {
        throw new Error("Stripe did not return a checkout session id.");
      }

      saveCheckoutSessionId(checkoutSessionId);

      if (checkoutResponse.url) {
        window.location.href = checkoutResponse.url;
        return;
      }

      throw new Error("Stripe checkout URL was not returned.");
    } catch (error) {
      setPaymentVerificationError(error instanceof Error ? error.message : "Unable to create Stripe checkout session.");
      setIsServiceCheckoutProcessing(false);
    }
  };

  const handleContinueToSecurePayment = async () => {
    if (isGpsDetecting || isEmergencyCheckoutProcessing || hasEmergencyCheckoutSubmitted) {
      return;
    }

    const currentLocation = gpsDetected && gpsLatitude && gpsLongitude
      ? {
          lat: Number(gpsLatitude),
          lng: Number(gpsLongitude),
          accuracy: gpsAccuracy ? Number(gpsAccuracy) : undefined,
          source: "gps" as const,
        }
      : readEmergencyCheckoutDraft()?.location ?? null;

    setIsEmergencyCheckoutProcessing(true);
    setHasEmergencyCheckoutSubmitted(true);
    setPaymentVerificationError("");

    try {
      const currentUrl = new URL(window.location.href);
      const successUrl = `${currentUrl.origin}${currentUrl.pathname}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${currentUrl.origin}${currentUrl.pathname}`;
      const emergencyService = getService("emergency-boost");
      
      if (!emergencyService) {
        throw new Error("Emergency Boost service not configured");
      }

      const checkoutResponse = await createEmergencyCheckoutSession({
        successUrl,
        cancelUrl,
        location: currentLocation,
        tier: emergencyService.name,
        amount: emergencyService.priceAmount,
        metadata: getServiceMetadata("emergency-boost"),
      });

      const checkoutSessionId = String(checkoutResponse.session_id || checkoutResponse.id || "");
      if (!checkoutSessionId) {
        throw new Error("Stripe did not return a checkout session id.");
      }

      saveCheckoutSessionId(checkoutSessionId);

      if (checkoutResponse.url) {
        window.location.href = checkoutResponse.url;
        return;
      }

      throw new Error("Stripe checkout URL was not returned.");
    } catch (error) {
      setPaymentVerificationError(error instanceof Error ? error.message : "Unable to create Stripe checkout session.");
      setHasEmergencyCheckoutSubmitted(false);
      setIsEmergencyCheckoutProcessing(false);
    }
  };


  useEffect(() => {
    let isActive = true;

    const restorePaymentVerification = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlSessionId = searchParams.get("session_id") || searchParams.get("checkout_session_id");
      const storedState = readPendingPaymentVerificationState();
      const fallbackSessionId = readCheckoutSessionId();
      const sessionId = urlSessionId || storedState?.stripeSessionId || fallbackSessionId;

      if (!sessionId) {
        return;
      }

      setPaymentVerificationBootstrapping(true);
      setPaymentVerificationError("");

      try {
        const response = await verifyStripeCheckoutSession(sessionId);
        const paid = response.paid === true || response.valid === true || response.paymentStatus === "paid" || response.status === "paid";

        if (!paid) {
          clearPendingPaymentVerificationState();
          if (isActive) {
            setPendingPaymentVerification(null);
          }
          return;
        }

        const draft = readEmergencyCheckoutDraft();
        const returnedLocation = response.location || draft?.location || null;
        const nextState: PendingPaymentVerificationState = {
          stripeSessionId: response.stripeSessionId || response.sessionId || sessionId,
          phoneNumber: storedState?.phoneNumber || "",
          latitude: storedState?.latitude ?? returnedLocation?.lat ?? null,
          longitude: storedState?.longitude ?? returnedLocation?.lng ?? null,
          smsSent: storedState?.smsSent || false,
          currentStep: storedState?.currentStep || "location",
          paymentVerificationStatus: storedState?.paymentVerificationStatus === "invalid" ? "pending" : storedState?.paymentVerificationStatus || "pending",
          requestTimestamp: response.requestTimestamp || storedState?.requestTimestamp || draft?.capturedAt || new Date().toISOString(),
          isMinimized: storedState?.isMinimized || false,
          locationAddress: storedState?.locationAddress || returnedLocation?.address || undefined,
          locationLabel: storedState?.locationLabel || returnedLocation?.label || undefined,
          updatedAt: new Date().toISOString(),
        };

        savePendingPaymentVerificationState(nextState);

        if (returnedLocation) {
          saveDetectedEmergencyLocation(returnedLocation);
        }

        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("session_id");
        cleanUrl.searchParams.delete("checkout_session_id");
        cleanUrl.searchParams.delete("paid");
        cleanUrl.searchParams.delete("payment");
        window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);

        if (isActive) {
          setPendingPaymentVerification(nextState);
        }
      } catch (paymentError) {
        clearPendingPaymentVerificationState();
        if (isActive) {
          setPaymentVerificationError(paymentError instanceof Error ? paymentError.message : "Unable to verify payment.");
          setPendingPaymentVerification(null);
        }
      } finally {
        if (isActive) {
          setPaymentVerificationBootstrapping(false);
        }
      }
    };

    void restorePaymentVerification();

    return () => {
      isActive = false;
    };
  }, []);

  const handleVerifiedPayment = (record: EmergencyVerificationRecord) => {
    saveVerifiedEmergencyRequest(record);

    if (!pendingPaymentVerification) {
      return;
    }

    const nextState: PendingPaymentVerificationState = {
      ...pendingPaymentVerification,
      paymentVerificationStatus: "verified",
      trackingRecord: record,
      isMinimized: false,
      updatedAt: new Date().toISOString(),
    };

    setPendingPaymentVerification(nextState);
    savePendingPaymentVerificationState(nextState);
  };

  const handlePaymentVerificationStateChange = (nextState: PendingPaymentVerificationState) => {
    setPendingPaymentVerification(nextState);
    savePendingPaymentVerificationState(nextState);
  };

  const handleMinimizePaymentVerification = () => {
    if (!pendingPaymentVerification) {
      return;
    }

    handlePaymentVerificationStateChange({
      ...pendingPaymentVerification,
      isMinimized: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleReopenPaymentVerification = () => {
    if (!pendingPaymentVerification) {
      return;
    }

    handlePaymentVerificationStateChange({
      ...pendingPaymentVerification,
      isMinimized: false,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div id="top" className="chargenext-page relative bg-[#01040b] text-white">
      <ProgressBar />
      <MobileMenu
        onSchedule={() => handleOpenSchedulingRequest("Scheduled Charging")}
        onEmergencyNow={handleOpenEmergencyRequestModal}
      />
      <FloatingEmergencyButton />

      {paymentVerificationBootstrapping ? (
        <div className="fixed left-1/2 top-20 z-[68] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 px-3">
          <Card className="border-slate-200 bg-white/95 shadow-xl backdrop-blur">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-700">
              <div className="mt-1 h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
              Verifying your Stripe payment on the backend...
            </CardContent>
          </Card>
        </div>
      ) : null}

      {paymentVerificationError ? (
        <div className="fixed left-1/2 top-20 z-[68] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 px-3">
          <Card className="border-rose-200 bg-white/95 shadow-xl backdrop-blur">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-rose-700">
              <div className="mt-1 h-4 w-4 rounded-full bg-rose-500" />
              {paymentVerificationError}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {pendingPaymentVerification?.isMinimized ? (
        <button
          type="button"
          onClick={handleReopenPaymentVerification}
          className="fixed bottom-6 left-1/2 z-[68] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-sky-200 bg-white px-4 py-4 text-left shadow-2xl ring-1 ring-sky-100 transition hover:shadow-[0_20px_45px_rgba(15,23,42,0.15)] sm:bottom-8"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sky-100 p-2 text-sky-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Payment Received — Complete Verification</p>
              <p className="text-xs text-slate-600">Tap to finish confirming your phone number and emergency location.</p>
            </div>
          </div>
        </button>
      ) : null}
      
      <Hero
        onEmergencyNow={handleOpenEmergencyRequestModal}
        onScheduleCharge={() => handleOpenSchedulingRequest("Scheduled Charging")}
      />
      <StoryPanel
        id="how-it-works"
        step={1}
        title="We find you fast"
        subtitle="Need help right now? Tap Emergency Now for secure checkout, then confirm your phone number and emergency location after payment. Just planning ahead? Use the request form for non-emergency service."
        icon={MapPin}
        media={
          <StepOneMap defaultEmbedUrl={googleMapsEmbedUrl} />
        }
      />
      <StoryPanel
        step={2}
        title="We connect the charge"
        subtitle="The tech arrives with professional equipment, verifies safety protocols, and connects the right adapter for your EV."
        icon={Plug}
        image="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1600&q=80"
        invert
      />
      <StoryPanel
        step={3}
        title="Power up and go"
        subtitle="Watch your battery come back to life. Get enough charge to reach your destination or the nearest charging station."
        icon={Car}
        media={<BatteryMeter />}
      />
      <Features />
      <Pricing
        onEmergencyNow={handleOpenEmergencyRequestModal}
        onServiceSelect={handleOpenServiceConfirmation}
        onRequestQuote={() => handleOpenSchedulingRequest("Fleet EV Charging")}
      />
      <FinalCTA
        onEmergencyNow={handleOpenEmergencyRequestModal}
        onScheduleCharge={() => handleOpenSchedulingRequest("Scheduled Charging")}
      />
      <CTA onOpenScheduling={() => setIsSchedulingRequestModalOpen(true)} onOpenCoverage={() => setIsCoverageModalOpen(true)} />
      <Footer />

      <CoverageModal isOpen={isCoverageModalOpen} onClose={() => setIsCoverageModalOpen(false)} />
      <SchedulingRequestModal
        isOpen={isSchedulingRequestModalOpen}
        onClose={() => setIsSchedulingRequestModalOpen(false)}
        defaultServiceType={schedulingRequestDefaultServiceType}
      />

      <Modal
        isOpen={isPullUpModalOpen}
        onClose={() => setIsPullUpModalOpen(false)}
        title="Pull-Up Boost Check-In"
      >
        <form
          action={CHARGENEXT_URLS.formspreeEndpoint}
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="service_tier" value="pull-up-boost" />

          <p className="rounded-lg bg-sky-50 border border-sky-200 p-4 text-sm text-sky-900">
            You&apos;re at the ChargeNext truck. Fill this quick check-in so we can start your charging session.
          </p>

          <div>
            <label htmlFor="pullup-vehicle-type" className="block text-sm font-medium text-slate-700">
              Vehicle Type
            </label>
            <select
              id="pullup-vehicle-type"
              name="vehicle_type"
              required
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="" disabled>
                Select vehicle type
              </option>
              <option value="Tesla">Tesla</option>
              <option value="Ford">Ford</option>
              <option value="Rivian">Rivian</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="pullup-license-plate" className="block text-sm font-medium text-slate-700">
              License Plate (optional)
            </label>
            <input
              type="text"
              id="pullup-license-plate"
              name="license_plate"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label htmlFor="pullup-phone" className="block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="pullup-phone"
              name="phone"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label htmlFor="pullup-email" className="block text-sm font-medium text-slate-700">
              Email (for receipt)
            </label>
            <input
              type="email"
              id="pullup-email"
              name="email"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label htmlFor="pullup-stall" className="block text-sm font-medium text-slate-700">
              Parking Spot or Stall Number (optional)
            </label>
            <input
              type="text"
              id="pullup-stall"
              name="parking_spot"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <Button type="submit" className="service-cta service-cta--yellow-ring cta-btn--blue w-full rounded-xl py-6 text-base">
            Start Charging Session
          </Button>
        </form>
      </Modal>

      <EmergencyRequestModal
        isOpen={isEmergencyRequestModalOpen}
        location={gpsDetected ? { lat: Number(gpsLatitude), lng: Number(gpsLongitude), accuracy: gpsAccuracy ? Number(gpsAccuracy) : undefined, source: "gps" } : readEmergencyCheckoutDraft()?.location || null}
        isDetectingLocation={isGpsDetecting}
        isProcessing={isEmergencyCheckoutProcessing}
        hasSubmitted={hasEmergencyCheckoutSubmitted}
        onUseCurrentLocation={() => captureCurrentGpsLocation()}
        onCancel={() => setIsEmergencyRequestModalOpen(false)}
        onContinue={handleContinueToSecurePayment}
      />

      <PaymentVerificationModal
        isOpen={!!pendingPaymentVerification && !pendingPaymentVerification.isMinimized}
        stripeSessionId={pendingPaymentVerification?.stripeSessionId || ""}
        requestTimestamp={pendingPaymentVerification?.requestTimestamp || ""}
        initialLocation={pendingPaymentVerification && pendingPaymentVerification.latitude !== null && pendingPaymentVerification.longitude !== null ? {
          lat: pendingPaymentVerification.latitude,
          lng: pendingPaymentVerification.longitude,
          address: pendingPaymentVerification.locationAddress,
          label: pendingPaymentVerification.locationLabel,
          source: "gps",
        } : readEmergencyCheckoutDraft()?.location || null}
        paymentStatus={pendingPaymentVerification?.paymentVerificationStatus === "sms-sent" ? "paid" : pendingPaymentVerification?.paymentVerificationStatus || "paid"}
        pendingState={pendingPaymentVerification}
        onMinimize={handleMinimizePaymentVerification}
        onStateChange={handlePaymentVerificationStateChange}
        onVerified={handleVerifiedPayment}
      />

      <ServiceConfirmationModal
        isOpen={isServiceConfirmationOpen}
        service={selectedService ? getService(selectedService) : null}
        location={gpsDetected ? { lat: Number(gpsLatitude), lng: Number(gpsLongitude), accuracy: gpsAccuracy ? Number(gpsAccuracy) : undefined, source: "gps" } : null}
        isProcessing={isServiceCheckoutProcessing}
        onConfirm={handleConfirmService}
        onLocationChange={handleServiceLocationChange}
        onCancel={() => {
          setIsServiceConfirmationOpen(false);
          setSelectedService(null);
          setIsServiceCheckoutProcessing(false);
        }}
      />
    </div>
  );
}
