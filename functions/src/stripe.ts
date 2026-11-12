import { onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-10-28" as any,
});

export const createCheckoutSession = onRequest(
  {
    cors: true,
    invoker: "public",
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req: any, res: any) => {
    try {
      const { priceId, tenantId, successUrl, cancelUrl } = req.body || {};

      if (!priceId) {
        res.status(400).json({ error: "priceId is required" });
        return;
      }

      const session = await stripe.checkout.sessions.create({
        // @ts-ignore
payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: successUrl || "",
        cancel_url: cancelUrl || "",
        metadata: {
          tenantId: tenantId || "",
        },
        subscription_data: {
          metadata: {
            tenantId: tenantId || "",
          },
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);
