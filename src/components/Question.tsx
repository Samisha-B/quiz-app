"use client";

import { useState } from "react";
import { QuizQuestion as QuizQuestionType } from "@/lib/types";
import { Check, X } from "lucide-react";

interface QuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  onAnswer: (correct: boolean) => void;
}

export default function Question({
  question,
  questionNumber,
  onAnswer,
}: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;

    setSelectedOption(index);
    setShowExplanation(true);
    onAnswer(index === question.correctAnswer);
  };

  return (
    <div className="glass-card">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 font-bold rounded-full text-sm mb-4">
          Question {questionNumber}
        </span>
        <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
          {question.question}
        </h3>
      </div>

      <div className="space-y-4 mb-8">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === question.correctAnswer;
          const showResult = selectedOption !== null;

          let buttonClass = "w-full text-left p-6 md:p-8 rounded-3xl border-2 transition-all duration-500 ease-out option-hover relative overflow-hidden group shadow-xl";

          if (!showResult) {
            buttonClass += " glass border-white/30 hover:border-blue-300 hover:shadow-2xl hover:from-blue-500/10 hover:to-purple-500/10 hover:shadow-blue-200 hover:scale-[1.02]";
          } else if (isCorrect) {
            buttonClass += " border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-green-300 shadow-2xl scale-105";
          } else if (isSelected) {
            buttonClass += " border-red-400 bg-gradient-to-r from-red-50 to-rose-50 shadow-red-300 shadow-2xl scale-[0.98]";
          } else {
            buttonClass += " border-white/20 opacity-60 hover:opacity-80";
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={selectedOption !== null}
              className={`${buttonClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between relative z-10">
                <span className="font-bold text-lg group-hover:text-gray-800">{option}</span>
                {showResult && isCorrect && (
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-green-200">
                    <Check className="w-7 h-7 text-green-600" />
                    <span className="font-bold text-green-700 text-sm hidden md:inline">Correct</span>
                  </div>
                )}
                {showResult && isSelected && !isCorrect && (
                  <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-2xl backdrop-blur-sm border border-red-200">
                    <X className="w-7 h-7 text-red-600" />
                    <span className="font-bold text-red-700 text-sm hidden md:inline">Wrong</span>
                  </div>
                )}
              </div>
              
              {/* Shimmer overlay for unselected options */}
              {!showResult && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 animate-shimmer" />
              )}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="glass p-8 rounded-2xl border-l-4 border-blue-400 shadow-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
            <p className="text-lg font-bold text-blue-800 mb-2">Detailed Explanation:</p>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
