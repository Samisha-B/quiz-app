// src/components/QuizQuestion.tsx

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
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <span className="text-sm font-semibold text-blue-600 mb-2 block">
          Question {questionNumber}
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">
          {question.question}
        </h3>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === question.correctAnswer;
          const showResult = selectedOption !== null;

          let buttonClass =
            "w-full text-left p-4 rounded-lg border-2 transition-all ";

          if (!showResult) {
            buttonClass +=
              "border-gray-200 hover:border-blue-400 hover:bg-blue-50";
          } else if (isCorrect) {
            buttonClass += "border-green-500 bg-green-50";
          } else if (isSelected) {
            buttonClass += "border-red-500 bg-red-50";
          } else {
            buttonClass += "border-gray-200 opacity-50";
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={selectedOption !== null}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showResult && isCorrect && (
                  <Check className="w-6 h-6 text-green-600" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <X className="w-6 h-6 text-red-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            Explanation:
          </p>
          <p className="text-gray-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
