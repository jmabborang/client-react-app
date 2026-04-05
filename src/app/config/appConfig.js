const DEFAULT_DEV_API_BASE_URL = 'http://localhost:3020'
const DEFAULT_PROD_API_BASE_URL = 'https://api.yourdomain.com'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? DEFAULT_PROD_API_BASE_URL : DEFAULT_DEV_API_BASE_URL)

if (import.meta.env.PROD && apiBaseUrl.startsWith('http://')) {
  // Warn at runtime if production is configured with an insecure API URL.
  console.warn('In production, VITE_API_BASE_URL should use HTTPS.')
}

export const appConfig = {
  appName: 'Client React Starter',
  apiBaseUrl,
}
