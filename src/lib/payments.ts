import { prisma } from "@/lib/db";

export const EXAM_PRICE_ETB = 299;

export function createTransactionReference(prefix = "FAWI") {
  const randomSuffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${Date.now()}-${randomSuffix}`;
}

export async function getActiveDepartmentAccess(userId: string, departmentId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      departmentId,
      status: "ACTIVE",
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscription;
}
