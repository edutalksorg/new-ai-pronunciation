import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import paymentReducer from './paymentSlice';
import quizReducer from './quizSlice';
import callReducer from './callSlice';
import walletReducer from './walletSlice';
import adminReducer from './adminSlice';
import instructorReducer from './instructorSlice';
import usageReducer from './usageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    payment: paymentReducer,
    quiz: quizReducer,
    call: callReducer,
    wallet: walletReducer,
    admin: adminReducer,
    instructor: instructorReducer,
    usage: usageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
