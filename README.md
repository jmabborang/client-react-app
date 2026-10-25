# Client React Starter

Reusable React starter built with Vite, organized using a feature-first layered architecture.

## Run

```bash
npm install
npm run dev
```

## Architecture

```txt
src/
  app/
    config/            # app-level constants and environment config
    providers/         # root providers (router, state, theme, i18n)
    router/            # route paths and router setup
  pages/               # route-level pages (screen entry points)
    home/
    dashboard/
    about/
    not-found/
  widgets/             # composition blocks (layout/header/nav)
    layout/
    navigation/
  features/            # user-facing use cases (auth, checkout, search)
  entities/            # business entities (user, product, order)
  shared/
    api/               # base API/http client
    hooks/             # reusable hooks
    lib/               # small pure utilities
    styles/            # design tokens + global styles
    ui/                # shared presentational UI components
  App.jsx
  main.jsx
```

## Layer Dependency Rule

Use one-way dependencies:

`pages -> widgets -> features -> entities -> shared`

Keep `shared` independent. Avoid importing "upward" across layers.

## Starter Conventions

- Add routes in `src/app/router/paths.js` and `src/app/router/router.jsx`.
- Put route pages in `src/pages/<page-name>/index.jsx`.
- Keep business logic in `features` and `entities`, not inside pages.
- Keep reusable generic code in `shared`.
- Use `shared/styles/tokens.css` for design variables.

## Environment

Optional env:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Used by `src/shared/api/httpClient.js`.

## Authentication

The API must provide cookie-based sessions: `POST /api/v1/auth/login` sets the
session cookie and returns `{ user, csrf_token }`; `GET /api/v1/auth/me` returns
the same fields; `POST /api/v1/auth/logout` revokes the session. The client sends
cookies with API requests and adds `X-CSRF-Token` to state-changing requests after
login or session restoration. It does not store access tokens in browser storage.

For production, set `VITE_API_BASE_URL` to an HTTPS API origin on the same site as
the frontend. Deploy the Rails API changes and database migration with this client;
the previous bearer-token login response is not compatible with this version.
