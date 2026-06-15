# Copilot Instructions

## Build, lint, and test commands

- Install dependencies w/ `npm install`.
- Start Vue CLI dev server w/ `npm run serve`.
- Create production build w/ `npm run build`.
- Run ESLint w/ `npm run lint`.
- There is currently no supported test command to document. repo has Jest-style specs in `tests/unit` `package.json` does not define `test`  `test:unit` script and does not include unit-test runner dependency, so there is no repo-supported full-suite or single-test command yet.
-  current lint baseline is not clean: `src/validators/extracts.js` has duplicate `total` key and Jest-style specs in `tests/unit` are linted w/o Jest globals.

## High-level architecture

- `src/main.js` is SPA bootstrap. It creates Vue app, registers Pinia, Vue Query, i18n, and router, initializes auth state early, and imports `src/api.js` for global token/interceptor setup. `src/App.vue` stays thin and only wraps routed app w/ initial auth loading plus global `Toast`  `ErrorOverlay` components.
- Routing is organized around one protected dashboard shell in `src/router/index.js`  `src/views/Dashboard.vue`. Most application features live as lazy-loaded children under `/dashboard`grouped into supplies, transport, equipment, extracts, company wallet, admin, and profile routes. dashboard view owns top-level module menu, side navigation, dynamic report links, and persisted sidebar state.
- Authentication is split across `src/api.js` `src/auth.js` `src/composables/authStore.js` `src/composables/useAuth.js`and router guards. `auth.js` is singleton manager that notifies listeners; `authStore.js` exposes reactive refs for route guards and app startup; `useAuth()` is component-facing composable. Tokens and user state are stored in `localStorage`401 responses try refresh/retry path, and refresh failure triggers logout and redirect.
- Most API calls still live in large `src/api.js` module, which also centralizes token management, auth refresh, axios defaults, and response interceptors. Newer extracts code adds narrower service layer in `src/services/extracts.js` and Vue Query mutation wrapper in `src/composables/useCreateExtract.js`so codebase currently mixes older direct-API usage w/ newer service/composable patterns.
-  app expects frontend and backend to run together during development. `vue.config.js` proxies `/api` to `http://127.0.0.1:8080`and dev server websocket host is built from `VUE_APP_PUBLIC_IP`so local Docker/remote-browser work often depends on matching `.env` values.
- Error handling includes two user-facing global channels: `src/components/shared/Toast.vue` exposes `window.$toast(...)`while `src/components/shared/ErrorOverlay.vue` listens for `app:error` events. `src/api.js` dispatches `app:error` for backend 502 responses so already-loaded SPA sessions show overlay instead of failing silently.

## Key conventions

- `mode` is cross-file contract, not component prop. Router child routes pass values such as `supply` `transport` `equipmentLogs` `extracts` `extract`and shared screens branch on that value to change labels, columns, validation, pricing fields, API filters, and statement behavior. When changing reused dashboard screen, keep router props, component defaults, and API query parameters aligned.
- Backend payloads are not uniform. Reuse existing normalization paths instead of assuming one response shape: item data may arrive in camelCase or snake_case (`src/utils/normalizeItem.js`), and paginated endpoints may return `{ items, meta }` `{ items, total, pageSize }` `{ data }`or plain arrays (`src/composables/usePagination.js` and several Pinia stores already handle these variations).
- Some delete flows are intentionally idempotent. Equipment log and payout deletes treat backend 404 responses as "already deleted" and refresh list instead of surfacing hard failure. Preserve that behavior when touching delete code or API wrappers.
- Locale handling is global and affects layout. `app-locale` is persisted in `localStorage` `main.js` `App.vue`and router guards all update `<html lang>`  `dir` so Arabic works in RTL mode. Changes to layout, spacing, or menu behavior usually need to work in both `en`  `ar`.
-  dashboard shell derives navigation from route names and module mappings in `src/views/Dashboard.vue` rather than from filesystem structure. If you add new dashboard page, update both router child route and dashboard menu map, or page will be routable but unreachable from UI.
- Extract creation follows newer pattern than much of rest of app: Zod validation lives in `src/validators/extracts.js`request idempotency is expressed w/ `Idempotency-Key` header in `src/services/extracts.js`and cache invalidation happens through Vue Query in `src/composables/useCreateExtract.js`. Prefer extending that pattern in extracts code instead of copying older modal/store-only flows.

