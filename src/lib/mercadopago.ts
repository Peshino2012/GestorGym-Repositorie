import crypto from "node:crypto";

const API = "https://api.mercadopago.com";

export type MpPreference = { id: string; initPoint: string };

// Creates a one-off payment link ("Checkout Pro") for a single cobro. The
// socio opens initPoint, pays with their own card/saldo/QR, and Mercado
// Pago calls notificationUrl once it's done — this never touches the
// socio's payment details directly, it just asks MP for a link.
export async function createPaymentPreference(params: {
  accessToken: string;
  externalReference: string;
  title: string;
  amount: number;
  notificationUrl: string;
  backUrl: string;
}): Promise<MpPreference> {
  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: params.title,
          quantity: 1,
          unit_price: params.amount,
          currency_id: "ARS",
        },
      ],
      external_reference: params.externalReference,
      notification_url: params.notificationUrl,
      back_urls: {
        success: params.backUrl,
        pending: params.backUrl,
        failure: params.backUrl,
      },
      auto_return: "approved",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mercado Pago rechazó la solicitud (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { id: data.id, initPoint: data.init_point };
}

export type MpPayment = {
  id: string;
  status: string;
  externalReference: string | null;
  transactionAmount: number;
};

// Never trust a webhook notification's own body for the actual payment
// status or amount — it only carries an id. This fetches the real record
// straight from Mercado Pago using our own access token, which is the
// part that can't be forged: an attacker would need a payment id that
// resolves, through OUR credential, to a real payment on OUR account.
export async function fetchMercadoPagoPayment(id: string, accessToken: string): Promise<MpPayment> {
  const res = await fetch(`${API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`No se pudo confirmar el pago ${id} con Mercado Pago (${res.status}): ${body}`);
  }
  const data = await res.json();
  return {
    id: String(data.id),
    status: data.status,
    externalReference: data.external_reference ?? null,
    transactionAmount: data.transaction_amount,
  };
}

// Mercado Pago signs each webhook call with an HMAC over a fixed manifest
// string, using the secret shown in that app's own webhook settings.
// Verifying it means the request really came from Mercado Pago and wasn't
// forged by a third party who merely knows our notification URL — see
// https://www.mercadopago.com.ar/developers/en/docs/checkout-api/webhooks
export function verifyMercadoPagoSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
  secret: string;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
