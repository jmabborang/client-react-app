import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeRequestCount: 0,
  },
  reducers: {
    apiRequestStarted(state) {
      state.activeRequestCount += 1
    },
    apiRequestFinished(state) {
      state.activeRequestCount = Math.max(0, state.activeRequestCount - 1)
    },
  },
})

export const { apiRequestStarted, apiRequestFinished } = uiSlice.actions

export const selectIsApiLoading = (state) => state.ui.activeRequestCount > 0

export default uiSlice.reducer
