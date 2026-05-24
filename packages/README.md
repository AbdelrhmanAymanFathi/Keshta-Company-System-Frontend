# ACME UI Platform — Monorepo

Runtime UI Operating System for Vue 3 + Tailwind dashboards. Powers ERP, SaaS, admin, and white-label products with **zero-reload** theme switching.

## Architecture

```
packages/
  theme-engine/    Core runtime: applyTheme, store, plugins, CSS variables
  icon-packs/      Semantic icon resolver + lazy Heroicons/Lucide/Phosphor/Remix/Futuristic
  layout-engine/   Sidebar layouts: static, overlay, slim, slim+, reveal, drawer, horizontal
  motion-engine/   Animation presets + reduced-motion support
  theme-ai/        Rule-based theme bot (AI-ready pipeline)
  ui-presets/      Corporate ERP, Modern Startup, Construction, Cyber, Minimal
  platform/        Bootstrap: wires all plugins via themeEngine.use()

apps/
  demo-dashboard/  Minimal Vite demo
  docs-site/       Package overview

src/               Keshta production app (Vue CLI) — consumes @acme/platform
```

## Plugin system

```ts
import { themeEngine } from '@acme/theme-engine'
import { iconPlugin } from '@acme/icon-packs'
import { layoutPlugin } from '@acme/layout-engine'
import { motionPlugin } from '@acme/motion-engine'

themeEngine.use(iconPlugin).use(layoutPlugin).use(motionPlugin)
await themeEngine.applyTheme({ primary: '#2563eb', iconPack: 'lucide' })
```

Or use the bootstrap:

```ts
import { applyThemePreset, recommendThemes } from '@acme/platform'

applyThemePreset('cyber-futuristic')
recommendThemes('minimal clean SaaS UI')
```

## Theme object

```ts
{
  id, name, personality,
  primary, typography, animation,
  iconPack, sidebarType,
  radius, density, shadows, effects
}
```

## Icons (semantic only)

```vue
<ThemeIcon name="vehicle" />
```

```ts
import { PlusIcon } from '@acme/icon-packs/legacy' // pack-aware, never @heroicons/vue
```

## Scripts

```bash
npm install
npm run serve          # Keshta dashboard (Vue CLI)
npm run build          # Production build
npm run demo           # demo-dashboard (Vite)
npm run docs           # docs-site (Vite)
```

## Design decisions

| Decision | Rationale |
|----------|-----------|
| Plugin architecture | Isolates icons, layout, motion — lazy-loadable, extensible |
| `@acme/platform` bootstrap | Single import for apps; engines stay decoupled |
| TypeScript packages + JS app | Incremental migration; Vue CLI consumes TS via transpileDependencies |
| Package-only runtime imports | Production app code consumes `@acme/*` APIs directly |
| CSS variables | Runtime updates without rebundling Tailwind |
| `themeRevision` / `iconRevision` | Minimal reactive invalidation, no full-tree re-renders |

## White-label / export

```ts
import { exportThemePreset, importThemePreset } from '@acme/platform'
const json = exportThemePreset()
importThemePreset(json)
```

## Future: Theme Studio

UI layer stays decoupled — import `@acme/theme-ai` + `@acme/platform` in any Vue app. No engine logic in views.
