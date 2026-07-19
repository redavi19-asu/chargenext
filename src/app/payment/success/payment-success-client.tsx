"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmergencyVerificationModal } from "@/components/emergency-verification-modal";
import { verifyEmergencyCheckoutSession } from "@/lib/emergency-api";
import {
  readCheckoutSessionId,
  readEmergencyCheckoutDraft,
  saveCheckoutSessionId,
  saveDetectedEmergencyLocation,
  type EmergencyLocation,
  type EmergencyVerificationRecord,
} from "@/lib/emergency-flow";

export default function PaymentSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [requestTimestamp, setRequestTimestamp] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [paymentLocation, setPaymentLocation] = useState<EmergencyLocation | null>(null);

  useEffect(() => {
    const sessionIdFromUrl = searchParams.get("session_id") || searchParams.get("checkout_session_id");
    const savedSessionId = readCheckoutSessionId();
    const sessionId = sessionIdFromUrl || savedSessionId;
    const savedDraft = readEmergencyCheckoutDraft();

    if (savedDraft?.location) {
      setPaymentLocation(savedDraft.location);
    }

    if (!sessionId) {
      setError("Stripe did not return a checkout session id. Please contact support if payment completed.");
      setIsLoading(false);
      return;
    }

    saveCheckoutSessionId(sessionId);

    let isMounted = true;

    const loadVerification = async () => {
      try {
        const response = await verifyEmergencyCheckoutSession(sessionId);

        if (!response.verified) {
          throw new Error("The Stripe checkout session could not be verified.");
        }

        if (!isMounted) {
          return;
        }

        setStripeSessionId(response.stripeSessionId || sessionId);
        setPaymentStatus(response.paymentStatus || "paid");
        setRequestTimestamp(response.requestTimestamp || new Date().toISOString());
        setPaymentLocation(response.location || savedDraft?.location || null);
        setIsVerified(true);

        if (response.location) {
          saveDetectedEmergencyLocation(response.location);
        }
      } catch (verificationError) {
        if (!isMounted) {
          return;
        }

        setError(verificationError instanceof Error ? verificationError.message : "Unable to verify payment.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVerification();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleVerified = (record: EmergencyVerificationRecord) => {
    const nextRequestId = record.requestId || record.stripeSessionId;
    router.replace(`/emergency/status?requestId=${encodeURIComponent(nextRequestId)}`);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_40%),linear-gradient(180deg,_#08111f,_#0f172a_48%,_#f8fafc_48%,_#f8fafc_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl pt-8">
        <Card className="border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sky-100 p-3 text-sky-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">ChargeNext Emergency</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment verification in progress</h1>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                Verifying your Stripe Checkout session on the backend...
              </div>
            ) : null}

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                <div>
                  <p className="font-semibold">Payment could not be verified</p>
                  <p className="mt-1 leading-6">{error}</p>
                </div>
              </div>
            ) : null}

            {!isLoading && !error && !isVerified ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                We found your checkout session, but the payment could not be confirmed yet.
              </div>
            ) : null}

            {isVerified ? (
              <EmergencyVerificationModal
                isOpen
                stripeSessionId={stripeSessionId}
                requestTimestamp={requestTimestamp}
                initialLocation={paymentLocation}
                paymentStatus={paymentStatus}
                onClose={() => router.push("/")}
                onVerified={handleVerified}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}