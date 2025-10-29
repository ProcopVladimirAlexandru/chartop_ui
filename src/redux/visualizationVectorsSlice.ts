import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { selectUnaryMetrics } from "./metricsSlice";
import { addFormattedValuesToChartableEntry } from "./tsSlice";
import { RootState } from "./store";

import { TSWithVisualizationVector } from "../types/visualizationVectors";
import {
  MAXIMUM_VECTORS,
  MAXIMUM_SELECTED_VECTORS,
  DEFAULT_AXIS_DOMAIN_LENGTH,
  DEFAULT_ORIGIN_VECTOR,
} from "../utils/utils";

interface VisualizationVectorsState {
  status: string;
  allVVs?: Array<TSWithVisualizationVector>;
  selectedVVs?: Array<TSWithVisualizationVector>;
  radius?: number;
  limit?: number;
  coordinates?: {
    xMin?: number;
    yMin?: number;
    axisDomainLength?: number;
  };
  previousOriginTSUid?: number;
}

export const fetchTSWithVisualizationVectors = createAsyncThunk(
  "visualizationVectors/fetchVisualizationVectors",
  async (
    args: {
      radius?: number;
      originTSUid?: number;
      originVector?: Array<number>;
      excludeTSUids?: Array<number>;
      limit?: number;
    },
    { getState },
  ) => {
    const state: RootState = getState() as RootState;
    const endpoint = `${import.meta.env.VITE_APP_API_PROTOCOL || "http"}://${import.meta.env.VITE_APP_API_HOST}:${import.meta.env.VITE_APP_API_PORT}/api/${import.meta.env.VITE_APP_API_VERSION}/${import.meta.env.VITE_APP_API_VISUALIZATION_VECTORS_ENDPOINT}`;

    const radius = args.radius
      ? args.radius
      : state.visualizationVectors.radius;
    if (!radius) {
      throw Error("Missing radius to fetch visualization vectors");
    }
    const limit = args.limit;
    if (limit !== 0 && !limit) {
      throw Error("Missing limit to fetch visualization vectors");
    }

    let origin_ts_uid: number | null = null;
    let origin_vector: Array<number> | null = null;
    if (args.originTSUid || args.originTSUid === 0) {
      origin_ts_uid = args.originTSUid;
    } else {
      origin_vector = args.originVector
        ? args.originVector
        : DEFAULT_ORIGIN_VECTOR;
      if (!origin_vector) {
        throw Error(
          "Missing origin_vector and origin_ts_uid to fetch visualization vectors",
        );
      }
    }

    let exclude_ts_uids = args.excludeTSUids
      ? args.excludeTSUids
      : (state.visualizationVectors?.allVVs || []).map((vv) => vv.metadata.uid);
    if (origin_ts_uid && exclude_ts_uids) {
      // console.log("should exclude ", params.origin_ts_uid, " from ", params.exclude_ts_uids.length, " exlusions")
      exclude_ts_uids = exclude_ts_uids.filter(
        (ts_uid: number) => ts_uid !== origin_ts_uid,
      );
    }

    // console.log("params === ", params)
    const response = await axios.get(endpoint, {
      params: {
        radius,
        limit,
        origin_ts_uid,
        origin_vector,
        exclude_ts_uids,
      },
      paramsSerializer: {
        indexes: null, // no brackets at all
      },
    });
    for (const ts of response.data?.data?.ts_with_visualization_vectors || []) {
      addFormattedValuesToChartableEntry(
        { operands: [ts] },
        selectUnaryMetrics(state) || [],
      );
    }
    return response.data;
  },
);

