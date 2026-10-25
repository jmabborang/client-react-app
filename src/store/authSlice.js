import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { clearCsrfToken, httpClient, setCsrfToken } from '../shared/api/httpClient'
import { generateUuid, getDeviceName, getOrCreateDeviceId } from '../shared/core/common'

export function deadlineFromSeconds(seconds) {
  return Number.isFinite(seconds) ? Date.now() + Math.max(0, seconds) * 1000 : null
}

function sessionFromResponse(response) {
  if (!response?.user || !response?.csrf_token || typeof response.remembered !== 'boolean' ||
      !Number.isFinite(response.remembered ? response.next_rotation_in_seconds : response.expires_in_seconds)) {
    throw new Error('Invalid session response.')
  }
  setCsrfToken(response.csrf_token)
  return {
    user: response.user,
    remembered: response.remembered,
    idleDeadline: deadlineFromSeconds(response.expires_in_seconds),
    rotationDeadline: deadlineFromSeconds(response.next_rotation_in_seconds),
  }
}

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
    return sessionFromResponse(response)
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
  const session = sessionFromResponse(response)
  return {
    ...session,
    message: response.message || 'Login successful.',
  }
}

export async function recordActivity() {
  return httpClient.post('/api/v1/auth/activity', {}, { silent: true })
}

export async function checkSessionHeartbeat() {
  return httpClient.post('/api/v1/auth/heartbeat', {}, { silent: true })
}

export async function expireIdleSession() {
  return httpClient.post('/api/v1/auth/idle_expire', {}, { silent: true })
}

export async function refreshRememberedSession() {
  return httpClient.post('/api/v1/auth/refresh', {}, { silent: true })
}

export async function signOut() {
  await httpClient.post('/api/v1/auth/logout', {})
  clearCsrfToken()
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    remembered: false,
    idleDeadline: null,
    rotationDeadline: null,
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
      state.remembered = action.payload.remembered
      state.idleDeadline = action.payload.idleDeadline
      state.rotationDeadline = action.payload.rotationDeadline
      state.successMessage = action.payload.message
      state.error = ''
    },
    loginFailed(state, action) {
      state.status = 'unauthenticated'
      state.user = null
      state.remembered = false
      state.idleDeadline = null
      state.rotationDeadline = null
      state.error = action.payload
      state.successMessage = ''
    },
    logout(state) {
      state.user = null
      state.remembered = false
      state.idleDeadline = null
      state.rotationDeadline = null
      state.status = 'unauthenticated'
      state.error = ''
      state.successMessage = ''
    },
    sessionExtended(state, action) {
      state.idleDeadline = action.payload
    },
    sessionRotationScheduled(state, action) {
      state.rotationDeadline = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'checking'
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null
        state.remembered = action.payload?.remembered ?? false
        state.idleDeadline = action.payload?.idleDeadline ?? null
        state.rotationDeadline = action.payload?.rotationDeadline ?? null
        state.status = action.payload?.user ? 'authenticated' : 'unauthenticated'
        state.error = ''
      })
      .addCase(loadCurrentUser.rejected, (state, action) => {
        state.user = null
        state.remembered = false
        state.idleDeadline = null
        state.rotationDeadline = null
        state.status = 'error'
        state.error = action.payload || 'Unable to verify your session.'
      })
  },
})

export const { clearAuthFeedback, loginStarted, loginSucceeded, loginFailed, logout, sessionExtended, sessionRotationScheduled } = authSlice.actions
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectAuthSuccessMessage = (state) => state.auth.successMessage
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.user)
export const selectRemembered = (state) => state.auth.remembered
export const selectIdleDeadline = (state) => state.auth.idleDeadline
export const selectRotationDeadline = (state) => state.auth.rotationDeadline

export default authSlice.reducer
