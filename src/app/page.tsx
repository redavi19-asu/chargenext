"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Zap, Plug, Car, MapPin, Smartphone, ShieldCheck, Menu, X } from "lucide-react";

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
  <section id={id} className={`relative w-full ${className}`}>{children}</section>
);

type StickyProps = {
  children: ReactNode;
  className?: string;
  innerClass?: string;
};

const Sticky = ({ children, className = "", innerClass = "" }: StickyProps) => (
  <div
    className={`relative lg:sticky lg:top-0 flex items-start lg:items-center pt-[calc(env(safe-area-inset-top)+7rem)] lg:pt-0 pb-8 lg:pb-0 ${className}`}
  >
    <div className={`w-full ${innerClass}`}>{children}</div>
  </div>
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
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 3.05, ease: "easeOut" }}
      className="mt-1 flex w-full justify-center"
    >
      <div className="inline-flex items-center justify-center gap-[6px] whitespace-nowrap sm:gap-[10px]">
        <motion.h1
          className="font-orbitron text-[clamp(2.8rem,12vw,4.6rem)] sm:text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter sm:tracking-tight text-white drop-shadow-2xl leading-none"
          animate={prefersReducedMotion ? undefined : { x: [-6, 0], opacity: [0, 1] }}
          transition={prefersReducedMotion ? undefined : { duration: 1.3, ease: "easeIn" }}
          style={{
            textShadow: "0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(56, 189, 248, 0.1)",
            lineHeight: "1.1",
          }}
        >
          Charge
        </motion.h1>

        <motion.span
          aria-hidden="true"
          className="relative inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center sm:h-[38px] sm:w-[38px]"
          animate={prefersReducedMotion ? undefined : { scale: [0.96, 1.08, 0.96] }}
          transition={prefersReducedMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 16px rgba(59, 130, 246, 0.72))" }}
        >
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.95)_0%,rgba(59,130,246,0.78)_30%,rgba(29,78,216,0.2)_58%,transparent_78%)] shadow-[0_0_18px_rgba(59,130,246,0.5),0_0_42px_rgba(29,78,216,0.26)]" />
          <span className="absolute inset-[6px] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,1)_0%,rgba(59,130,246,0.95)_45%,rgba(29,78,216,0.38)_100%)]" />
        </motion.span>

        <motion.h1
          className="font-orbitron text-[clamp(2.8rem,12vw,4.6rem)] sm:text-7xl md:text-9xl lg:text-[11rem] font-black tracking-tighter sm:tracking-tight bg-gradient-to-b from-sky-300 via-blue-500 to-blue-700 bg-clip-text text-transparent drop-shadow-2xl text-electric-shimmer idle-glow leading-none"
          animate={prefersReducedMotion ? undefined : { x: [6, 0], opacity: [0, 1] }}
          transition={prefersReducedMotion ? undefined : { duration: 1.3, ease: "easeIn" }}
          style={{
            lineHeight: "1.1",
          }}
        >
          Next
        </motion.h1>
      </div>
    </motion.div>
  );
}

