import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTransactionReference, EXAM_PRICE_ETB } from "@/lib/payments";

const initiateSchema = z.object({
  departmentCode: z.string().min(2),
  provider: z.enum(["CHAPA", "TELEBIRR", "CBE_BIRR"]),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = initiateSchema.parse(await request.json());
    const department = await prisma.department.findUnique({
      where: { code: body.departmentCode.toUpperCase() },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const txRef = createTransactionReference("FAWI");
    const payment = await prisma.paymentRecord.create({
      data: {
        userId: user.id,
        departmentId: department.id,
        txRef,
        amount: EXAM_PRICE_ETB,
        currency: "ETB",
        provider: body.provider,
        status: "PENDING",
        rawPayload: {
          departmentCode: department.code,
          userId: user.id,
          provider: body.provider,
        },
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        txRef,
        amount: EXAM_PRICE_ETB,
        currency: "ETB",
        provider: body.provider,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/subscribe?tx_ref=${txRef}`,
      },
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initiation failed" },
      { status: 400 },
    );
  }
}
