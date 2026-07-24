# ChargeNext Mobile Redesign

This update keeps the existing booking, Stripe checkout, GPS, verification, scheduling, tracking, and modal logic intact while changing the customer-facing presentation.

## Updated design

- Full-width ChargeNext scanner aligned with the complete logo lockup
- Normal mobile scrolling with the old sticky/parallax-heavy hero removed
- Dark premium EV-service layout based on the supplied visual reference
- Red emergency cards and emergency buttons
- Blue scheduled-service buttons
- Yellow animated rings around customer service and service-request buttons
- Added orange, green, violet, red, and yellow accents to break up the blue
- Responsive service cards, hero image, trust bar, footer, and battery meter
- Reduced-motion support for pulsing and scrolling effects
- Stronger horizontal-overflow protection for small phones

## Main files changed

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/components/footer.tsx`
- `src/components/ui/floating-button.tsx`
- `src/components/ui/battery-meter.tsx`
- `src/components/payment-verification-modal.tsx`
- `src/components/emergency-verification-modal.tsx`

The target mockup is included at `design-reference/chargenext-mobile-target.png` for future comparison.
