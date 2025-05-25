import { configureStore } from '@reduxjs/toolkit';
import tagsReducer from './tagsSlice';
import metricsReducer from './metricsSlice';
import tsFiltersReducer from './tsFiltersSlice';
import tsReducer from './tsSlice';

const store = configureStore({
  reducer: {
    tags: tagsReducer,
    metrics: metricsReducer,
    tsFilters: tsFiltersReducer,
    ts: tsReducer
  }
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch