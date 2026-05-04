# Copilot Instructions

## Build, lint, and test commands

- Install dependencies with `npm install`.
- Start the Vue CLI dev server with `npm run serve`.
- Create a production build with `npm run build`.
- Run ESLint with `npm run lint`.
- There is currently no supported test command to document. The repository has Jest-style specs in `tests/unit`, but `package.json` does not define a `test` or `test:unit` script and does not include a unit-test runner dependency, so there is no repo-supported full-suite or single-test command yet.
- The current lint baseline is not clean: `src/validators/extracts.js` has a duplicate `total` key and the Jest-style specs in `tests/unit` are linted without Jest globals.

## High-level architecture

- `src/main.js` is the SPA bootstrap. It creates the Vue app, registers Pinia, Vue Query, i18n, and the router, initializes auth state early, and imports `src/api.js` for global token/interceptor setup. `src/App.vue` stays thin and only wraps the routed app with initial auth loading plus global `Toast` and `ErrorOverlay` components.
- Routing is organized around one protected dashboard shell in `src/router/index.js` and `src/views/Dashboard.vue`. Most application features live as lazy-loaded children under `/dashboard`, grouped into supplies, transport, equipment, extracts, company wallet, admin, and profile routes. The dashboard view owns the top-level module menu, side navigation, dynamic report links, and persisted sidebar state.
- Authentication is split across `src/api.js`, `src/auth.js`, `src/composables/authStore.js`, `src/composables/useAuth.js`, and router guards. `auth.js` is a singleton manager that notifies listeners; `authStore.js` exposes reactive refs for route guards and app startup; `useAuth()` is the component-facing composable. Tokens and user state are stored in `localStorage`, 401 responses try a refresh/retry path, and refresh failure triggers logout and redirect.
- Most API calls still live in the large `src/api.js` module, which also centralizes token management, auth refresh, axios defaults, and response interceptors. Newer extracts code adds a narrower service layer in `src/services/extracts.js` and a Vue Query mutation wrapper in `src/composables/useCreateExtract.js`, so the codebase currently mixes older direct-API usage with newer service/composable patterns.
- The app expects the frontend and backend to run together during development. `vue.config.js` proxies `/api` to `http://127.0.0.1:8080`, and the dev server websocket host is built from `VUE_APP_PUBLIC_IP`, so local Docker/remote-browser work often depends on matching `.env` values.
- Error handling includes two user-facing global channels: `src/components/shared/Toast.vue` exposes `window.$toast(...)`, while `src/components/shared/ErrorOverlay.vue` listens for `app:error` events. `src/api.js` dispatches `app:error` for backend 502 responses so already-loaded SPA sessions show an overlay instead of failing silently.

## Key conventions

- `mode` is a cross-file contract, not just a component prop. Router child routes pass values such as `supply`, `transport`, `equipmentLogs`, `extracts`, and `extract`, and shared screens branch on that value to change labels, columns, validation, pricing fields, API filters, and statement behavior. When changing a reused dashboard screen, keep the router props, component defaults, and API query parameters aligned.
- Backend payloads are not uniform. Reuse the existing normalization paths instead of assuming one response shape: item data may arrive in camelCase or snake_case (`src/utils/normalizeItem.js`), and paginated endpoints may return `{ items, meta }`, `{ items, total, pageSize }`, `{ data }`, or plain arrays (`src/composables/usePagination.js` and several Pinia stores already handle these variations).
- Some delete flows are intentionally idempotent. Equipment log and payout deletes treat backend 404 responses as "already deleted" and refresh the list instead of surfacing a hard failure. Preserve that behavior when touching delete code or API wrappers.
- Locale handling is global and affects layout. `app-locale` is persisted in `localStorage`, and `main.js`, `App.vue`, and router guards all update `<html lang>` and `dir` so Arabic works in RTL mode. Changes to layout, spacing, or menu behavior usually need to work in both `en` and `ar`.
- The dashboard shell derives navigation from route names and module mappings in `src/views/Dashboard.vue` rather than from filesystem structure. If you add a new dashboard page, update both the router child route and the dashboard menu map, or the page will be routable but unreachable from the UI.
- Extract creation follows a newer pattern than much of the rest of the app: Zod validation lives in `src/validators/extracts.js`, request idempotency is expressed with an `Idempotency-Key` header in `src/services/extracts.js`, and cache invalidation happens through Vue Query in `src/composables/useCreateExtract.js`. Prefer extending that pattern in extracts code instead of copying older modal/store-only flows.
