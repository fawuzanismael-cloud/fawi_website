import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (existingAdmin) {
      await requireRole("ADMIN");
    } else {
      const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
      const providedSecret = request.headers.get("x-admin-bootstrap-secret");

      if (!bootstrapSecret || providedSecret !== bootstrapSecret) {
        return NextResponse.json({ error: "Bootstrap secret required" }, { status: 401 });
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Admin environment variables are not configured" }, { status: 500 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Admin already exists",
      });
    }

    const user = await prisma.user.create({
      data: {
        fullName: "System Administrator",
        email: adminEmail.toLowerCase(),
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error && error.message === "FORBIDDEN" ? "Forbidden" : "Unable to create admin" },
      { status: error instanceof Error && error.message === "FORBIDDEN" ? 403 : 500 },
    );
  }
}
