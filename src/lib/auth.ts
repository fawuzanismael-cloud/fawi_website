import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { verifySessionToken, createSessionToken } from "@/lib/security";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "STUDENT" | "ADMIN";
  departmentId: string | null;
};

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const payload = await verifySessionToken(sessionCookie);
    const userId = typeof payload.userId === "string" ? payload.userId : null;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        departmentId: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(role: SessionUser["role"]) {
  const user = await requireUser();
  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
