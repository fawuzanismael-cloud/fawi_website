"use client";

import Link from "next/link";
import { useState } from "react";

import { NATURAL_SCIENCE_DEPARTMENTS } from "@/lib/department-data";

export default function SubscribePage() {
  const [selectedDepartment, setSelectedDepartment] = useState("STAT");
  const [selectedProvider, setSelectedProvider] = useState("CHAPA");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentCode: selectedDepartment,
        provider: selectedProvider,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Unable to start payment.");
      return;
    }

    setMessage(`Payment initiated. tx_ref: ${data.payment.txRef}`);
    window.location.href = data.payment.checkoutUrl;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Subscription</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Choose your department</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {NATURAL_SCIENCE_DEPARTMENTS.map((department) => (
          <button
            key={department.code}
            type="button"
            onClick={() => setSelectedDepartment(department.code)}
            className={`rounded-3xl border p-6 text-left transition ${
              selectedDepartment === department.code
                ? "border-blue-500 bg-blue-600/10"
                : "border-slate-700 bg-slate-900/70"
            }`}
          >
            <div className="mb-4 inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              {department.code}
            </div>
            <h2 className="text-2xl font-bold text-white">{department.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{department.description}</p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-2xl font-black text-white">ETB 299</span>
              <span className="text-xs text-slate-400">Select</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-slate-700 bg-slate-900/70 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Payment provider</label>
            <select
              value={selectedProvider}
              onChange={(event) => setSelectedProvider(event.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white"
            >
              <option value="CHAPA">Chapa</option>
              <option value="TELEBIRR">Telebirr</option>
              <option value="CBE_BIRR">CBE Birr</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-70"
            >
              {loading ? "Processing..." : `Pay ETB 299 for ${selectedDepartment}`}
            </button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-slate-200">{message}</p> : null}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400">
        Need an account? <Link href="/signup" className="font-medium text-blue-300">Create one</Link>
      </div>
    </main>
  );
}
