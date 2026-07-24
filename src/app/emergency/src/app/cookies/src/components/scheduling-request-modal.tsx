"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { CHARGENEXT_URLS } from "@/lib/constants";

type SchedulingRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultServiceType?: string;
};

type FormState = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  serviceType: string;
  fleetSize: string;
  preferredDate: string;
  preferredTime: string;
  serviceLocation: string;
  message: string;
};

const initialFormState: FormState = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  serviceType: "",
  fleetSize: "",
  preferredDate: "",
  preferredTime: "",
  serviceLocation: "",
  message: "",
};

const serviceTypeOptions = [
  "Fleet EV Charging",
  "Scheduled Charging",
  "Emergency Fleet Support",
  "Mobile Charging Event",
  "Partnership Inquiry",
  "Other",
];

export function SchedulingRequestModal({ isOpen, onClose, defaultServiceType }: SchedulingRequestModalProps) {
  const [formState, setFormState] = useState<FormState>({
    ...initialFormState,
    serviceType: defaultServiceType || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState({
      ...initialFormState,
      serviceType: defaultServiceType || "",
    });
    setSubmitStatus("idle");
    setErrorMessage("");
    setIsSubmitting(false);
  }, [defaultServiceType, isOpen]);

  const resetForm = () => {
    setFormState({
      ...initialFormState,
      serviceType: defaultServiceType || "",
    });
  };

  const handleClose = () => {
    setIsSubmitting(false);
    setSubmitStatus("idle");
    setErrorMessage("");
    resetForm();
    onClose();
  };

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formState.fullName.trim() ||
      !formState.email.trim() ||
      !formState.phone.trim() ||
      !formState.serviceType.trim() ||
      !formState.fleetSize.trim() ||
      !formState.preferredDate.trim() ||
      !formState.preferredTime.trim() ||
      !formState.serviceLocation.trim()
    ) {
      setSubmitStatus("error");
      setErrorMessage("Please complete every required field before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch(CHARGENEXT_URLS.formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: new FormData(event.currentTarget),
      });

      const payload = (await response.json().catch(() => null)) as { errors?: Array<{ message?: string }> } | null;

      if (!response.ok) {
        throw new Error(payload?.errors?.[0]?.message || "Unable to submit the request right now.");
      }

      setSubmitStatus("success");
      resetForm();
      event.currentTarget.reset();
    } catch (submitError) {
      setSubmitStatus("error");
      setErrorMessage(submitError instanceof Error ? submitError.message : "Unable to submit the request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request a Charge"
      size="large"
      layout="fixed-header-footer"
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <ModalHeader onClose={handleClose} showCloseButton={!isSubmitting}>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Request Quote / Schedule Service</h2>
            <p className="text-sm text-slate-500">Fleet and scheduled service requests go straight to Formspree.</p>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="max-h-[calc(90vh-280px)] overflow-y-auto space-y-6 pr-4">
            <p className="text-base leading-relaxed text-slate-600">
              Tell us about your fleet or scheduled charging needs and we&apos;ll follow up with a quote and availability.
            </p>

            <input type="hidden" name="request_type" value="fleet_schedule_quote" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="quote-full-name" className="mb-2 block text-sm font-semibold text-slate-900">
                  Full Name
                </label>
                <input
                  id="quote-full-name"
                  name="full_name"
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={handleChange("fullName")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label htmlFor="quote-company-name" className="mb-2 block text-sm font-semibold text-slate-900">
                  Company Name
                </label>
                <input
                  id="quote-company-name"
                  name="company_name"
                  type="text"
                  value={formState.companyName}
                  onChange={handleChange("companyName")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label htmlFor="quote-email" className="mb-2 block text-sm font-semibold text-slate-900">
                  Email
                </label>
                <input
                  id="quote-email"
                  name="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleChange("email")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label htmlFor="quote-phone" className="mb-2 block text-sm font-semibold text-slate-900">
                  Phone Number
                </label>
                <input
                  id="quote-phone"
                  name="phone"
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={handleChange("phone")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label htmlFor="quote-service-type" className="mb-2 block text-sm font-semibold text-slate-900">
                  Service Type
                </label>
                <select
                  id="quote-service-type"
                  name="service_type"
                  required
                  value={formState.serviceType}
                  onChange={handleChange("serviceType")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="" disabled>
                    Select a service type
                  </option>
                  {serviceTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quote-fleet-size" className="mb-2 block text-sm font-semibold text-slate-900">
                  Fleet Size
                </label>
                <input
                  id="quote-fleet-size"
                  name="fleet_size"
                  type="text"
                  required
                  placeholder="Example: 12 vehicles"
                  value={formState.fleetSize}
                  onChange={handleChange("fleetSize")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label htmlFor="quote-preferred-date" className="mb-2 block text-sm font-semibold text-slate-900">
                  Preferred Date
                </label>
                <input
                  id="quote-preferred-date"
                  name="preferred_date"
                  type="date"
                  required
                  value={formState.preferredDate}
                  onChange={handleChange("preferredDate")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label htmlFor="quote-preferred-time" className="mb-2 block text-sm font-semibold text-slate-900">
                  Preferred Time
                </label>
                <input
                  id="quote-preferred-time"
                  name="preferred_time"
                  type="time"
                  required
                  value={formState.preferredTime}
                  onChange={handleChange("preferredTime")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="quote-location" className="mb-2 block text-sm font-semibold text-slate-900">
                  Service Address or Location
                </label>
                <input
                  id="quote-location"
                  name="service_location"
                  type="text"
                  required
                  value={formState.serviceLocation}
                  onChange={handleChange("serviceLocation")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="quote-message" className="mb-2 block text-sm font-semibold text-slate-900">
                  Message or Service Details
                </label>
                <textarea
                  id="quote-message"
                  name="message"
                  rows={4}
                  value={formState.message}
                  onChange={handleChange("message")}
                  placeholder="Tell us about access instructions, charging cadence, special vehicle needs, or anything else we should know."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            {submitStatus === "success" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Your request was sent successfully. We&apos;ll follow up with scheduling details and a quote.
              </div>
            )}

            {submitStatus === "error" && errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                {errorMessage}
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button type="submit" disabled={isSubmitting} className="service-cta service-cta--yellow-ring cta-btn--blue w-full rounded-xl h-12 text-base font-semibold sm:flex-1">
              {isSubmitting ? "Submitting..." : "Send Request"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting} className="w-full rounded-xl h-12 text-base font-semibold sm:flex-1">
              Close
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}