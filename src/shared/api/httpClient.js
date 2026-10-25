import { appConfig } from '../../app/config/appConfig'
import { apiRequestFinished, apiRequestStarted } from '../../store/uiSlice'

let storeDispatch = null
let csrfToken = null
let onUnauthorized = null

export function setHttpClientStoreDispatch(dispatch) {
  storeDispatch = dispatch
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export function setCsrfToken(token) {
  csrfToken = token || null
}

export function clearCsrfToken() {
  csrfToken = null
}

function withQueryParams(path, params) {
  if (!params || typeof params !== 'object') {
    return path
  }

  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        query.append(key, String(item))
      })
      return
    }

    query.append(key, String(value))
  })

  const queryString = query.toString()
  if (!queryString) {
    return path
  }

  return `${path}${path.includes('?') ? '&' : '?'}${queryString}`
}

async function request(path, options = {}) {
  const trackRequest = !options.silent
  if (trackRequest) storeDispatch?.(apiRequestStarted())
  try {
    const { headers: customHeaders, silent: _silent, ...fetchOptions } = options
    const hasBody = fetchOptions.body !== undefined
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      ...fetchOptions,
      credentials: 'include',
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(csrfToken && !['GET', 'HEAD'].includes(fetchOptions.method || 'GET') ? { 'X-CSRF-Token': csrfToken } : {}),
        ...(customHeaders || {}),
      },
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 401 && !path.startsWith('/api/v1/auth/')) {
        clearCsrfToken()
        onUnauthorized?.()
      }
      const error = new Error(responseData?.message || `Request failed: ${response.status}`)
      error.status = response.status
      error.data = responseData
      throw error
    }

    return responseData
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error('Unable to connect to API. Please try again.')
      networkError.status = 0
      throw networkError
    }

    throw error
  } finally {
    if (trackRequest) storeDispatch?.(apiRequestFinished())
  }
}

export const httpClient = {
  get: (path, params, options = {}) => request(withQueryParams(path, params), options),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
}
