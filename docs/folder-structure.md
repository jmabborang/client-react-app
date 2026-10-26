# Folder structure

This document describes where code belongs as the React application grows.
`src/routes/AppRoutes.jsx` maps URLs to pages. `src/pages/views.jsx` collects
the components under `src/pages/views/` for the router to use. Most other
folders still contain only `.gitkeep` placeholders.

```text
client-react-app/
├── src/
│   ├── assets/       Images, icons, fonts, and other imported static files
│   ├── components/   Reusable UI elements
│   ├── context/      React contexts and their providers
│   ├── hooks/        Reusable custom React hooks
│   ├── layouts/      Shared page structures
│   ├── pages/        Complete route-level screens
│   ├── routes/       Route definitions and navigation configuration
│   ├── services/     Backend and external API communication
│   ├── store/        Shared application state, when needed
│   ├── utils/        Pure, reusable helper functions
│   ├── App.jsx       Root application component
│   └── main.jsx      Browser entry point that renders App
├── package.json      Dependencies and npm scripts
└── vite.config.js    Vite build and development configuration
```

## Folder responsibilities

| Folder | Put here | Example |
| --- | --- | --- |
| `components/` | Reusable UI pieces that can appear on multiple screens. | Button, form field, card |
| `pages/` | Complete screens associated with a URL or application view. | Home, Login, Dashboard, Profile |
| `layouts/` | Shared structures that arrange pages and persistent interface areas. | Main layout with header, sidebar, and footer |
| `hooks/` | Custom hooks that reuse React stateful behavior or coordinate a feature's logic. | `useAuth`, `useDocumentTitle` |
| `services/` | Functions that call REST APIs or other backend systems and return their results. | `authService`, `userService` |
| `context/` | Context definitions and providers for values shared through a React component tree. | Theme or language provider |
| `store/` | Centralized state and actions when several unrelated areas need the same changing data. | Authentication state or application-wide UI state |
| `utils/` | Reusable functions that do not depend on React or UI state. | Date formatting, value validation |
| `assets/` | Static files imported by source code. | Images, icons, fonts |
| `routes/` | URL paths, route-to-page mapping, and navigation rules. | Public and authenticated routes |

## How the pieces fit together

`main.jsx` mounts `App.jsx`, which renders the router in `routes/`. Each `.jsx`
file under `pages/views/` must default-export a React component. `views.jsx`
exports these components by file name (`test.jsx` becomes `views.Test`), while
`AppRoutes.jsx` decides which URL renders each component. Hooks hold reusable
React behavior, services handle external data, and utils provide general
helpers.

Keep state close to the component that owns it. Use `context/` for values that
need a provider, and introduce code in `store/` when centralized state has a
clear use. A component such as a header belongs in `components/` when reused on
its own; a layout can compose that header with a sidebar and page content.

`package.json` defines the Vite scripts and React dependencies, including
React Router. `vite.config.js` configures the Vite React plugin. No state
management library is installed yet.
