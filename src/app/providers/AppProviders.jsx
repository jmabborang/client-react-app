import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from '../../store/store'
import { appRouter } from '../router/router'
import GlobalLoader from '../../shared/ui/GlobalLoader'
import { setHttpClientStoreDispatch } from '../../shared/api/httpClient'

setHttpClientStoreDispatch(store.dispatch)

function AppProviders() {
  return (
    <Provider store={store}>
      <RouterProvider router={appRouter} />
      <GlobalLoader />
    </Provider>
  )
}

export default AppProviders
