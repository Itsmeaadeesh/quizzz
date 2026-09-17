export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizConfig {
  questionType: QuestionType;
  numQuestions: number;
  difficulty: Difficulty;
}

export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  difficulty: Difficulty;
  key_takeaway?: string;
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceType: string;
  config: QuizConfig;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface UserAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id?: string;
  quizId: string;
  userId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: UserAnswer[];
  timeTakenSeconds: number;
  completedAt: string;
}

export interface ExtractedDocument {
  sourceName: string;
  sourceType: 'pdf' | 'docx' | 'pptx' | 'text';
  wordCount: number;
  preview: string;
  fullText: string;
}
