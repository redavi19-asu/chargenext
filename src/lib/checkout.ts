import { createEmergencyCheckoutSession } from "@/lib/emergency-api";
import { readEmergencyCheckoutDraft, saveCheckoutSessionId } from "@/lib/emergency-flow";

export async function startEmergencyCharge() {
  try {
    const draft = readEmergencyCheckoutDraft();
    const successUrl = new URL("payment/success", window.location.href.endsWith("/") ? window.location.href : `${window.location.href}/`).toString();
    const cancelUrl = window.location.href;

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
