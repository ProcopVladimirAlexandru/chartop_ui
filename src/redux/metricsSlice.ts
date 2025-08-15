import axios from 'axios';
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

interface MetricsState {
  status: string;
  result?: { data?: any; }
}

export const fetchMetrics = createAsyncThunk('tags/fetchMetrics', async () => {
	const endpoint = `${import.meta.env.VITE_APP_API_PROTOCOL || "http"}://${import.meta.env.VITE_APP_API_HOST}:${import.meta.env.VITE_APP_API_PORT}/api/${import.meta.env.VITE_APP_API_VERSION}/${import.meta.env.VITE_APP_API_METRICS_ENDPOINT}`;
  const response = await axios.get(endpoint);
  return response.data;
})

export const metricsSlice = createSlice({
  name: 'metrics',
  initialState: {
  	status: 'initial',
    result: undefined
  } as MetricsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMetrics.pending, (_state, _action) => {
        return { status: 'loading' }
      })
      .addCase(fetchMetrics.fulfilled, (_state, action) => {
        const metrics = action.payload.data;
        const newOrder: Array<number> = [1, 2, 15];
        const newOrderSet: Set<number> = new Set(newOrder);
        if (newOrder.length !== newOrderSet.size) {
          return {
            status: "success",
            result: action.payload
          }
        }

        const firstMetrics = new Array(newOrder.length);
        const lastMetrics = [];
        for (const metric of metrics) {
          if (newOrderSet.has(metric.uid)) {
            firstMetrics[ newOrder.indexOf(metric.uid) ] = metric;
          }
          else {
            lastMetrics.push(metric);
          }
        }
        action.payload.data = firstMetrics.concat(lastMetrics);
        return {
          status: "success",
          result: action.payload
        }
      })
      .addCase(fetchMetrics.rejected, (_state, _action) => {
        return {
          status: "error"
        }
      })
  }
})


export default metricsSlice.reducer


export const selectAllMetrics = (state: RootState) => state.metrics.result?.data;

export const selectUnaryMetrics = createSelector(
  [selectAllMetrics], (allMetrics) => {
    return allMetrics.filter((m) => m.uid < 16);
  }
);

export const selectMetricsStatus = (state: RootState) => state.metrics.status;