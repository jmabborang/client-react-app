import { Navigate, createBrowserRouter } from 'react-router-dom'
import Application from '../core/application'
import { applicationMenus } from '../../pages/menu'
import LoginPage from '../../pages/views/login'
import { paths } from './paths'
import AuthGate from './AuthGate'

export const appRouter = createBrowserRouter([
  {
    path: paths.login,
    element: <AuthGate><LoginPage /></AuthGate>,
  },
  {
    path: paths.home,
    element: <AuthGate requireAuth><Application /></AuthGate>,
    children: [
      { index: true, element: <Navigate to={applicationMenus[0].path} replace /> },
      ...applicationMenus.map((menu) => ({
        path: menu.path,
        element: menu.element,
      })),
    ],
  },
])
