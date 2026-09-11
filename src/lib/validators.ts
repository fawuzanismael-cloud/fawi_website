import { z } from "zod";

export const questionOptionSchema = z.object({
  A: z.string().min(1, "Option A is required"),
  B: z.string().min(1, "Option B is required"),
  C: z.string().min(1, "Option C is required"),
  D: z.string().min(1, "Option D is required"),
});

export const examQuestionSchema = z.object({
  question: z.string().min(10, "Question text must be at least 10 characters long"),
  options: questionOptionSchema,
  correctOptionKey: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(10, "Explanation is required"),
  imageUrl: z.string().url().optional().or(z.literal("")) .transform((value) => value || undefined),
  year: z.number().int().min(2015),
  academicYear: z.string().min(4),
  departmentCode: z.string().min(2),
});

export const bulkUploadSchema = z.object({
  departmentCode: z.string().min(2),
  academicYear: z.string().min(4),
  questions: z.array(examQuestionSchema).min(1).max(2000),
});

export async function parseUploadPayload(fileName: string, rawText: string) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".json")) {
    const parsed = JSON.parse(rawText) as unknown;
    return bulkUploadSchema.parse(parsed);
  }

  if (lowerName.endsWith(".csv")) {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one question row.");
    }

    const [headerRow, ...dataRows] = lines;
    const headers = headerRow.split(",").map((value) => value.trim());

    const questionRows = dataRows.map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const rowObject = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));

      return {
        question: rowObject.question ?? "",
        options: {
          A: rowObject.optionA ?? "",
          B: rowObject.optionB ?? "",
          C: rowObject.optionC ?? "",
          D: rowObject.optionD ?? "",
        },
        correctOptionKey: (rowObject.correctOptionKey ?? "A").toUpperCase(),
        explanation: rowObject.explanation ?? "No explanation provided",
        imageUrl: rowObject.imageUrl ?? "",
        year: Number(rowObject.year ?? new Date().getFullYear()),
        academicYear: rowObject.academicYear ?? "2025/2026",
        departmentCode: rowObject.departmentCode ?? "STAT",
      };
    });

    return bulkUploadSchema.parse({
      departmentCode: questionRows[0]?.departmentCode ?? "STAT",
      academicYear: questionRows[0]?.academicYear ?? "2025/2026",
      questions: questionRows,
    });
  }

  throw new Error("Unsupported upload type. Please provide a JSON or CSV file.");
}
