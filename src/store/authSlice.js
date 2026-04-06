import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { httpClient } from '../shared/api/httpClient'
import { generateUuid, getDeviceName, getIpAddress, getOrCreateDeviceId } from '../shared/core/common'

const AUTH_STORAGE_KEY = 'client-react-app.auth'

function loadStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

function persistSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

const storedSession = loadStoredSession()

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, thunkApi) => {
  try {
    const ipAddress = await getIpAddress()
    const payload = {
      Username: credentials.username.trim(),
      Password: credentials.password,
      IsRemember: credentials.remember,
      DeviceId: getOrCreateDeviceId(),
      DeviceName: getDeviceName(),
      IPAddress: ipAddress,
      ClientRequestId: generateUuid(),
    }

    const responseData = await httpClient.post('/api/v1/auth/login', payload)

    return {
      token: responseData.token ?? null,
      tokenType: responseData.token_type ?? null,
      user: responseData.user ?? null,
      message: responseData.message ?? 'Login successful.',
      remember: credentials.remember,
    }
  } catch (error) {
    return thunkApi.rejectWithValue(error?.message || 'Unable to connect to Server. Please try again.')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedSession?.user ?? null,
    token: storedSession?.token ?? null,
    tokenType: storedSession?.tokenType ?? null,
    remember: storedSession?.remember ?? false,
    status: 'idle',
    error: '',
    successMessage: '',
  },
  reducers: {
    clearAuthFeedback(state) {
      state.error = ''
      state.successMessage = ''
    },
    logout(state) {
      state.user = null
      state.token = null
      state.tokenType = null
      state.remember = false
      state.status = 'idle'
      state.error = ''
      state.successMessage = ''
      persistSession(null)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = ''
        state.successMessage = ''
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.user = action.payload.user
        state.token = action.payload.token
        state.tokenType = action.payload.tokenType
        state.remember = action.payload.remember
        state.successMessage = action.payload.message
        state.error = ''
        persistSession({
          user: action.payload.user,
          token: action.payload.token,
          tokenType: action.payload.tokenType,
          remember: action.payload.remember,
        })
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Unable to connect to Server. Please try again.'
        state.successMessage = ''
      })
  },
})

export const { clearAuthFeedback, logout } = authSlice.actions

export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectAuthSuccessMessage = (state) => state.auth.successMessage
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => Boolean(state.auth.token)

export default authSlice.reducer
