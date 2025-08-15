import axios from 'axios';
import {omit as _omit, size as _size} from 'lodash';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { selectTags, selectAllOrAnyTags, selectMetric, selectAscOrDesc, selectPage, selectPerPageCount } from './tsFiltersSlice';
import { selectUnaryMetrics, selectAllMetrics } from './metricsSlice';
import { RootState } from './store';

import { Metric } from '../types/metrics';
import { ChartopEntry, SingleTimeseries, SingleTimeseriesMetadataMetric } from '../types/timeseries';


interface TSState {
	status: string;
	result?: any;
  chartopEntriesCache?: Record<number, ChartopEntry>;
 }

const Units = {
	SECONDS: "seconds",
	PROPORTION: "proportion",
	CORRELATION: "correlation",
}

export const defaultMetricColor: string = "#0427b3";
export const MAX_FLOAT = 1e32;
const sInDay = 24 * 60 * 60;

function getMetricColor(metric: Metric, value: number) {
  let color = "blue";
  if (metric.unit === Units.PROPORTION || metric.unit === Units.CORRELATION) {
    if (value < 0) {
      color = "red";
    }
    else if (value > 0) {
      color = "green";
    }
  }
  return color;
}

function getMetricFormattedValue(metric: Metric, value: number) {
  if (metric.unit === Units.SECONDS) {
		return Math.round(value / sInDay).toString() + " days";
	}
	else if (metric.unit === Units.CORRELATION) {
		return ((value > 0) ? "+":"") + (value).toFixed(2).toString();
	}
	else if (metric.unit === Units.PROPORTION) {
		if (value > MAX_FLOAT) {
			return "+\u{221E}";
		}
		else if (value < -MAX_FLOAT) {
			return formattedValue = "-\u{221E}";
		}
		else {
			return ((value > 0) ? "+":"") + (value * 100).toFixed(2).toString() + " %";
		}
	}
	else {
		return value.toString();
	}
}

function addFormattedValues(entry: ChartopEntry, metrics: Array<Metric>, orderByMetric: Metric) {
	const uidToMetric = Object.fromEntries( metrics.map( metric => [metric.uid, metric] ) );
	for (const operand of entry.operands) {
		for (const tsToMetric of (operand.metadata.metrics || [])) {
			tsToMetric.formattedValue = getMetricFormattedValue(uidToMetric[tsToMetric.uid], tsToMetric.value)
			tsToMetric.color = getMetricColor(uidToMetric[tsToMetric.uid], tsToMetric.value);
		}
	}
	entry.formattedValue = getMetricFormattedValue(orderByMetric, entry.order_by_metric_value)
	entry.color = getMetricColor(orderByMetric, entry.order_by_metric_value)
}

export const fetchTS = createAsyncThunk('ts/fetchTS', async (_payload, {getState}) => {
	const state: RootState = getState() as RootState;
	const page = selectPage(state);
	const perPageCount = selectPerPageCount(state);
	const metric = selectMetric(state);
	if ((!page && page != 0) || !perPageCount || !metric) {
		return;
	}

	const cache = selectChartopEntriesCache(state);
	if (cache && _size(cache) >= perPageCount) {
		const filteredCache = [];
		for (let i = 0; i < perPageCount; ++i) {
			const cacheKey = page * perPageCount + i;
			const cacheEntry = cache[cacheKey];
			if (cacheEntry) {
				filteredCache.push(cacheEntry);
			}
		}
		if (filteredCache.length === perPageCount) {
			return Promise.resolve({
				cacheHit: true,
				chartop_entries: filteredCache,
				params: {
		  		page, perPageCount
		  	}
			});
		}
	}

	const endpoint = `${import.meta.env.VITE_APP_API_PROTOCOL || "http"}://${import.meta.env.VITE_APP_API_HOST}:${import.meta.env.VITE_APP_API_PORT}/api/${import.meta.env.VITE_APP_API_VERSION}/${import.meta.env.VITE_APP_API_CHARTOP_ENDPOINT}`;
  const params = {
    page_number: page,
    page_size: perPageCount,
    order_by: metric.uid,
    order_asc: (selectAscOrDesc(state) === 'asc'),
    tags: (selectTags(state) || []).map(tag => tag.uid),
    all_or_any_tags: selectAllOrAnyTags(state)
  }
  const response = await axios.get(endpoint, {
  	params,
  	paramsSerializer: {
    	indexes: null, // no brackets at all
  	}
  });
  for (const entry of (response.data?.data.chartop_entries || [])) {
  	addFormattedValues(entry, selectUnaryMetrics(state), metric);
  }
  return {
  	cacheHit: false,
  	data: response.data,
  	params: {
  		page, perPageCount
  	}
  };
})

export const tsSlice = createSlice({
  name: 'ts',
  initialState: {
    status: 'initial',
    result: undefined,
    chartopEntriesCache: {}
  } as TSState,
  reducers: {
  	clearChartopEntriesCache: (state, _action) => {
  		state.chartopEntriesCache = {};
  	}
  },
  extraReducers(builder) {
  	// TODO add Typescript to this...
    // @ts-ignore
    builder
      .addCase(fetchTS.pending, (state, _action) => {
        return {
        	status: 'loading',
        	result: state.result,
        	chartopEntriesCache: state.chartopEntriesCache
        }
      })
      .addCase(fetchTS.fulfilled, (state, action) => {
      	if (action.payload?.cacheHit) {
      		state.status = 'success';
      		// @ts-ignore
      		state.result.data.chartop_entries = action.payload?.chartop_entries
      		return;
      	}
      	// @ts-ignore
      	const { page, perPageCount } = action.payload?.params;
      	const chartopEntries: Record<number, ChartopEntry> = {};
      	// @ts-ignore
    		for (const [i, entry] of (action.payload?.data?.data?.chartop_entries || []).entries()) {
    			const cacheKey = page * perPageCount + i;
    			chartopEntries[cacheKey] = entry;
    		}

      	return {
      		status: 'success',
      		// @ts-ignore
      		result: action.payload?.data,
      		chartopEntriesCache: {
      			...state.chartopEntriesCache,
      			...chartopEntries
      		}
      	}
      })
      .addCase(fetchTS.rejected, (state, action) => {
        return {
          status: "error",
          result: action.error,
          chartopEntriesCache: state.chartopEntriesCache
        }
      })
  }
})

export default tsSlice.reducer;
export const { clearChartopEntriesCache } = tsSlice.actions;

const selectChartopEntriesCache = (state: RootState) => state.ts.chartopEntriesCache;
export const selectTSStatus = (state: RootState) => state.ts.status;
export const selectTSResult = (state: RootState) => state.ts.result;

export const selectFilteredChartopEntriesCache = (state: RootState) => {
	return state.ts.result?.data;
}
