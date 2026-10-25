import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loadCurrentUser, selectAuthError, selectAuthStatus } from '../../store/authSlice'
import { paths } from './paths'

export default function AuthGate({ children, requireAuth = false }) {
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)

  if (status === 'checking') {
    return <p role="status">Checking your session...</p>
  }

  if (status === 'error') {
    return (
      <div role="alert">
        <p>{error || 'Unable to verify your session.'}</p>
        <button type="button" onClick={() => dispatch(loadCurrentUser())}>Retry</button>
      </div>
    )
  }

  if (requireAuth) {
    return status === 'authenticated' ? children : <Navigate to={paths.login} replace />
  }

  return status === 'authenticated' ? <Navigate to={paths.dashboard} replace /> : children
}
