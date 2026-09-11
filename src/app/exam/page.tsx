"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Question = {
  id: string;
  prompt: string;
  options: Record<string, string>;
  explanation?: string | null;
};

type ExamsResponse = {
  exams?: Array<{ id: string; questions?: Question[] }>;
};

type ExamResult = {
  score: number;
  totalQuestions: number;
  review: Array<{
    id: string;
    prompt: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    explanation?: string | null;
  }>;
};

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showResults, setShowResults] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      const response = await fetch("/api/exams");
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as ExamsResponse;
      const firstExam = data.exams?.[0];
      setExamId(firstExam?.id ?? null);
      const allQuestions = firstExam?.questions ?? [];
      setQuestions(allQuestions.slice(0, 5));
    }

    loadQuestions();
  }, []);

  const submitExam = useCallback(async () => {
    if (!examId || submitting || showResults) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/exams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, answers: selectedAnswers }),
      });
      const data = (await response.json()) as ExamResult;
      if (!response.ok) throw new Error("Submission failed");
      setResult(data);
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  }, [examId, selectedAnswers, showResults, submitting]);

  useEffect(() => {
    if (showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          void submitExam();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, submitExam]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  function chooseOption(optionKey: string) {
    if (!currentQuestion) return;
    setSelectedAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionKey,
    }));
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    } else {
      void submitExam();
    }
  }

  if (!currentQuestion && !showResults) {
    return <div className="p-10 text-slate-300">Loading exam questions...</div>;
  }

  if (showResults) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">Score: {result?.score ?? 0} / {result?.totalQuestions ?? questions.length}</p>
            <p className="mt-3 text-slate-300">Time remaining: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>
            <div className="mt-6 space-y-4">
              {(result?.review ?? []).map((review, index) => {
                const isCorrect = review.selectedAnswer === review.correctAnswer;

                return (
                  <div key={review.id} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <p className="font-semibold text-white">{index + 1}. {review.prompt}</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Your answer: <span className={isCorrect ? "text-emerald-400" : "text-red-400"}>{review.selectedAnswer ?? "No answer"}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-400">Explanation: {review.explanation ?? "No explanation provided."}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Practice exam</p>
            <CardTitle>Question {currentIndex + 1} of {questions.length}</CardTitle>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-xl font-semibold text-white">{currentQuestion.prompt}</p>
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const selected = selectedAnswers[currentQuestion.id] === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => chooseOption(key)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-white"
                      : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  <span className="mr-2 font-bold text-blue-300">{key}.</span>
                  {String(value)}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-400">Answered: {answeredCount}</p>
            <Button onClick={nextQuestion}>
              {currentIndex === questions.length - 1 ? "Finish exam" : "Next question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
