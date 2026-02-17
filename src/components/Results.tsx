// src/components/Results.tsx

"use client";

import { Trophy, RotateCcw } from "lucide-react";

interface ResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export default function Results({
  score,
  totalQuestions,
  onRestart,
}: ResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" };
    if (percentage >= 80) return { grade: "A", color: "text-green-500" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-600" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const { grade, color } = getGrade();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Quiz Complete!
        </h2>
        <p className="text-gray-600">
          Here&apos;s how you performed
        </p>
      </div>

      <div className="mb-8">
        <div className={`text-6xl font-bold ${color} mb-2`}>{grade}</div>
        <div className="text-2xl font-semibold text-gray-700 mb-1">
          {score} / {totalQuestions}
        </div>
        <div className="text-lg text-gray-600">{percentage}% Correct</div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onRestart}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}
