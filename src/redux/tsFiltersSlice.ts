import { createSlice } from '@reduxjs/toolkit';

import { Tag } from '../types/tags'
import { Metric } from '../types/metrics'


export interface TSFiltersState {
  tags?: Array<Tag>;
  allOrAnyTags?: string;
  metric?: Metric;
  ascOrDesc?: string;
  page?: number;
  perPageCount?: number;
}

export const tsFiltersSlice = createSlice({
  name: 'tsFilters',
  initialState: {
    tags: undefined,
    allOrAnyTags: undefined,
    metric: undefined,
    ascOrDesc: undefined,
    page: undefined,
    perPageCount: undefined
  },
  reducers: {
  	set: (_state, action) => {
  		return action.payload;
  	},
  	setTags: (state, action) => {
  		state.tags = action.payload;
  	},
  	setAllOrAnyTags: (state, action) => {
  		state.allOrAnyTags = action.payload;
  	},
  	setMetrics: (state, action) => {
  		state.metric = action.payload;
  	},
  	setAscOrDesc: (state, action) => {
  		state.ascOrDesc = action.payload;
  	},
  	setPage: (state, action) => {
  		state.page = action.payload;
  	},
  	setPerPageCount: (state, action) => {
  		state.perPageCount = action.payload;
  	}
  },
});

export const { set } = tsFiltersSlice.actions;
export default tsFiltersSlice.reducer;

export const { setPage, setPerPageCount } = tsFiltersSlice.actions

export const selectFilters = (state: {tsFilters: TSFiltersState}) => state.tsFilters;
export const selectTags = (state: {tsFilters: TSFiltersState}) => state.tsFilters.tags;
export const selectAllOrAnyTags = (state: {tsFilters: TSFiltersState}) => state.tsFilters.allOrAnyTags;
export const selectMetric = (state: {tsFilters: TSFiltersState}) => state.tsFilters.metric;
export const selectAscOrDesc = (state: {tsFilters: TSFiltersState}) => state.tsFilters.ascOrDesc;
export const selectPage = (state: {tsFilters: TSFiltersState}) => state.tsFilters.page;
export const selectPerPageCount = (state: {tsFilters: TSFiltersState}) => state.tsFilters.perPageCount;