import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { ExamDashboardClient } from "./exam-page";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Welcome, {user.fullName}</h1>
        <p className="mt-3 text-slate-300">Email: {user.email}</p>
        <p className="mt-1 text-slate-300">Role: {user.role}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Department</p>
            <p className="mt-2 text-2xl font-bold text-white">{user.departmentId ?? "Not assigned"}</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Exam mode</p>
            <p className="mt-2 text-2xl font-bold text-white">Timed</p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">Active</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-950 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Practice exam</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Department access and sample questions</h2>
          <ExamDashboardClient />
        </div>
      </div>
    </main>
  );
}