export const visualizationVectorsSlice = createSlice({
  name: "visualizationVectors",
  initialState: {
    status: "initial",
    previousOriginTSUid: undefined,
  } as VisualizationVectorsState,
  reducers: {
    setCoordinates(state, action) {
      state.coordinates = action.payload;
    },
    selectVV(state, action) {
      if (MAXIMUM_SELECTED_VECTORS <= 0) {
        return;
      }

      const newVV = action.payload;
      if (!state.selectedVVs || state.selectedVVs.length === 0) {
        state.selectedVVs = [newVV];
        return;
      }
      for (let i = 0; i < state.selectedVVs.length; ++i) {
        if (state.selectedVVs[i].metadata.uid === newVV.metadata.uid) {
          state.selectedVVs = [
            newVV,
            ...state.selectedVVs.slice(0, i),
            ...state.selectedVVs.slice(i + 1),
          ];
          return;
        }
      }

      if (state.selectedVVs.length < MAXIMUM_SELECTED_VECTORS) {
        state.selectedVVs = [newVV, ...state.selectedVVs];
        return;
      }
      state.selectedVVs = [
        newVV,
        ...state.selectedVVs.slice(0, state.selectedVVs.length - 1),
      ];
    },
    setPreviousOriginTSUid(state, action) {
      state.previousOriginTSUid = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTSWithVisualizationVectors.pending, (state, _action) => {
        state.status = "loading";
      })
      .addCase(fetchTSWithVisualizationVectors.fulfilled, (state, action) => {
        state.status = "success";
        state.previousOriginTSUid =
          action.meta.arg.originTSUid || action.meta.arg.originTSUid === 0
            ? Number(action.meta.arg.originTSUid)
            : state.previousOriginTSUid || 0;
        if (action.payload.data.origin) {
          state.allVVs = action.payload.data.ts_with_visualization_vectors;
          state.selectedVVs = [];
          state.coordinates = {
            xMin:
              action.payload.data.origin[0] - DEFAULT_AXIS_DOMAIN_LENGTH / 2,
            yMin:
              action.payload.data.origin[1] - DEFAULT_AXIS_DOMAIN_LENGTH / 2,
            axisDomainLength: DEFAULT_AXIS_DOMAIN_LENGTH,
          };
          console.log("set coordinates to ", state.coordinates);
          return;
        }

        const newVVs = action.payload.data.ts_with_visualization_vectors;
        // console.log("SLICE newVVs.length === ", (newVVs || []).length)
        if (!newVVs || !newVVs.length) {
          return;
        }
        // console.log("SLICE before state.allVVs.length === ", (state.allVVs || []).length)

        const oldAndNewVVs = newVVs.concat(state.allVVs || []);
        const newSelectedVVs = [];
        let newAllVVs = oldAndNewVVs;

        if (oldAndNewVVs.length > MAXIMUM_VECTORS) {
          for (const selectedVV of state.selectedVVs || []) {
            let found: boolean = false;
            for (let i = MAXIMUM_VECTORS; i < oldAndNewVVs.length; ++i) {
              if (selectedVV.metadata.uid === oldAndNewVVs[i].metadata.uid) {
                found = true;
                // console.log(`found ${selectedVV.metadata.uid} at ${i}`)
                break;
              }
            }
            if (!found) {
              newSelectedVVs.push(selectedVV);
            }
          }
          newAllVVs = oldAndNewVVs.slice(0, MAXIMUM_VECTORS);
          state.selectedVVs = newSelectedVVs;
        }

        state.allVVs = newAllVVs;
        if (!state.coordinates) {
          state.coordinates = {
            xMin: DEFAULT_ORIGIN_VECTOR[0] - DEFAULT_AXIS_DOMAIN_LENGTH / 2,
            yMin: DEFAULT_ORIGIN_VECTOR[1] - DEFAULT_AXIS_DOMAIN_LENGTH / 2,
            axisDomainLength: DEFAULT_AXIS_DOMAIN_LENGTH,
          };
          console.log("set coordinates to ", state.coordinates);
        }
        // console.log("SLICE after state.allVVs.length === ", state.allVVs.length)
      })
      .addCase(fetchTSWithVisualizationVectors.rejected, (state, _action) => {
        console.log("_action === ", _action);
        state.status = "error";
      });
  },
});

export default visualizationVectorsSlice.reducer;

export const { setCoordinates, selectVV, setPreviousOriginTSUid } =
  visualizationVectorsSlice.actions;

export const selectVisualizationVectorsStatus = (state: {
  visualizationVectors: VisualizationVectorsState;
}) => state.visualizationVectors.status;

export const selectAllVVs = (state: {
  visualizationVectors: VisualizationVectorsState;
}) => state.visualizationVectors.allVVs;

export const selectCoordinates = (state: {
  visualizationVectors: VisualizationVectorsState;
}) => state.visualizationVectors.coordinates;

export const selectSelectedVVs = (state: {
  visualizationVectors: VisualizationVectorsState;
}) => state.visualizationVectors.selectedVVs;

export const selectPreviousOriginTSUid = (state: {
  visualizationVectors: VisualizationVectorsState;
}) => state.visualizationVectors.previousOriginTSUid;
