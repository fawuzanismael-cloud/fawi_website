import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildEthiopianExamYears, DEPARTMENT_CATALOG } from "@/lib/seed-data";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const createdDepartments = [] as Array<{ code: string; id: string }>;

    for (const department of DEPARTMENT_CATALOG) {
      const record = await prisma.department.upsert({
        where: { code: department.code },
        update: {
          name: department.name,
          shortName: department.shortName,
          description: department.description,
          active: true,
        },
        create: {
          code: department.code,
          name: department.name,
          shortName: department.shortName,
          description: department.description,
          active: true,
        },
      });

      createdDepartments.push({ code: record.code, id: record.id });
    }

    let examCount = 0;
    const academicYears = buildEthiopianExamYears();

    for (const department of createdDepartments) {
      for (const academicYear of academicYears) {
        const examExists = await prisma.exam.findFirst({
          where: {
            departmentId: department.id,
            academicYear,
          },
        });

        if (!examExists) {
          await prisma.exam.create({
            data: {
              departmentId: department.id,
              academicYear,
              year: Number(academicYear.split("/")[0]),
              title: `${department.code} ${academicYear} Exam Bank`,
              description: `Seeded exam record for ${department.code} in academic year ${academicYear}`,
            },
          });
          examCount += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      departmentsCreated: createdDepartments.length,
      examsCreated: examCount,
      academicYears: academicYears.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed exam catalog" }, { status: 500 });
  }
}
