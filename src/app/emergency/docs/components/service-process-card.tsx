"use client";

type ServiceProcessCardProps = {
  title: string;
  intro: string;
};

const defaultSteps = [
  "Confirm your emergency location",
  "Continue to secure Stripe payment",
  "Return to ChargeNext after payment",
  "Verify your phone number with SMS code",
  "Location and job information are sent to the provider",
  "Track the provider and job status in the customer dashboard",
];

export function ServiceProcessCard({ title, intro }: ServiceProcessCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <p className="mb-3 text-sm leading-relaxed text-slate-600">{intro}</p>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">{title}</h3>

      <ol className="space-y-3">
        {defaultSteps.map((step, index) => (
          <li key={step} className="flex gap-4">
            <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
              {index + 1}
            </span>
            <span className="pt-1 text-sm text-slate-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}