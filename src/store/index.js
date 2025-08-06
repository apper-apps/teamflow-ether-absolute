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
// Export store types for use in components
export const getRootState = () => store.getState();
export const getAppDispatch = () => store.dispatch;