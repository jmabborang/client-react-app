# Creating a New Page or Module

This app uses React Router and a shared application shell. A new page is usually added in three places:

1. Create the page component in `src/pages/views/`
2. Add the route path in `src/app/router/paths.js`
3. Register the page in `src/pages/menu.jsx` if it should appear in the sidebar

## How routing works

- `src/app/router/router.jsx` mounts the main `Application` layout for authenticated pages.
- `src/app/core/application.jsx` renders `<Outlet />`, so child routes appear inside the main layout.
- `src/pages/menu.jsx` drives both the sidebar menu and the child routes under `/`.

## Create a new page

Create a new file in `src/pages/views/`, for example:

```jsx
function ReportsPage() {
  return <div>Reports page</div>
}

export default ReportsPage
```

## Add the route path

Update `src/app/router/paths.js`:

```js
export const paths = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  settings: '/settings',
  users: '/users',
  reports: '/reports',
}
```

## Register the page in the menu

Update `src/pages/menu.jsx`:

```jsx
import ReportsPage from '../pages/views/reports'
```

Then add a menu entry:

```jsx
{
  key: 'reports',
  label: 'Reports',
  path: paths.reports,
  title: 'Reports',
  element: <ReportsPage />,
  group: 'Menu',
  iconPath: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1Z',
}
```

## If the page should not show in the sidebar

Skip `src/pages/menu.jsx` and add the route directly in `src/app/router/router.jsx`.

That is useful for:

- Hidden admin pages
- Detail pages
- Wizards or onboarding flows

## Recommended checklist

1. Create the page component
2. Add the path constant
3. Add the menu item if needed
4. Verify the route renders inside `Application`
5. Add any page-specific styles or data fetching

