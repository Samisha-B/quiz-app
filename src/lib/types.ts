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
  outline?: string[];
  quiz?: Quiz;
  error?: string | null;
}
