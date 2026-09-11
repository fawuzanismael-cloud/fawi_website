import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bulkUploadSchema, parseUploadPayload } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    const rawText = await request.text();

    if (!rawText) {
      return NextResponse.json({ error: "No payload received" }, { status: 400 });
    }

    const parsedPayload = contentType.includes("application/json")
      ? bulkUploadSchema.parse(JSON.parse(rawText))
      : await parseUploadPayload("upload.csv", rawText);

    const department = await prisma.department.findUnique({
      where: { code: parsedPayload.departmentCode.toUpperCase() },
    });

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    const exam = await prisma.exam.create({
      data: {
        departmentId: department.id,
        academicYear: parsedPayload.academicYear,
        year: Number(parsedPayload.academicYear.split("/")[0] || new Date().getFullYear()),
        title: `${department.name} ${parsedPayload.academicYear} Exam Bank`,
        description: `Bulk uploaded exam set for ${department.name}`,
        questions: {
          create: parsedPayload.questions.map((question) => ({
            prompt: question.question,
            options: question.options,
            correctOptionKey: question.correctOptionKey,
            explanation: question.explanation,
            imageUrl: question.imageUrl ?? null,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      success: true,
      examId: exam.id,
      questionCount: exam.questions.length,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk upload failed" },
      { status: 400 },
    );
  }
}
