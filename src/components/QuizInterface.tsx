// src/components/QuizInterface.tsx

"use client";

import { useState } from "react";
import QuizForm from "./QuizForm";
import Question from "./Question";
import Results from "./Results";
import { Quiz } from "@/lib/types";
import { AlertCircle } from "lucide-react";

export default function QuizInterface() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateQuiz = async (
    topic: string,
    numQuestions: number,
    difficulty: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, numQuestions, difficulty }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setQuiz(data.quiz);
      setCurrentQuestion(0);
      setScore(0);
      setShowResults(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore(score + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (quiz && currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            🎯 AI Quiz Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Generate custom quizzes on any topic with AI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!quiz && !showResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <QuizForm onSubmit={handleGenerateQuiz} loading={loading} />
          </div>
        )}

        {quiz && !showResults && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{quiz.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentQuestion + 1}/{quiz.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Score: {score}</div>
                </div>
              </div>
            </div>

            <Question
              question={quiz.questions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              onAnswer={handleAnswer}
            />
          </div>
        )}

        {showResults && quiz && (
          <Results
            score={score}
            totalQuestions={quiz.questions.length}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
