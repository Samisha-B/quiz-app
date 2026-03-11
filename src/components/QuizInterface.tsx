// src/components/QuizInterface.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QuizForm from "./QuizForm";
import Question from "./Question";
import Results from "./Results";
import ProgressBar from "./ProgressBar";
import { Quiz } from "@/lib/types";
import { AlertCircle, Sparkles } from "lucide-react";

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function QuizInterface() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null); // NEW
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);

  const handleGenerateQuiz = async (
    topic: string,
    numQuestions: number,
    difficulty: string
  ) => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setShowResults(false);
    setShowConfetti(false);
    setScore(0);
    setCurrentQuestion(0);
    setQuizId(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, numQuestions, difficulty }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate quiz");

      setQuiz(data.quiz);
      setQuizId(data.quizId || null); // NEW
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const submitResults = async (
    quizId: string,
    finalScore: number,
    totalQuestions: number
  ) => {
    try {
      await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore, totalQuestions }),
      });
      // optional: handle response
    } catch (e) {
      console.error("Failed to submit results", e);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (!quiz) return;

      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // quiz finished
        const finalScore = score + (correct ? 1 : 0);
        setShowResults(true);

        if (quizId) {
          submitResults(quizId, finalScore, quiz.questions.length);
        }

        if (finalScore / quiz.questions.length >= 0.8) {
          setShowConfetti(true);
          triggerConfetti();
        }
      }
    }, 1500);
  };

  const handleRestart = () => {
    setQuiz(null);
    setQuizId(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setError(null);
    setShowConfetti(false);

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };

  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size safely (guard window for SSR)
    const width = typeof window !== "undefined" ? window.innerWidth : 800;
    const height = typeof window !== "undefined" ? window.innerHeight : 600;
    canvas.width = width;
    canvas.height = height;

    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -200,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 5,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        size: Math.random() * 6 + 3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.99;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y > canvas.height) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const progress = quiz ? (currentQuestion / quiz.questions.length) * 100 : 0;

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-50 ${
          showConfetti ? "" : "hidden"
        }`}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-float">
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl mb-4">
            <Sparkles className="w-8 h-8 text-purple-500 animate-pulse-slow" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              🎯 AI Quiz Master
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate & conquer custom quizzes powered by AI
          </p>
        </div>

        {error && (
          <div className="glass-card mb-8 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Oops!</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!quiz && !showResults && (
          <div className="glass-card max-w-2xl mx-auto">
            <QuizForm onSubmit={handleGenerateQuiz} loading={loading} />
          </div>
        )}

        {quiz && !showResults && (
          <div className="space-y-8">
            <div className="glass-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-600 text-lg">{quiz.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ProgressBar
                    progress={progress}
                    label={`Question ${currentQuestion + 1} of ${
                      quiz.questions.length
                    }`}
                  />
                  <div className="text-2xl font-bold text-blue-600">
                    Score: {score}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <Question
                question={quiz.questions[currentQuestion]}
                questionNumber={currentQuestion + 1}
                onAnswer={handleAnswer}
              />
            </div>
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
