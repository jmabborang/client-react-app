import { RouterProvider } from 'react-router-dom'
import { appRouter } from '../router/router'

function AppProviders() {
  return <RouterProvider router={appRouter} />
}

export default AppProviders
