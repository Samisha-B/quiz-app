// src/app/stats/page.tsx

"use client";

import { useEffect, useState } from "react";

interface Attempt {
  id: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
  quiz: {
    title: string;
  };
}

interface StatsResponse {
  totalAttempts: number;
  avgScore: number;
  attempts: Attempt[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load stats");
        }
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Stats</h1>
        <p className="text-gray-600 mb-6">
          Overview of your quiz performance.
        </p>

        <div className="flex gap-6 mb-6">
          <div className="flex-1 bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Attempts</p>
            <p className="text-2xl font-bold text-blue-700">
              {data.totalAttempts}
            </p>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-2xl font-bold text-green-700">
              {data.avgScore}%
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Recent Attempts
        </h2>
        <div className="space-y-2">
          {data.attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {attempt.quiz.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(attempt.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {attempt.score} / {attempt.totalQuestions}
                </p>
                <p className="text-xs text-gray-600">
                  {Math.round(
                    (attempt.score / attempt.totalQuestions) * 100
                  )}
                  % correct
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
