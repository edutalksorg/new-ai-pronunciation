import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
  passingScore: number;
  totalQuestions: number;
  instructorId?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: number[];
  score: number;
  passed: boolean;
  timeTaken: number;
  attemptedAt: string;
}

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  attempts: QuizAttempt[];
  currentAttempt: QuizAttempt | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  attempts: [],
  currentAttempt: null,
  isLoading: false,
  error: null,
};

export const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.quizzes = action.payload;
    },
    setCurrentQuiz: (state, action: PayloadAction<Quiz | null>) => {
      state.currentQuiz = action.payload;
    },
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes.push(action.payload);
    },
    updateQuiz: (state, action: PayloadAction<Quiz>) => {
      const index = state.quizzes.findIndex(q => q.id === action.payload.id);
      if (index !== -1) {
        state.quizzes[index] = action.payload;
      }
      if (state.currentQuiz?.id === action.payload.id) {
        state.currentQuiz = action.payload;
      }
    },
    deleteQuiz: (state, action: PayloadAction<string>) => {
      state.quizzes = state.quizzes.filter(q => q.id !== action.payload);
    },
    setAttempts: (state, action: PayloadAction<QuizAttempt[]>) => {
      state.attempts = action.payload;
    },
    setCurrentAttempt: (state, action: PayloadAction<QuizAttempt | null>) => {
      state.currentAttempt = action.payload;
    },
    addAttempt: (state, action: PayloadAction<QuizAttempt>) => {
      state.attempts.push(action.payload);
      state.currentAttempt = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setQuizzes,
  setCurrentQuiz,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  setAttempts,
  setCurrentAttempt,
  addAttempt,
} = quizSlice.actions;

export default quizSlice.reducer;
