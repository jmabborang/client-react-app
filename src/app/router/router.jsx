import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../../widgets/layout/MainLayout'
import AboutPage from '../../pages/about'
import DashboardPage from '../../pages/dashboard'
import HomePage from '../../pages/home'
import NotFoundPage from '../../pages/not-found'
import { paths } from './paths'

export const appRouter = createBrowserRouter([
  {
    path: paths.home,
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: paths.dashboard.slice(1), element: <DashboardPage /> },
      { path: paths.about.slice(1), element: <AboutPage /> },
    ],
  },
])
