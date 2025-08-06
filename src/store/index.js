import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';

export const store = configureStore({
  reducer: {
    user: userSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['user/setUser'],
        ignoredActionsPaths: ['payload'],
        ignoredPaths: ['user.user']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;