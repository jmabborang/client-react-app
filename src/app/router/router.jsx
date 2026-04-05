import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../../widgets/layout/MainLayout'
import LoginPage from '../../pages/auth/LoginPage'
import { paths } from './paths'

function EmptyState() {
  return (
    <section className="page-content">
      <h2>No Pages</h2>
      <p>All pages were removed from this project.</p>
    </section>
  )
}

export const appRouter = createBrowserRouter([
  {
    path: paths.login,
    element: <LoginPage />,
  },
  {
    path: paths.home,
    element: <MainLayout />,
    children: [
      { index: true, element: <EmptyState /> },
    ],
  },
])
