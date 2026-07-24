"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Orbitron } from "next/font/google";
import type { LucideIcon } from "lucide-react";
import {
  Zap,
  Plug,
  Car,
  MapPin,
  Smartphone,
  ShieldCheck,
  MessageCircle,
  X,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const googleMapsEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.001839478255!2d-77.0368703!3d38.9071923!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7bcdf572b1f%3A0xefbdfd5714d0c857!2sWashington%2C%20DC!5e0!3m2!1sen!2sus!4v1730590800000!5m2!1sen!2sus";

const whatsappEmergencyUrl =
  "https://wa.me/15555555555?text=Hi%20ChargeNext%2C%20I%20need%20an%20emergency%20EV%20charge.%20My%20location%20is%3A";

const formspreeAction = "https://formspree.io/f/YOUR_FORM_ID";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

const Section = ({ children, className = "" }: SectionProps) => (
  <section className={`relative w-full ${className}`}>{children}</section>
);

type StickyProps = {
  children: ReactNode;
  className?: string;
  innerClass?: string;
};

const Sticky = ({ children, className = "", innerClass = "" }: StickyProps) => (
  <div className={`sticky top-0 flex h-[100vh] items-center ${className}`}>
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

function ChargingGauge() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_45%)]" />
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Charge Status</p>
        <div className="mt-6 space-y-5">
          {[
            { label: "Battery", value: "86%", width: "86%" },
            { label: "Range", value: "+42 mi", width: "72%" },
            { label: "Ready", value: "Go", width: "100%" },
          ].map((item, index) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-white/85">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: item.width }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{ duration: 1, delay: index * 0.15 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm text-cyan-200/80">
          <Zap className="h-4 w-4" />
          <span>Stop right there — we top you up fast.</span>
        </div>
      </div>
    </div>
  );
}

function RequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 transition hover:bg-white/20"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 pr-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Non-emergency request</p>
          <h3 className="mt-2 text-2xl font-semibold">Schedule a standard charge</h3>
          <p className="mt-2 text-sm text-white/70">
            Use this form if you do not need immediate roadside help. Replace the Formspree URL with your real endpoint.
          </p>
        </div>

        <form action={formspreeAction} method="POST" className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="name"
              required
              placeholder="Full name"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
            />
            <input
              name="phone"
              required
              placeholder="Phone number"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
            />
          </div>

          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
          />

          <input
            name="location"
            placeholder="Service location"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="vehicle"
              placeholder="Vehicle / EV model"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
            />
            <input
              name="preferred_time"
              placeholder="Preferred date / time"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
            />
          </div>

          <textarea
            name="details"
            rows={4}
            placeholder="Tell us what you need"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40"
          />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" className="rounded-2xl px-6 py-6 text-base">
              Send request
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl bg-white/10 px-6 py-6 text-base text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Hero({ onOpenModal }: { onOpenModal: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <Section className="bg-black text-white">
      <div ref={ref} className="relative h-[165vh]">
        <Sticky className="bg-[radial-gradient(90%_60%_at_50%_40%,rgba(56,189,248,0.20),rgba(0,0,0,0)_70%)]">
          <motion.div
            style={{ y, opacity, scale }}
            className="mx-auto max-w-6xl px-6 text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 backdrop-blur">
              <Clock3 className="h-4 w-4 text-cyan-300" />
              <span>Emergency EV charging across the DMV</span>
            </div>

            <div className={`mb-6 overflow-hidden ${orbitron.className}`}>
              <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3">
                <motion.span
                  initial={{ x: -220, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="inline-block text-5xl font-extrabold uppercase tracking-[0.12em] text-white sm:text-7xl md:text-8xl"
                >
                  Charge
                </motion.span>
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.95] }}
                  transition={{ delay: 0.65, duration: 0.55 }}
                  className="inline-flex h-5 w-5 rounded-full bg-cyan-300 shadow-[0_0_40px_rgba(103,232,249,0.9)] sm:h-6 sm:w-6"
                />
                <motion.span
                  initial={{ x: 220, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="inline-block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-5xl font-extrabold uppercase tracking-[0.12em] text-transparent sm:text-7xl md:text-8xl"
                >
                  Next
                </motion.span>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mx-auto max-w-2xl text-lg text-white/80 md:text-xl"
            >
              When your EV is low, ChargeNext brings fast mobile power straight to your location with clear pricing and live updates.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.5 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a href={whatsappEmergencyUrl} target="_blank" rel="noreferrer">
                <Button className="rounded-2xl px-6 py-6 text-base">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Request Now
                </Button>
              </a>
              <Button
                variant="secondary"
                onClick={onOpenModal}
                className="rounded-2xl bg-white/10 px-6 py-6 text-base text-white transition hover:bg-white/20"
              >
                Schedule Non-Emergency
              </Button>
            </motion.div>
          </motion.div>
        </Sticky>
      </div>
    </Section>
  );
}

type StoryPanelProps = {
  step: number;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  image?: string;
  media?: ReactNode;
  invert?: boolean;
};

function StoryPanel({ step, title, subtitle, icon: Icon, image, media, invert }: StoryPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yTxt = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <Section className="bg-white">
      <div ref={ref} className="mx-auto max-w-6xl px-6 py-24 md:py-36">
        <div className={`grid items-center gap-10 md:grid-cols-2 ${invert ? "md:[&>*:first-child]:order-2" : ""}`}>
          <motion.div style={{ y: yTxt, opacity }}>
            <div className="mb-4 inline-flex items-center gap-2 text-sm text-sky-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                {step}
              </span>
              <span className="uppercase tracking-wide">Step {step}</span>
            </div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {Icon ? <Icon className="h-8 w-8 text-sky-500" /> : null} {title}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{subtitle}</p>
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
    { icon: MapPin, title: "DMV Coverage", text: "We come to you — DC, Maryland, and Virginia." },
    { icon: Smartphone, title: "Live ETA & Updates", text: "Track arrival, message us fast, and share your pin." },
    { icon: ShieldCheck, title: "Safe & Simple", text: "Clear steps, clean pricing, and a driver-focused experience." },
    { icon: Plug, title: "EV Ready", text: "Built for fast roadside support and standard scheduled visits." },
  ];

  return (
    <Section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Built for reliability</h3>
          <p className="mt-3 text-slate-600">No confusion. Just power when you need it most.</p>
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

function Pricing({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
        <div className="mb-10 text-center">
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Simple, transparent pricing
          </h3>
          <p className="mt-3 text-slate-600">Emergency dispatch starts fast. Scheduled visits stay easy.</p>
        </div>
        <div className="flex justify-center">
          <Card className="max-w-lg rounded-3xl border-slate-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <Plug className="mx-auto h-8 w-8 text-sky-600" />
              <h4 className="mt-4 font-semibold text-slate-900">Emergency Charge — Flat</h4>
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold tracking-tight">$149</span>
                <span className="text-slate-500">+ per-mile after 15mi</span>
              </div>
              <ul className="mt-6 space-y-2 text-left text-sm text-slate-600">
                <li>• Fast dispatch during standard hours</li>
                <li>• WhatsApp emergency contact</li>
                <li>• Clear updates and simple next steps</li>
              </ul>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={whatsappEmergencyUrl} target="_blank" rel="noreferrer">
                  <Button className="rounded-xl py-5">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Request Now
                  </Button>
                </a>
                <Button variant="secondary" onClick={onOpenModal} className="rounded-xl py-5">
                  Schedule Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}

function CTA({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <Section className="bg-black text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2 md:py-36">
        <div>
          <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">Ready when you are.</h3>
          <p className="mt-3 max-w-xl text-white/80">
            For emergencies, hit WhatsApp and send your location. For standard service, use the quick request form.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappEmergencyUrl} target="_blank" rel="noreferrer">
              <Button className="rounded-2xl px-6 py-6 text-base">
                <MessageCircle className="mr-2 h-4 w-4" />
                Emergency Request
              </Button>
            </a>
            <Button
              variant="secondary"
              onClick={onOpenModal}
              className="rounded-2xl bg-white/10 px-6 py-6 text-base text-white transition hover:bg-white/20"
            >
              Schedule a Visit
            </Button>
          </div>
        </div>
        <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
          <Image
            src="https://images.unsplash.com/photo-1593941707882-a5bac6861d75?auto=format&fit=crop&w=1600&q=80"
            alt="Electric vehicle charging"
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

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-white text-slate-900">
      <ProgressBar />
      <RequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <Hero onOpenModal={() => setModalOpen(true)} />
      <StoryPanel
        step={1}
        title="We find you fast"
        subtitle="Drop your location, tell us your EV, and ChargeNext locks in the next move fast."
        icon={MapPin}
        media={
          <iframe
            src={googleMapsEmbedUrl}
            title="Washington DC coverage map"
            className="h-[320px] w-full border-0 md:h-[420px]"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        }
      />
      <StoryPanel
        step={2}
        title="We connect the charge"
        subtitle="We arrive, verify safety, and connect the right setup so you can get power without the runaround."
        icon={Plug}
        image="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80"
        invert
      />
      <StoryPanel
        step={3}
        title="Stop right there — power up and go"
        subtitle="Watch the charge climb, grab enough range to reach your next stop, and get moving again."
        icon={Car}
        media={<ChargingGauge />}
      />
      <Features />
      <Pricing onOpenModal={() => setModalOpen(true)} />
      <CTA onOpenModal={() => setModalOpen(true)} />
    </div>
  );
}
