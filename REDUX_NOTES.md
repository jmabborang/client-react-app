# Redux Notes

## Overview

Redux is integrated into this React app to centralize shared state.

The Redux files are stored in:

- `src/store/store.js`
- `src/store/hooks.js`
- `src/store/authSlice.js`
- `src/store/uiSlice.js`

## Current Architecture

### `src/store/store.js`

This is the main Redux store.

It combines two slices:

- `auth`
- `ui`

```js
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
})
```

Meaning:

- `state.auth` contains authentication-related state
- `state.ui` contains UI-related global state

## App Connection

### `src/app/providers/AppProviders.jsx`

This file connects Redux to the app using `Provider`.

```jsx
<Provider store={store}>
  <RouterProvider router={appRouter} />
  <GlobalLoader />
</Provider>
```

Meaning:

- every component under `Provider` can access Redux state
- `GlobalLoader` can read loading state from Redux anywhere in the app

This file also connects the HTTP client to Redux:

```js
setHttpClientStoreDispatch(store.dispatch)
```

That allows the API layer to dispatch Redux actions.

## Typed-style Hooks

### `src/store/hooks.js`

This file exposes reusable hooks:

```js
export const useAppDispatch = useDispatch
export const useAppSelector = useSelector
```

Use these instead of importing `useDispatch` and `useSelector` directly in pages/components.

## Auth Flow

### `src/store/authSlice.js`

This file manages login/session state.

It stores:

- `user`
- `status`
- `error`
- `successMessage`

### Async login

`signIn(credentials)` calls the API outside Redux so the password never appears
in action metadata or Redux DevTools. The page dispatches `loginStarted`, then
`loginSucceeded` with user details or `loginFailed` with an error message.
`loadCurrentUser` is a thunk that calls `/api/v1/auth/me` when the app starts.

### State lifecycle

Login actions set `status` to `loading`, `authenticated`, or `unauthenticated`.
`loadCurrentUser` sets `status` to `checking` while the API verifies the cookie.
It restores the user on success and clears user state on a 401 response.

### Browser session

The API stores the session and sets an `HttpOnly` cookie. The client keeps only
the CSRF token in memory. A refresh calls `/api/v1/auth/me` to restore user
details and the CSRF token. Older `client-react-app.auth` storage is deleted.

## UI Loading Flow

### `src/store/uiSlice.js`

This file stores global loading state.

It uses:

- `activeRequestCount`

Reducers:

- `apiRequestStarted`
- `apiRequestFinished`

Selector:

- `selectIsApiLoading`

If `activeRequestCount > 0`, the app is considered loading.

## HTTP Client Integration

### `src/shared/api/httpClient.js`

This file dispatches loading actions before and after each request.

```js
storeDispatch?.(apiRequestStarted())
...
storeDispatch?.(apiRequestFinished())
```

Meaning:

- every request automatically affects global loading state
- no need to manually toggle the loader in each component

## Global Loader

### `src/shared/ui/GlobalLoader.jsx`

This component reads Redux state:

```js
const isLoading = useAppSelector(selectIsApiLoading)
```

If `isLoading` is true, it renders the loader overlay.

## Login Page Flow

### `src/pages/views/login.jsx`

This page still keeps local UI form state:

- username
- password
- remember
- field validation errors
- password visibility

But API/auth state is now Redux-managed.

It reads:

- `selectAuthStatus`
- `selectAuthError`
- `selectAuthSuccessMessage`

It calls `signIn(formValues)` and dispatches `loginStarted`, `loginSucceeded`
or `loginFailed`. It also dispatches `clearAuthFeedback` when fields change.

### Flow summary

1. user submits the form
2. page validates inputs locally
3. page calls `signIn` without putting credentials in a Redux action
4. API sets an `HttpOnly` session cookie
5. Redux updates auth state
6. UI re-renders from selectors

## How To Debug Manually

### If login is not working

Check these files in order:

1. `src/pages/views/login.jsx`
2. `src/store/authSlice.js`
3. `src/shared/api/httpClient.js`

Questions to ask:

- Is `signIn(formValues)` being called?
- Does the API set the session cookie and return `user` and `csrf_token`?
- Does `/api/v1/auth/me` restore the session after a refresh?
- Did `loginSucceeded` or `loginFailed` run?

### Safe debugging

Check response status, cookie attributes, and the presence of `user` and
`csrf_token` in browser developer tools. Do not log passwords, cookies, login
actions, request payloads, or authentication responses.

### If loader is not showing

Check:

1. `src/shared/api/httpClient.js`
2. `src/store/uiSlice.js`
3. `src/shared/ui/GlobalLoader.jsx`

Questions:

- Is `apiRequestStarted()` dispatched?
- Is `apiRequestFinished()` dispatched?
- Is `state.ui.activeRequestCount` greater than 0?

### Redux DevTools sequence

If Redux DevTools is enabled, a login request should usually show:

1. `auth/loginStarted`
2. `ui/apiRequestStarted`
3. `ui/apiRequestFinished`
4. `auth/loginSucceeded` or `auth/loginFailed`

## Mental Model

Use this simple model:

- pages dispatch actions
- slices update state
- selectors read state
- components re-render

More specifically:

- `Provider` exposes the store
- `dispatch(...)` sends an action
- reducers update the store
- `useAppSelector(...)` reads the store
- UI updates automatically

## Maintenance Tips

- Put shared app-wide state in Redux
- Keep temporary form typing/visibility state local in components
- Add a new slice when a new feature needs shared state
- Add selectors for anything multiple components need to read
- Keep API calls in thunks if the result should update Redux state

## Current Limitation

Build verification was not completed in this environment because the machine is using Node `16.20.2`, while this project requires Node `20.19+` or `22.12+`.
