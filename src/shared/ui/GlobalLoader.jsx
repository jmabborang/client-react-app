import { useSyncExternalStore } from 'react'
import { getIsApiLoading, subscribeApiLoading } from '../api/apiLoadingStore'

function GlobalLoader() {
  const isLoading = useSyncExternalStore(subscribeApiLoading, getIsApiLoading, getIsApiLoading)

  if (!isLoading) {
    return null
  }

  return (
    <div className="global-loader-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div className="global-loader-spinner" aria-hidden="true" />
      <p className="global-loader-text">Loading...</p>
    </div>
  )
}

export default GlobalLoader
