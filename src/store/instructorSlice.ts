import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InstructorTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string;
  estimatedTime: number;
  isPublished: boolean;
  studentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  completedQuizzes: number;
  totalQuizAttempts: number;
  averageScore: number;
  pronunciationProgress: number;
  voiceCallHours: number;
  joinedAt: string;
}

export interface InstructorEarnings {
  totalEarnings: number;
  currentMonth: number;
  previousMonth: number;
  pendingWithdrawal: number;
  completedWithdrawals: number;
  lastUpdated: string;
}

interface InstructorState {
  topics: InstructorTopic[];
  currentTopic: InstructorTopic | null;
  studentProgresses: StudentProgress[];
  earnings: InstructorEarnings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InstructorState = {
  topics: [],
  currentTopic: null,
  studentProgresses: [],
  earnings: null,
  isLoading: false,
  error: null,
};

export const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTopics: (state, action: PayloadAction<InstructorTopic[]>) => {
      state.topics = action.payload;
    },
    setCurrentTopic: (state, action: PayloadAction<InstructorTopic | null>) => {
      state.currentTopic = action.payload;
    },
    addTopic: (state, action: PayloadAction<InstructorTopic>) => {
      state.topics.push(action.payload);
    },
    updateTopic: (state, action: PayloadAction<InstructorTopic>) => {
      const index = state.topics.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.topics[index] = action.payload;
      }
      if (state.currentTopic?.id === action.payload.id) {
        state.currentTopic = action.payload;
      }
    },
    deleteTopic: (state, action: PayloadAction<string>) => {
      state.topics = state.topics.filter(t => t.id !== action.payload);
    },
    setStudentProgresses: (state, action: PayloadAction<StudentProgress[]>) => {
      state.studentProgresses = action.payload;
    },
    updateStudentProgress: (state, action: PayloadAction<StudentProgress>) => {
      const index = state.studentProgresses.findIndex(sp => sp.studentId === action.payload.studentId);
      if (index !== -1) {
        state.studentProgresses[index] = action.payload;
      } else {
        state.studentProgresses.push(action.payload);
      }
    },
    setEarnings: (state, action: PayloadAction<InstructorEarnings>) => {
      state.earnings = action.payload;
    },
    updateEarnings: (state, action: PayloadAction<Partial<InstructorEarnings>>) => {
      if (state.earnings) {
        state.earnings = { ...state.earnings, ...action.payload };
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setTopics,
  setCurrentTopic,
  addTopic,
  updateTopic,
  deleteTopic,
  setStudentProgresses,
  updateStudentProgress,
  setEarnings,
  updateEarnings,
} = instructorSlice.actions;

export default instructorSlice.reducer;
