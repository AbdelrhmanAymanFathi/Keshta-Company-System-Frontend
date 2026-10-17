<template>
  <div class="startup-intro">
    <!-- Non-blocking brand splash: fades in and out, never intercepts clicks -->
    <div
      v-if="showIntroAnimation && !introAnimationDone"
      class="startup-intro__splash"
      aria-hidden="true"
      @animationend="finishIntroAnimation"
    >
      <div class="startup-intro__glow"></div>
      <img class="startup-intro__logo" :src="logoUrl" alt="" />
      <p class="startup-intro__brand">{{ $t('intro.brand') }}</p>
      <div class="startup-intro__bar"><span></span></div>
    </div>

    <!-- Autoplay fallback: discreet button shown only when the browser blocked us -->
    <button
      v-if="introBlocked && introEnabled"
      type="button"
      class="startup-intro__play"
      @click="onPlayClick"
    >
      <svg class="startup-intro__play-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
      </svg>
      <span>{{ $t('intro.playButton') }}</span>
    </button>
  </div>
</template>

<script>
import logoUrl from '@/assets/logo.png'
import {
  introEnabled,
  introBlocked,
  showIntroAnimation,
  introAnimationDone,
  finishIntroAnimation,
  startIntroIfNeeded,
  playIntroManually,
} from '@/composables/useStartupIntro'

export default {
  name: 'StartupIntroOverlay',
  setup() {
    function onPlayClick() {
      playIntroManually()
    }
    return {
      logoUrl,
      introEnabled,
      introBlocked,
      showIntroAnimation,
      introAnimationDone,
      finishIntroAnimation,
      onPlayClick,
    }
  },
  mounted() {
    // Fire-and-forget: playback never blocks rendering or navigation.
    startIntroIfNeeded()
  },
}
</script>

<style scoped>
.startup-intro__splash {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.75rem;
  padding: 1rem;
  text-align: center;
  overflow: hidden;
  pointer-events: none;
  animation: startup-splash 3.6s ease forwards;
}

.startup-intro__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(var(--theme-primary-rgb, 15, 23, 42), 0.12),
    transparent 62%
  );
}

.startup-intro__logo {
  position: relative;
  width: clamp(140px, 22vw, 250px);
  height: auto;
  animation: startup-logo 3.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  filter: drop-shadow(0 18px 34px rgba(15, 23, 42, 0.22));
}

.startup-intro__brand {
  position: relative;
  margin: 0;
  font-size: clamp(0.95rem, 2.4vw, 1.5rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--theme-text-primary, #0f172a);
  animation: startup-brand 3.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.startup-intro__bar {
  position: relative;
  width: clamp(160px, 26vw, 300px);
  height: 3px;
  border-radius: 9999px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.12);
}

.startup-intro__bar span {
  display: block;
  height: 100%;
  width: 100%;
  transform-origin: left center;
  background: linear-gradient(90deg, rgba(var(--theme-primary-rgb, 15, 23, 42), 0.15), rgb(var(--theme-primary-rgb, 15, 23, 42)));
  animation: startup-bar 3.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.startup-intro__play {
  position: fixed;
  z-index: 10000;
  bottom: 1rem;
  inset-inline-end: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.2s ease, background 0.2s ease;
  animation: startup-fade-in 0.4s ease;
}

.startup-intro__play:hover {
  transform: translateY(-2px);
  background: rgba(15, 23, 42, 0.96);
}

.startup-intro__play:focus-visible {
  outline: 2px solid rgb(var(--theme-primary-rgb, 59, 130, 246));
  outline-offset: 2px;
}

.startup-intro__play-icon {
  width: 0.85rem;
  height: 0.85rem;
}

@keyframes startup-splash {
  0% { opacity: 0; }
  10% { opacity: 1; }
  72% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes startup-logo {
  0% { opacity: 0; transform: scale(0.86) translateY(10px); }
  18% { opacity: 1; transform: scale(1) translateY(0); }
  74% { opacity: 1; transform: scale(1.02) translateY(0); }
  100% { opacity: 0; transform: scale(1.05) translateY(-4px); }
}

@keyframes startup-brand {
  0% { opacity: 0; letter-spacing: 0.24em; }
  20% { opacity: 1; letter-spacing: 0.06em; }
  74% { opacity: 1; letter-spacing: 0.06em; }
  100% { opacity: 0; letter-spacing: 0.14em; }
}

@keyframes startup-bar {
  0% { transform: scaleX(0); opacity: 0.2; }
  16% { opacity: 1; }
  78% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1); opacity: 0; }
}

@keyframes startup-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .startup-intro__splash,
  .startup-intro__logo,
  .startup-intro__brand,
  .startup-intro__bar span {
    animation-duration: 1.6s;
  }
}
</style>
