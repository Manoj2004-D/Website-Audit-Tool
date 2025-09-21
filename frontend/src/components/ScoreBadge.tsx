// src/components/ScoreBadge.tsx
import React from "react";

type Props = {
  label: string;
  score: number | null | undefined;
};

export default function ScoreBadge({ label, score }: Props) {
  if (score == null) return null;

  let color =
    score >= 90
      ? "bg-green-600"
      : score >= 50
      ? "bg-yellow-500"
      : "bg-red-600";

  return (
    <div className="flex flex-col items-center bg-white/5 px-4 py-3 rounded-lg shadow">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`text-2xl font-bold ${color} bg-opacity-20 px-3 py-1 rounded`}
      >
        {score}
      </span>
    </div>
  );
}
