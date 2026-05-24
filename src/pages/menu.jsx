import DashboardPage from '../pages/views/dashboard'
import UsersPage from '../pages/views/users'
import SettingsPage from '../pages/views/settings'
import { paths } from '../app/router/paths'

export const applicationMenus = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: paths.dashboard,
    title: 'Dashboard',
    element: <DashboardPage />,
    iconPath: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1Z',
  },
  {
    key: 'users',
    label: 'Users',
    path: paths.users,
    title: 'Users',
    element: <UsersPage />,
    iconPath: 'M16 19v-1.2a3.8 3.8 0 0 0-3.8-3.8H7.8A3.8 3.8 0 0 0 4 17.8V19m14-7a3 3 0 1 0 0-6m2 13v-1a3 3 0 0 0-2.2-2.9M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  },
  {
    key: 'settings',
    label: 'Settings',
    path: paths.settings,
    title: 'Settings',
    element: <SettingsPage />,
    iconPath: 'M16 19v-1.2a3.8 3.8 0 0 0-3.8-3.8H7.8A3.8 3.8 0 0 0 4 17.8V19m14-7a3 3 0 1 0 0-6m2 13v-1a3 3 0 0 0-2.2-2.9M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  },
]
