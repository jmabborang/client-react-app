import { appConfig } from '../../app/config/appConfig'
import { apiRequestFinished, apiRequestStarted } from '../../store/uiSlice'

let storeDispatch = null

export function setHttpClientStoreDispatch(dispatch) {
  storeDispatch = dispatch
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
  storeDispatch?.(apiRequestStarted())
  try {
    const hasBody = options.body !== undefined
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      headers: { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
      ...options,
    })

    const responseData = await response.json().catch(() => null)

    if (!response.ok) {
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
    storeDispatch?.(apiRequestFinished())
  }
}

export const httpClient = {
  get: (path, params, options = {}) => request(withQueryParams(path, params), options),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
}
