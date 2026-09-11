import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveDepartmentAccess } from "@/lib/payments";

const submitSchema = z.object({
  examId: z.string().min(1),
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"])),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = submitSchema.parse(await request.json());
    const exam = await prisma.exam.findUnique({
      where: { id: body.examId },
      include: { questions: true },
    });

    if (!exam || exam.status !== "ACTIVE") {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const hasAccess = await getActiveDepartmentAccess(user.id, exam.departmentId);
    if (!hasAccess && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const score = exam.questions.reduce(
      (total: number, question: { id: string; correctOptionKey: string }) =>
        total + (body.answers[question.id] === question.correctOptionKey ? 1 : 0),
      0,
    );

    const attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        score,
        totalQuestions: exam.questions.length,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      totalQuestions: exam.questions.length,
      review: exam.questions.map((question: {
        id: string;
        prompt: string;
        correctOptionKey: string;
        explanation: string | null;
      }) => ({
        id: question.id,
        prompt: question.prompt,
        selectedAnswer: body.answers[question.id] ?? null,
        correctAnswer: question.correctOptionKey,
        explanation: question.explanation,
      })),
    });
  } catch (error) {
    console.error("Exam submission error:", error);
    return NextResponse.json({ error: "Unable to submit exam" }, { status: 400 });
  }
}