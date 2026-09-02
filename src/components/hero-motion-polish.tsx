"use client";

import { useEffect } from "react";

/**
 * Small runtime polish layer for the ChargeNext hero.
 *
 * Framer Motion still owns the visual animation. This component only nudges the
 * scanner's browser animation playback rate when the browser exposes it through
 * the Web Animations API. Browsers that do not expose the animation simply keep
 * the normal motion with no errors or layout changes.
 */
export function HeroMotionPolish() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tuneScanner = () => {
      const hero = document.querySelector<HTMLElement>(".chargenext-network-hero");
      if (!hero) return;

      const scanner = Array.from(hero.querySelectorAll<HTMLElement>("div")).find((element) =>
        element.className.includes("w-[18%]")
      );

      if (!scanner) return;

      scanner.style.willChange = "transform";
      scanner.getAnimations().forEach((animation) => {
        try {
          if (animation.playbackRate > 0 && animation.playbackRate < 1.3) {
            animation.updatePlaybackRate(1.3);
          }
        } catch {
          // Keep the original Framer Motion animation if the browser does not
          // allow playback-rate changes for this animation implementation.
        }
      });
    };

    const raf = window.requestAnimationFrame(tuneScanner);
    const timerOne = window.setTimeout(tuneScanner, 120);
    const timerTwo = window.setTimeout(tuneScanner, 700);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timerOne);
      window.clearTimeout(timerTwo);
    };
  }, []);

  return null;
}
