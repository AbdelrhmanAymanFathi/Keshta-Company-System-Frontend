<template>
  <section class="app-loader" role="status" aria-live="polite" :aria-label="label">
    <div class="app-loader__halo" aria-hidden="true"></div>

    <div class="app-loader__content">
      <div class="app-loader__mark" aria-hidden="true">
        <span class="app-loader__ring app-loader__ring--outer"></span>
        <span class="app-loader__ring app-loader__ring--inner"></span>
        <img class="app-loader__logo" :src="logoUrl" alt="" />
      </div>

      <div class="app-loader__text">
        <p class="app-loader__brand">Keshta Company</p>
        <p class="app-loader__label">{{ label }}</p>
      </div>

      <div class="app-loader__progress" aria-hidden="true">
        <span></span>
      </div>
    </div>
  </section>
</template>

<script>
import logoUrl from '@/assets/logo.png'

export default {
  name: 'AppLoader',
  props: {
    label: {
      type: String,
      default: 'Loading'
    }
  },
  setup() {
    return { logoUrl }
  }
}
</script>

<style scoped>
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  min-height: 100dvh;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgb(248 250 252) 0%, rgba(var(--theme-primary-rgb), 0.08) 48%, rgb(255 255 255) 100%);
  color: var(--theme-text-primary);
}

.app-loader__halo {
  position: absolute;
  width: min(42rem, 90vw);
  aspect-ratio: 1;
  border-radius: 9999px;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.88) 0 22%, rgba(var(--theme-primary-rgb), 0.16) 38%, transparent 68%),
    conic-gradient(from 160deg, rgba(var(--theme-primary-rgb), 0.28), rgba(20, 184, 166, 0.12), rgba(245, 158, 11, 0.12), rgba(var(--theme-primary-rgb), 0.28));
  filter: blur(22px);
  opacity: 0.72;
  animation: loader-halo-breathe 3.2s ease-in-out infinite;
}

.app-loader__content {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 1.1rem;
  width: min(100%, 20rem);
  padding: 1.25rem;
}

.app-loader__mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 8.25rem;
  aspect-ratio: 1;
}

.app-loader__ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 1px solid rgba(var(--theme-primary-rgb), 0.16);
}

.app-loader__ring--outer {
  background:
    conic-gradient(from 0deg, transparent 0 18%, rgba(var(--theme-primary-rgb), 0.9), rgba(20, 184, 166, 0.82), transparent 68%),
    linear-gradient(#ffffff, #ffffff) padding-box;
  border: 2px solid transparent;
  mask: linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: loader-spin 1.45s linear infinite;
}

.app-loader__ring--inner {
  inset: 0.62rem;
  border-style: dashed;
  border-color: rgba(var(--theme-primary-rgb), 0.32);
  animation: loader-spin 4.2s linear infinite reverse;
}

.app-loader__logo {
  position: relative;
  width: 5.15rem;
  height: 5.15rem;
  object-fit: contain;
  border-radius: 1.1rem;
  padding: 0.62rem;
  background: rgba(255, 255, 255, 0.9);
  box-shadow:
    0 18px 44px rgba(15, 23, 42, 0.14),
    0 0 0 1px rgba(var(--theme-primary-rgb), 0.12);
  animation: loader-logo-float 2.4s ease-in-out infinite;
}

.app-loader__text {
  display: grid;
  gap: 0.25rem;
  text-align: center;
}

.app-loader__brand {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--theme-heading-color);
}

.app-loader__label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--theme-text-secondary);
}

.app-loader__progress {
  width: min(12rem, 72vw);
  height: 0.28rem;
  overflow: hidden;
  border-radius: 9999px;
  background: rgba(var(--theme-primary-rgb), 0.12);
}

.app-loader__progress span {
  display: block;
  width: 45%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--theme-primary), rgb(20 184 166), rgb(245 158 11));
  animation: loader-progress 1.35s ease-in-out infinite;
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loader-logo-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-0.22rem) scale(1.025);
  }
}

@keyframes loader-halo-breathe {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.58;
  }
  50% {
    transform: scale(1.04);
    opacity: 0.8;
  }
}

@keyframes loader-progress {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(240%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-loader__halo,
  .app-loader__ring,
  .app-loader__logo,
  .app-loader__progress span {
    animation: none;
  }
}
</style>
