import { createEmergencyCheckoutSession } from "@/lib/emergency-api";
import { readEmergencyCheckoutDraft, saveCheckoutSessionId } from "@/lib/emergency-flow";

export async function startEmergencyCharge() {
  try {
    const draft = readEmergencyCheckoutDraft();
    const currentUrl = new URL(window.location.href);
    const successUrl = `${currentUrl.origin}${currentUrl.pathname}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${currentUrl.origin}${currentUrl.pathname}`;

    const data = await createEmergencyCheckoutSession({
      successUrl,
      cancelUrl,
      location: draft?.location ?? null,
      tier: "Emergency Boost",
    });

    if (data.session_id || data.id) {
      saveCheckoutSessionId(String(data.session_id || data.id));
    }

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Error starting emergency charge:", error);
  }
}
