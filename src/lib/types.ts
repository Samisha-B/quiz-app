// src/lib/types.ts

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizInput {
  topic: string;
  numQuestions: number;
  difficulty: string;
}
