import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";
import { fetchMercadoPagoPayment, verifyMercadoPagoSignature } from "@/lib/mercadopago";
import { applyPaymentPaid } from "@/lib/payments";

// Mercado Pago calls this after a socio pays via a "Cobrar con Mercado
// Pago" link (see cobros/actions.ts createMercadoPagoLink). The
// notification body only carries an id — the actual status and amount are
// always re-fetched from Mercado Pago's own API using our access token,
// never trusted from the request body itself.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const dataId = body?.data?.id;
  if (body?.type !== "payment" || !dataId) {
    // Mercado Pago also sends non-payment notification types (merchant
    // orders, etc.) — nothing to do with those here.
    return NextResponse.json({ ok: true });
  }

  const gym = await getGymSettings();

  if (gym.mercadoPagoWebhookSecret) {
    const valid = verifyMercadoPagoSignature({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId: String(dataId),
      secret: gym.mercadoPagoWebhookSecret,
    });
    if (!valid) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  const accessToken = gym.mercadoPagoAccessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Mercado Pago no está configurado" }, { status: 500 });
  }

  const mpPayment = await fetchMercadoPagoPayment(String(dataId), accessToken);
  if (mpPayment.status !== "approved" || !mpPayment.externalReference) {
    // Pending, rejected, or a notification we don't act on yet — Mercado
    // Pago will call again if the status changes.
    return NextResponse.json({ ok: true });
  }

  const payment = await db.payment.findUnique({ where: { id: mpPayment.externalReference } });
  if (!payment) {
    // external_reference doesn't match any cobro we know about — could be
    // a stale/foreign notification, nothing to apply.
    return NextResponse.json({ ok: true });
  }

  if (payment.amount !== Math.round(mpPayment.transactionAmount)) {
    return NextResponse.json({ error: "El monto no coincide con el cobro" }, { status: 409 });
  }

  await applyPaymentPaid(payment.id, { mpPaymentId: mpPayment.id });

  return NextResponse.json({ ok: true });
}
