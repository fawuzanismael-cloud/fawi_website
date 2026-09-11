import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveDepartmentAccess } from "@/lib/payments";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedDepartmentCode = searchParams.get("departmentCode");

    let department = null as Awaited<ReturnType<typeof prisma.department.findUnique>>;

    if (requestedDepartmentCode) {
      department = await prisma.department.findUnique({
        where: { code: requestedDepartmentCode.toUpperCase() },
      });
    } else if (user.departmentId) {
      department = await prisma.department.findUnique({
        where: { id: user.departmentId },
      });
    }

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const hasAccess = await getActiveDepartmentAccess(user.id, department.id);

    if (!hasAccess && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied for this department" }, { status: 403 });
    }

    const exams = await prisma.exam.findMany({
      where: {
        departmentId: department.id,
      },
      include: {
        questions: {
          select: {
            id: true,
            prompt: true,
            options: true,
            explanation: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error("Exam fetch error:", error);
    return NextResponse.json({ error: "Unable to fetch exams" }, { status: 500 });
  }
}
