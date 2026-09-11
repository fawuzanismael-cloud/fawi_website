"use client";

import { useState } from "react";

export default function AdminPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/admin/seed", { method: "POST" });
    const data = await response.json();

    setLoading(false);
    setStatus(
      response.ok
        ? `Seeded ${data.departmentsCreated} departments and ${data.examsCreated} exam containers.`
        : data.error || "Seeding failed",
    );
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setStatus("");

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file) {
      setUploading(false);
      setStatus("Please choose a file first.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { questions?: unknown[]; departmentCode?: string; academicYear?: string } | unknown[];
      const wrapped = Array.isArray(parsed) ? {} : parsed;
      const questions = Array.isArray(parsed) ? parsed : parsed.questions;

      const response = await fetch("/api/admin/exams/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentCode: formData.get("departmentCode") || wrapped.departmentCode,
          academicYear: formData.get("academicYear") || wrapped.academicYear,
          questions,
        }),
      });

      const data = await response.json();
      setStatus(
        response.ok
          ? `Upload successful. ${data.questionCount} questions added.`
          : data.error || "Upload failed",
      );
    } catch {
      setStatus("Upload failed. Use valid JSON with a questions array.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 rounded-3xl border border-slate-700 bg-slate-900/80 p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Admin</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Exam catalog control center</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Seed departments and years</h2>
          <p className="mt-2 text-sm text-slate-300">
            Initialize all natural science departments and the Ethiopian exam years from 2015 E.C. to the current year.
          </p>
          <button
            type="button"
            onClick={handleSeed}
            disabled={loading}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-70"
          >
            {loading ? "Seeding..." : "Seed catalog"}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Bulk upload</h2>
          <form onSubmit={handleUpload} className="mt-4 space-y-4">
            <input
              name="departmentCode"
              placeholder="Department code e.g. STAT"
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white"
            />
            <input
              name="academicYear"
              placeholder="Academic year e.g. 2018/2019"
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white"
            />
            <input
              type="file"
              name="file"
              accept=".json,.csv"
              className="w-full rounded-xl border border-dashed border-slate-600 bg-slate-950 px-4 py-3 text-slate-300"
            />
            <button
              type="submit"
              disabled={uploading}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-70"
            >
              {uploading ? "Uploading..." : "Upload exam file"}
            </button>
          </form>
        </section>
      </div>

      {status ? (
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
          {status}
        </div>
      ) : null}
    </main>
  );
}
