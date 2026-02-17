// src/lib/types.ts - NO CHANGES NEEDED, JUST VERIFY
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

export interface QuizState {
  topic: string;
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  quiz: Quiz | null;
  error: string | null;
}

export interface QuizGenerationRequest {
  topic: string;
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
