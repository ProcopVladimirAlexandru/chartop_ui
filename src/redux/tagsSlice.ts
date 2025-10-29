import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { Tag } from "../types/tags";

interface TagsState {
  status: string;
  result?: { data?: Array<Tag> };
}

export const fetchTags = createAsyncThunk("tags/fetchTags", async () => {
  const endpoint = `${import.meta.env.VITE_APP_API_PROTOCOL || "http"}://${import.meta.env.VITE_APP_API_HOST}:${import.meta.env.VITE_APP_API_PORT}/api/${import.meta.env.VITE_APP_API_VERSION}/${import.meta.env.VITE_APP_API_TAGS_ENDPOINT}`;
  const response = await axios.get(endpoint);
  return response.data;
});

function isTagHidden(tag: Tag) {
  return tag.name.toLowerCase().includes("citation");
}

export const tagsSlice = createSlice({
  name: "tags",
  initialState: {
    status: "initial",
    result: undefined,
  } as TagsState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchTags.pending, (_state, _action) => {
        return { status: "loading" };
      })
      .addCase(fetchTags.fulfilled, (_state, action) => {
        const newState = {
          status: "success",
          result: action.payload,
        };
        if (!newState.result.data) {
          return newState;
        }
        newState.result.data = newState.result.data
          .filter((tag: Tag) => !isTagHidden(tag))
          .sort((tag_1: Tag, tag_2: Tag) => {
            if (tag_1.name < tag_2.name) {
              return -1;
            } else if (tag_1.name > tag_2.name) {
              return 1;
            }
            return 0;
          });
        return newState;
      })
      .addCase(fetchTags.rejected, (_state, _action) => {
        return {
          status: "error",
        };
      });
  },
});

export default tagsSlice.reducer;

export const selectAllTags = (state: { tags: TagsState }) =>
  state.tags.result?.data;

export const selectTagsStatus = (state: { tags: TagsState }) =>
  state.tags.status;
