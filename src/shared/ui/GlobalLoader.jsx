import { useAppSelector } from '../../store/hooks'
import { selectIsApiLoading } from '../../store/uiSlice'

function GlobalLoader() {
  const isLoading = useAppSelector(selectIsApiLoading)

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
