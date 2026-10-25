import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from '../../store/store'
import { appRouter } from '../router/router'
import GlobalLoader from '../../shared/ui/GlobalLoader'
import { setHttpClientStoreDispatch, setUnauthorizedHandler } from '../../shared/api/httpClient'
import { loadCurrentUser, logout } from '../../store/authSlice'
import SessionActivityManager from './SessionActivityManager'

setHttpClientStoreDispatch(store.dispatch)
setUnauthorizedHandler(() => store.dispatch(logout()))

function AppProviders() {
  const startedSessionCheck = useRef(false)

  useEffect(() => {
    if (!startedSessionCheck.current) {
      startedSessionCheck.current = true
      store.dispatch(loadCurrentUser())
    }
  }, [])

  return (
    <Provider store={store}>
      <RouterProvider router={appRouter} />
      <GlobalLoader />
      <SessionActivityManager />
    </Provider>
  )
}

export default AppProviders
