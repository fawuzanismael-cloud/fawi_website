import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-chapa-signature") ?? request.headers.get("x-telebirr-signature");
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 503 });
    }

    if (!verifyWebhookSignature(signature, rawBody, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as {
      tx_ref?: string;
      status?: string;
      amount?: number | string;
      currency?: string;
      provider?: string;
      departmentCode?: string;
      userId?: string;
    };

    if (!body.tx_ref) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    const payment = await prisma.paymentRecord.findUnique({
      where: { txRef: body.tx_ref },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (!payment.userId || !payment.departmentId) {
      return NextResponse.json({ error: "Payment is missing subscription ownership" }, { status: 400 });
    }

    const userId = payment.userId;
    const departmentId = payment.departmentId;

    const isPaid = body.status === "success" || body.status === "paid" || body.status === "completed";

    if (isPaid) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.paymentRecord.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            rawPayload: body,
          },
        });

        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

        await tx.subscription.upsert({
          where: {
            id: (await tx.subscription.findFirst({
              where: {
                userId,
                departmentId,
                status: "ACTIVE",
              },
              select: { id: true },
            }))?.id ?? "__missing__",
          },
          create: {
            userId,
            departmentId,
            status: "ACTIVE",
            expiresAt,
            txRef: payment.txRef,
            paymentProvider: payment.provider,
          },
          update: {
            status: "ACTIVE",
            expiresAt,
            txRef: payment.txRef,
            paymentProvider: payment.provider,
          },
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
