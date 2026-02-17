// src/components/QuizForm.tsx

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface QuizFormProps {
  onSubmit: (topic: string, numQuestions: number, difficulty: string) => void;
  loading: boolean;
}

export default function QuizForm({ onSubmit, loading }: QuizFormProps) {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic, numQuestions, difficulty);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="topic"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Quiz Topic
        </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Machine Learning, Ancient Rome, React Hooks"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="numQuestions"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Number of Questions: {numQuestions}
        </label>
        <input
          type="range"
          id="numQuestions"
          min="3"
          max="15"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={loading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>3</span>
          <span>15</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`py-2 px-4 rounded-lg font-medium transition ${
                difficulty === level
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          "Generate Quiz"
        )}
      </button>
    </form>
  );
}
