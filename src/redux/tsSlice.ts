import axios from 'axios';
import {omit as _omit, size as _size} from 'lodash';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { selectTags, selectAllOrAnyTags, selectMetric, selectAscOrDesc, selectPage, selectPerPageCount } from './tsFiltersSlice';
import { selectAllMetrics } from './metricsSlice';
import { RootState } from './store';

import { Metric } from '../types/metrics';
import { SingleTimeseries, SingleTimeseriesMetadataMetric } from '../types/timeseries';


interface TSState {
	status: string;
	result?: any;
  singleTSCache?: Record<number, SingleTimeseries>;
 }

const Units = {
	SECONDS: "seconds",
	PROPORTION: "proportion"
}

export const defaultMetricColor: string = "#0427b3";
export const MAX_FLOAT = 1e32;

function getMetricColor(metric: Metric, tsToMetric: SingleTimeseriesMetadataMetric) {
  let color = "blue";
  if (metric.unit === Units.PROPORTION) {
    if (tsToMetric.value < 0) {
      color = "red";
    }
    else if (tsToMetric.value > 0) {
      color = "green";
    }
  }
  return color;
}

function addFormattedValues(ts: SingleTimeseries, metrics: Array<Metric>) {
	const sInDay = 24 * 60 * 60;
	const uidToMetric = Object.fromEntries( metrics.map( metric => [metric.uid, metric] ) );
	for (const tsToMetric of (ts.metadata.metrics || [])) {
		if (uidToMetric[tsToMetric.uid].unit === Units.SECONDS) {
			tsToMetric.formattedValue = Math.round(tsToMetric.value / sInDay).toString() + " days";
		}
		else if (uidToMetric[tsToMetric.uid].unit === Units.PROPORTION) {
			if (tsToMetric.value > MAX_FLOAT) {
				tsToMetric.formattedValue = "+\u{221E}";
			}
			else if (tsToMetric.value < -MAX_FLOAT) {
				tsToMetric.formattedValue = "-\u{221E}";
			}
			else {
				tsToMetric.formattedValue =  ((tsToMetric.value > 0) ? "+":"") + (tsToMetric.value * 100).toFixed(2).toString() + " %";
			}
		}
		else {
			tsToMetric.formattedValue = tsToMetric.value.toString();
		}
		tsToMetric.color = getMetricColor(uidToMetric[tsToMetric.uid], tsToMetric);
	}
}

export const fetchTS = createAsyncThunk('ts/fetchTS', async (_payload, {getState}) => {
	const state: RootState = getState() as RootState;
	const page = selectPage(state);
	const perPageCount = selectPerPageCount(state);
	const metric = selectMetric(state);
	if ((!page && page != 0) || !perPageCount || !metric) {
		return;
	}

	const cache = selectSingleTSCache(state);
	if (cache && _size(cache) >= perPageCount) {
		const filteredCache = [];
		for (let i = 0; i < perPageCount; ++i) {
			const cacheKey = page * perPageCount + i;
			const cacheSTS = cache[cacheKey];
			if (cacheSTS) {
				filteredCache.push(cacheSTS);
			}
		}
		if (filteredCache.length === perPageCount) {
			return Promise.resolve({
				cacheHit: true,
				single_timeseries: filteredCache,
				params: {
		  		page, perPageCount
		  	}
			});
		}
	}

	const endpoint = `${import.meta.env.VITE_APP_API_PROTOCOL || "http"}://${import.meta.env.VITE_APP_API_HOST}:${import.meta.env.VITE_APP_API_PORT}/api/${import.meta.env.VITE_APP_API_VERSION}/${import.meta.env.VITE_APP_API_TS_ENDPOINT}`;
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

  for (const ts of (response.data?.data.single_timeseries || [])) {
  	addFormattedValues(ts, selectAllMetrics(state));
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
    singleTSCache: {}
  } as TSState,
  reducers: {
  	clearSingleTSCache: (state, _action) => {
  		state.singleTSCache = {};
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
        	singleTSCache: state.singleTSCache
        }
      })
      .addCase(fetchTS.fulfilled, (state, action) => {
      	if (action.payload?.cacheHit) {
      		state.status = 'success';
      		// @ts-ignore
      		state.result.data.single_timeseries = action.payload?.single_timeseries
      		return;
      	}
      	// @ts-ignore
      	const { page, perPageCount } = action.payload?.params;
      	const singleTS: Record<number, SingleTimeseries> = {};
      	// @ts-ignore
    		for (const [i, sts] of (action.payload?.data?.data?.single_timeseries || []).entries()) {
    			const cacheKey = page * perPageCount + i;
    			singleTS[cacheKey] = sts;
    		}

      	return {
      		status: 'success',
      		// @ts-ignore
      		result: action.payload?.data,
      		singleTSCache: {
      			...state.singleTSCache,
      			...singleTS
      		}
      	}
      })
      .addCase(fetchTS.rejected, (state, action) => {
        return {
          status: "error",
          result: action.error,
          singleTSCache: state.singleTSCache
        }
      })
  }
})

export default tsSlice.reducer;
export const { clearSingleTSCache } = tsSlice.actions;

const selectSingleTSCache = (state: RootState) => state.ts.singleTSCache;
export const selectTSStatus = (state: RootState) => state.ts.status;
export const selectTSResult = (state: RootState) => state.ts.result;

export const selectFilteredTSCache = (state: RootState) => {
	return state.ts.result?.data;
}
