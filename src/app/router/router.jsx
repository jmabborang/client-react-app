import { Navigate, createBrowserRouter } from 'react-router-dom'
import Application from '../core/application'
import { applicationMenus } from '../../pages/menu'
import LoginPage from '../../pages/views/login'
import { paths } from './paths'

export const appRouter = createBrowserRouter([
  {
    path: paths.login,
    element: <LoginPage />,
  },
  {
    path: paths.home,
    element: <Application />,
    children: [
      { index: true, element: <Navigate to={applicationMenus[0].path} replace /> },
      ...applicationMenus.map((menu) => ({
        path: menu.path,
        element: menu.element,
      })),
    ],
  },
])
