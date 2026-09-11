"use client";

import { useEffect, useState } from "react";

type DashboardQuestion = {
  id: string;
  prompt: string;
  options: Record<string, string>;
};

type ExamsResponse = {
  exams?: Array<{ questions?: DashboardQuestion[] }>;
};

export function ExamDashboardClient() {
  const [questions, setQuestions] = useState<DashboardQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      const response = await fetch("/api/exams");
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = (await response.json()) as ExamsResponse;
      const allQuestions = (data.exams ?? []).flatMap((exam) => exam.questions ?? []);
      setQuestions(allQuestions);
      setLoading(false);
    }

    loadExams();
  }, []);

  if (loading) {
    return <p className="text-slate-300">Loading exam data...</p>;
  }

  if (questions.length === 0) {
    return <p className="text-slate-300">No paid exam access found for your department yet.</p>;
  }

  return (
    <div className="mt-8 space-y-5">
      {questions.slice(0, 3).map((question, index) => (
        <div key={question.id ?? index} className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
          <p className="mb-4 text-lg font-semibold text-white">{index + 1}. {question.prompt}</p>
          <div className="grid gap-2 text-sm text-slate-300">
            {Object.entries(question.options ?? {}).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-800 p-3">
                <span className="font-medium text-blue-300">{key}.</span> {String(value)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
