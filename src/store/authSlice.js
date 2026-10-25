import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clearCsrfToken, httpClient, setCsrfToken } from '../shared/api/httpClient'
import { generateUuid, getDeviceName, getOrCreateDeviceId } from '../shared/core/common'

// Discard credentials persisted by older versions of the client.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('client-react-app.auth')
  } catch {
    // Session authentication does not depend on browser storage.
  }
}

export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, thunkApi) => {
  try {
    const response = await httpClient.get('/api/v1/auth/me')
    if (!response?.user || !response?.csrf_token) {
      throw new Error('Invalid session response.')
    }
    setCsrfToken(response.csrf_token)
    return response.user
  } catch (error) {
    clearCsrfToken()
    if (error?.status === 401) {
      return null
    }
    return thunkApi.rejectWithValue(error?.message || 'Unable to verify your session.')
  }
})

// Keep the password out of Redux actions and DevTools metadata.
export async function signIn(credentials) {
  const payload = {
    Username: credentials.username.trim(),
    Password: credentials.password,
    IsRemember: credentials.remember,
    DeviceId: getOrCreateDeviceId(),
    DeviceName: getDeviceName(),
    ClientRequestId: generateUuid(),
  }
  const response = await httpClient.post('/api/v1/auth/login', payload)
  if (!response?.user || !response?.csrf_token) {
    throw new Error('Invalid login response.')
  }
  setCsrfToken(response.csrf_token)
  return { user: response.user, message: response.message || 'Login successful.' }
}

export async function signOut() {
  await httpClient.post('/api/v1/auth/logout', {})
  clearCsrfToken()
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'checking',
    error: '',
    successMessage: '',
  },
  reducers: {
    clearAuthFeedback(state) {
      state.error = ''
      state.successMessage = ''
    },
    loginStarted(state) {
      state.status = 'loading'
      state.error = ''
      state.successMessage = ''
    },
    loginSucceeded(state, action) {
      state.status = 'authenticated'
      state.user = action.payload.user
      state.successMessage = action.payload.message
      state.error = ''
    },
    loginFailed(state, action) {
      state.status = 'unauthenticated'
      state.error = action.payload
      state.successMessage = ''
    },
    logout(state) {
      state.user = null
      state.status = 'unauthenticated'
      state.error = ''
      state.successMessage = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'checking'
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = action.payload ? 'authenticated' : 'unauthenticated'
        state.error = ''
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.user = null
        state.status = 'error'
        state.error = action.payload || 'Unable to verify your session.'
      })
  },
})

export const { clearAuthFeedback, loginStarted, loginSucceeded, loginFailed, logout } = authSlice.actions
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectAuthSuccessMessage = (state) => state.auth.successMessage
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.user)

export default authSlice.reducer