function ElectricScanner() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 3.05, ease: "easeOut" }}
      className="mt-1 flex w-full justify-center"
    >
      <div className="relative w-[88vw] max-w-[360px] px-0 sm:w-[min(54vw,620px)] sm:max-w-none">
        <div
          className="absolute left-1/2 top-full mt-2 h-3 w-[84%] -translate-x-1/2 rounded-full bg-blue-500/20 blur-2xl"
          style={{ transform: "translateX(-50%)" }}
        />

        <div className="relative h-3.5 overflow-hidden rounded-full border border-blue-200/20 bg-[linear-gradient(180deg,rgba(5,10,18,0.95),rgba(9,18,30,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(59,130,246,0.12),0_12px_28px_rgba(0,0,0,0.45)] backdrop-blur-md sm:h-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_72%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_20%,transparent_80%,rgba(255,255,255,0.02))]" />

          {prefersReducedMotion ? (
            <div className="absolute inset-y-0 left-1/2 w-[18%] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.12)_15%,rgba(59,130,246,0.88)_50%,rgba(125,211,252,0.9)_62%,rgba(59,130,246,0.12)_85%,transparent_100%)] shadow-[0_0_18px_rgba(59,130,246,0.45)]" />
          ) : (
            <motion.div
              className="absolute inset-y-0 left-1/2 w-[18%] -translate-x-1/2"
              animate={{ x: ["-220%", "220%", "-220%"] }}
              transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 14px rgba(59, 130, 246, 0.7))" }}
            >
              <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent_0%,rgba(59,130,246,0.04)_12%,rgba(59,130,246,0.58)_42%,rgba(125,211,252,1)_50%,rgba(59,130,246,0.58)_58%,rgba(59,130,246,0.04)_88%,transparent_100%)]" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,0.95)_0%,rgba(59,130,246,0.9)_26%,rgba(59,130,246,0.35)_52%,transparent_78%)] blur-[0.5px]" />
              <div className="absolute inset-0 rounded-full ring-1 ring-blue-200/30" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Hero({ onEmergencyNow, onScheduleCharge }: HeroProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const opacity = useTransform(scrollYProgress, [0, 0.68, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.985]);
  const intro = prefersReducedMotion ? { duration: 0 } : { duration: 0.75, delay: 3.1, ease: "easeOut" as const };

  return (
    <Section className="chargenext-network-hero overflow-hidden bg-black text-white">
      <div ref={ref} className="relative min-h-[100vh] h-auto">
        <Sticky className="relative overflow-hidden min-h-[100vh] pb-8 lg:pb-8">
          <ElectricNetworkBackground />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,3,12,0.98)_0%,rgba(0,5,17,0.91)_31%,rgba(0,7,20,0.54)_58%,rgba(0,4,14,0.18)_100%)]" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_23%,transparent_70%,rgba(0,0,0,0.78)_100%)]" />

          <motion.div style={{ y, opacity, scale }} className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-0 sm:px-8 lg:px-12 xl:px-14">
            <div className="grid min-h-[calc(100dvh-7rem)] items-center pt-2 lg:grid-cols-[minmax(0,620px)_1fr] lg:pt-16">
              <div className="max-w-[650px] text-left">
                <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={intro}>
                  <div className="mb-4 origin-left scale-[0.95] sm:scale-[0.72] md:scale-[0.78] lg:mb-6 lg:scale-[0.68] [&>div]:justify-start [&>div]:mt-0">
                    <ChargeNextLogo />
                  </div>
                  <div className="mb-5 hidden max-w-[330px] lg:block">
                    <ElectricScanner />
                  </div>
                </motion.div>

                <motion.p initial={prefersReducedMotion ? false : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={intro} className="mb-3 text-base font-bold tracking-[0.12em] text-sky-400 sm:text-lg">
                  DC • MD • VA
                </motion.p>

                <motion.h2 initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={intro} className="font-orbitron text-[clamp(2.6rem,7.4vw,5.4rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] drop-shadow-[0_8px_35px_rgba(0,0,0,0.95)]">
                  <span className="block text-white">We Bring</span>
                  <span className="mt-2 block bg-gradient-to-b from-sky-300 via-blue-500 to-blue-700 bg-clip-text text-transparent">The Charge</span>
                </motion.h2>

                <motion.p initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...intro, delay: prefersReducedMotion ? 0 : 3.35 }} className="mt-6 max-w-[590px] text-lg leading-relaxed text-white/86 sm:text-xl md:text-2xl">
                  Mobile EV charging that comes to you — fast, reliable, and anywhere you need it.
                </motion.p>

                <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...intro, delay: prefersReducedMotion ? 0 : 3.55 }} className="mt-7 grid max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { icon: Zap, title: "On-Demand", detail: "Fast Response" },
                    { icon: ShieldCheck, title: "Safe &", detail: "Professional" },
                    { icon: MapPin, title: "DC, MD", detail: "& VA" },
                  ].map(({ icon: Icon, title, detail }) => (
                    <div key={title} className="flex items-center gap-3 rounded-xl border border-sky-400/18 bg-black/30 px-3 py-3 backdrop-blur-sm">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-sky-400/75 bg-sky-500/10 shadow-[0_0_18px_rgba(14,165,233,0.36)]">
                        <Icon className="h-6 w-6 text-sky-300" />
                      </span>
                      <span><strong className="block text-sm text-white sm:text-base">{title}</strong><span className="text-xs text-white/70 sm:text-sm">{detail}</span></span>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...intro, delay: prefersReducedMotion ? 0 : 3.75 }} className="mt-7 flex max-w-[710px] flex-col gap-4 sm:flex-row">
                  <Button className="chargenext-network-primary h-auto min-h-[82px] flex-1 justify-start rounded-2xl px-6 py-4 text-left" onClick={onEmergencyNow}>
                    <Zap className="mr-4 h-8 w-8 shrink-0" />
                    <span><strong className="block text-sm sm:text-base">REQUEST EMERGENCY<br />CHARGE</strong></span>
                  </Button>
                  <Button variant="secondary" className="chargenext-network-secondary h-auto min-h-[82px] flex-1 justify-start rounded-2xl px-6 py-4 text-left text-white" onClick={onScheduleCharge}>
                    <Plug className="mr-4 h-8 w-8 shrink-0 text-sky-300" />
                    <span><strong className="block text-sm sm:text-base">SCHEDULE A CHARGE</strong><span className="mt-1 block font-normal text-white/65">Plan Ahead & Save</span></span>
                  </Button>
                </motion.div>

                <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...intro, delay: prefersReducedMotion ? 0 : 3.95 }} className="wa-alert-banner mt-5 max-w-[710px] rounded-xl border border-amber-300/45 bg-amber-100/92 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
                  <p className="text-xs font-semibold text-amber-950 sm:text-sm">⚠️ Emergency requests use secure Stripe checkout. Your GPS location is saved before redirecting.</p>
                </motion.div>
              </div>
            </div>

            <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...intro, delay: prefersReducedMotion ? 0 : 4.05 }} className="chargenext-network-statbar mt-3 hidden grid-cols-4 divide-x divide-sky-400/30 rounded-2xl border border-sky-500/45 bg-[#020817]/78 px-3 py-5 shadow-[0_0_34px_rgba(2,132,199,0.2)] backdrop-blur-xl lg:grid">
              {[
                { icon: Zap, title: "15–30 MIN", detail: "Average Arrival" },
                { icon: Plug, title: "LEVEL 2 POWER", detail: "Up to 25 Miles Per Hour*" },
                { icon: ShieldCheck, title: "CERTIFIED TECHS", detail: "Trained. Insured. Trusted." },
                { icon: Smartphone, title: "TEXT US ANYTIME", detail: "We’re Ready 24/7" },
              ].map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex items-center justify-center gap-4 px-5">
                  <Icon className="h-10 w-10 shrink-0 text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.75)]" />
                  <span><strong className="block text-base text-white xl:text-lg">{title}</strong><span className="text-sm text-white/65">{detail}</span></span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </Sticky>
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
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yTxt = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <Section id={id} className="bg-white">
      <div ref={ref} className="relative mx-auto max-w-6xl px-6 py-24 md:py-36">
        <div className={`grid items-center gap-10 md:grid-cols-2 ${invert ? "md:[&>*:first-child]:order-2" : ""}`}>
          <motion.div style={{ y: yTxt, opacity }}>
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-sky-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                {step}
              </span>
              <span className="uppercase tracking-wide">Step {step}</span>
            </div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {Icon ? <Icon className="h-8 w-8 text-sky-500" /> : null} {title}
            </h2>
            <p className="mt-4 text-base text-slate-600 md:text-lg">{subtitle}</p>
          </motion.div>

          <motion.div style={{ y: yImg, opacity }} className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-sky-100 to-transparent opacity-70 blur-2xl" />
            <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              {media ??
                (image ? (
                  <Image
                    src={image}
                    alt={title}
                    width={1280}
                    height={960}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                    sizes="(min-width: 1024px) 600px, (min-width: 768px) 80vw, 100vw"
                  />
                ) : null)}
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

function Features() {
  const features = [
    { icon: MapPin, title: "DMV Coverage", text: "We come to you — DC, Maryland, Virginia." },
    { icon: Smartphone, title: "Live ETA & Updates", text: "Track arrival, contact driver, update location." },
    { icon: ShieldCheck, title: "Safe & Insured", text: "Vetted techs. Secure payments. Serious about safety." },
    { icon: Plug, title: "Multiple Connectors", text: "Adapters for popular EVs and charging standards." },
  ];

  return (
    <Section id="features" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">Built for reliability</h3>
          <p className="mt-3 text-slate-600">No drama. Just power when you need it most.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="rounded-2xl shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-sky-600" />
                  <h4 className="mt-4 font-semibold text-slate-900">{feature.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
                </CardContent>
              </Card>
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
      description: "For immediate assistance",
      bullets: [
        "Dispatch within standard hours",
        "Live ETA and updates",
        "Adapter included",
      ],
      caution: null,
      isEmergency: true,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      accentColor: "text-red-600",
    },
    {
      id: "extended-boost",
      name: "Extended Boost",
      price: "$89",
      priceNote: "per session",
      description: "Extra range for longer drives",
      bullets: [
        "Up to 60 minutes charging",
        "Live tracking included",
        "Ideal for continuing your trip",
        "All connectors available",
      ],
      caution: null,
      isEmergency: false,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      accentColor: "text-orange-600",
    },
    {
      id: "full-charge-session",
      name: "Full Charge Session",
      price: "$129",
      priceNote: "per session",
      description: "Scheduled charging service",
      bullets: [
        "Up to 2–3 hours charging",
        "Best for home or work",
        "Scheduled convenience",
        "Real-time monitoring",
      ],
      caution: "⚠ Charging time depends on vehicle battery size.",
      isEmergency: false,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      accentColor: "text-blue-600",
    },
    {
      id: "pull-up-boost",
      name: "Pull-Up Boost",
      price: "Starting at $25",
      priceNote: "per session",
      description: "Quick boost while you wait",
      bullets: [
        "10–20 mile quick boost",
        "15–20 minute session",
        "Perfect for top-ups",
        "Available when our truck is nearby",
      ],
      caution: null,
      isEmergency: false,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      accentColor: "text-green-600",
    },
    {
      id: "fleet-services",
      name: "Fleet Services",
      price: "Custom Quote",
      priceNote: "Contact for details",
      description: "For multiple vehicles",
      bullets: [
        "Bulk service discounts",
        "Dedicated support",
        "Flexible scheduling",
        "Invoice billing available",
      ],
      caution: null,
      isEmergency: false,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      accentColor: "text-purple-600",
    },
  ];

  return (
    <Section id="pricing" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="mb-16 text-center">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Simple, transparent pricing
          </h3>
          <p className="mt-3 text-slate-600">Pay once dispatch is confirmed — no hidden fees.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className={`rounded-2xl h-full shadow-md transition-all hover:shadow-lg border-2 ${tier.borderColor} ${tier.bgColor}`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex-1">
                    <div className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${tier.accentColor} bg-white/60`}>
                      {tier.description}
                    </div>
                    <h4 className="mt-4 text-xl font-bold text-slate-900">{tier.name}</h4>
                    
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight text-slate-900">
                        {tier.price}
                      </span>
                      {tier.priceNote && (
                        <span className="text-sm text-slate-600">{tier.priceNote}</span>
                      )}
                    </div>
                    
                    <ul className="mt-6 space-y-3">
                      {tier.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`mt-1 rounded-full ${tier.accentColor} bg-white/70 flex-shrink-0`}>
                            <svg className="h-4 w-4 p-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {tier.caution && (
                      <p className="mt-4 text-xs text-slate-600 italic">{tier.caution}</p>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    {tier.isEmergency ? (
                      <>
                        <Button
                          onClick={onEmergencyNow}
                          className="cta-btn cta-btn--danger"
                        >
                          Emergency Charge Now
                        </Button>
                        <p className="mt-2 text-xs text-slate-600">
                          Instant checkout and driver dispatch
                        </p>
                      </>
                    ) : tier.id === "fleet-services" ? (
                      <Button
                        variant="secondary"
                        className="cta-btn cta-btn--blue w-full"
                        onClick={onRequestQuote}
                      >
                        Request Quote
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary"
                        className="cta-btn cta-btn--blue"
                        onClick={() => onServiceSelect(tier.id as ServiceId)}
                      >
                        Request {tier.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Pricing may vary depending on distance, vehicle type, battery size, and service time.
          </p>
        </div>
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
    <Section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready when you need power
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 md:text-lg">
            Get emergency EV charging fast through secure checkout, or schedule a non-emergency charge using our request form.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={onEmergencyNow}
              className="rounded-2xl px-8 py-6 text-base font-semibold"
            >
              Emergency Request
            </Button>
            <Button
              variant="secondary"
              className="rounded-2xl px-8 py-6 text-base font-semibold bg-white/10 text-white transition hover:bg-white/20"
              onClick={onScheduleCharge}
            >
              Schedule a Charge
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function CTA({ onOpenScheduling, onOpenCoverage }: { onOpenScheduling: () => void; onOpenCoverage: () => void }) {
  return (
    <Section className="bg-black text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2 md:py-36">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready when you are.</h3>
          <p className="mt-3 max-w-xl text-sm text-white/80 md:text-base">
            Book a mobile charge in under a minute. We&apos;ll meet you where you are — parking lot, roadside, or driveway.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={onOpenScheduling} className="rounded-2xl px-6 py-6 text-base">Book a Charge</Button>
            <Button
              onClick={onOpenCoverage}
              variant="secondary"
              className="rounded-2xl px-6 py-6 text-base bg-white/10 text-white transition hover:bg-white/20"
            >
              See coverage
            </Button>
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <Image
            src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1600&q=80"
            alt="EV charging at night"
            width={1280}
            height={960}
            className="h-auto w-full object-cover"
            loading="lazy"
            sizes="(min-width: 1024px) 600px, (min-width: 768px) 80vw, 100vw"
          />
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
        <div className="mt-2 w-[248px] rounded-2xl border border-blue-400/25 bg-slate-950/95 p-2.5 text-white shadow-2xl backdrop-blur-xl">
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
              className="relative inline-flex w-full items-center justify-start rounded-lg px-3 py-1.5 font-semibold text-blue-300 transition hover:bg-white/5"
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-lg border-[3px] border-blue-400/65"
                animate={{ scale: [1, 1.2, 1], opacity: [0.62, 0.2, 0.62] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.12), 0 0 22px rgba(59, 130, 246, 0.18)" }}
              />
              <span className="relative z-10">Customer Service via WhatsApp</span>
            </motion.a>
          </nav>

          <div className="mt-2 space-y-1.5 border-t border-white/15 pt-2.5">
            <Button
              onClick={() => {
                onEmergencyNow();
                closeMenu();
              }}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-400 via-blue-500 to-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Emergency
            </Button>
            <Button
              variant="secondary"
              className="h-10 w-full rounded-lg !border !border-blue-400/55 !bg-slate-950 !text-white text-sm font-semibold transition hover:!bg-slate-900 hover:!shadow-[0_0_18px_rgba(59,130,246,0.16)]"
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
    <div id="top" className="relative bg-white text-slate-900">
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

          <Button type="submit" className="w-full rounded-xl py-6 text-base">
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
