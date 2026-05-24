<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="settings-shell theme-typography-transition">
    <div class="settings-panel responsive-stack">
      <div class="app-page-header theme-header theme-animated-surface theme-glow rounded-2xl border border-gray-100 p-5 shadow-lg">
        <div>
          <h1 class="text-2xl font-semibold theme-heading mb-2">{{ $t('themeStudio.title') }}</h1>
          <p class="text-sm theme-text-secondary">{{ $t('themeStudio.subtitle') }}</p>
        </div>
      </div>

      <div class="responsive-grid">
        <!-- Theme Bot chat -->
        <div class="settings-card">
          <div class="theme-card-header px-6 py-4">
            <h2 class="text-lg font-bold theme-text-light">{{ $t('themeStudio.botTitle') }}</h2>
          </div>
          <div class="settings-card__body flex min-h-[24rem] max-h-[min(34rem,70dvh)] flex-col">
            <div ref="chatScroll" class="flex-1 overflow-y-auto space-y-3 mb-3 app-scrollbar">
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                :class="msg.role === 'user' ? 'text-end' : 'text-start'"
              >
                <div
                  :class="[
                    'inline-block max-w-[90%] rounded-2xl px-4 py-2 text-sm',
                    msg.role === 'user'
                      ? 'theme-button'
                      : 'bg-slate-100 theme-text-primary'
                  ]"
                >
                  {{ msg.text }}
                </div>
              </div>
            </div>
            <form class="settings-control-row" @submit.prevent="sendPrompt">
              <input
                v-model="prompt"
                type="text"
                class="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm theme-input-focus"
                :placeholder="$t('themeStudio.placeholder')"
              />
              <button type="submit" class="theme-button rounded-xl px-4 py-2 text-sm font-medium">
                {{ $t('themeStudio.send') }}
              </button>
            </form>
          </div>
        </div>

        <!-- Suggestions & preview -->
        <div class="responsive-stack">
          <div v-if="suggestions.length" class="settings-card settings-card__body space-y-3">
            <h3 class="text-sm font-semibold theme-label">{{ $t('themeStudio.suggestions') }}</h3>
            <article
              v-for="s in suggestions"
              :key="s.presetId"
              class="rounded-xl border border-gray-200 p-4 hover:theme-hover-soft transition"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="font-semibold theme-text-primary">{{ s.name }}</h4>
                  <p class="text-xs theme-caption mt-1">{{ s.description }}</p>
                </div>
                <span class="text-xs font-mono theme-accent-strong">{{ Math.round(s.confidence * 100) }}%</span>
              </div>
              <div class="mt-3 flex flex-wrap gap-2 text-xs">
                <span
                  class="rounded-lg px-2 py-1 theme-dashboard-bg-soft theme-text-secondary"
                  :style="{ borderLeft: `3px solid ${s.preview.colors}` }"
                >
                  {{ s.preview.typography }}
                </span>
                <span class="rounded-lg px-2 py-1 bg-slate-100 theme-text-muted">{{ s.preview.iconPack }}</span>
                <span class="rounded-lg px-2 py-1 bg-slate-100 theme-text-muted">{{ s.preview.sidebarType }}</span>
              </div>
              <ul class="mt-2 text-xs theme-caption list-disc ps-4 space-y-0.5">
                <li v-for="(r, i) in s.reasons" :key="i">{{ r }}</li>
              </ul>
              <button
                type="button"
                class="theme-button mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium"
                @click="applySuggestion(s)"
              >
                {{ $t('themeStudio.apply') }}
              </button>
            </article>
          </div>

          <div class="settings-card settings-card__body">
            <h3 class="text-sm font-semibold theme-label mb-3">{{ $t('themeStudio.compare') }}</h3>
            <div class="settings-option-grid">
              <button
                v-for="preset in presetThemes"
                :key="preset.id"
                type="button"
                class="rounded-xl border px-3 py-2 text-start text-sm transition"
                :class="activePresetId === preset.id ? 'theme-selected border-transparent' : 'border-gray-200 hover:theme-hover-soft'"
                @click="previewPreset(preset.id)"
              >
                <span class="font-semibold theme-text-primary block">{{ preset.name }}</span>
                <span class="text-xs theme-caption">{{ preset.description }}</span>
              </button>
            </div>
          </div>

          <div class="settings-actions">
            <button type="button" class="theme-button rounded-lg px-4 py-2 text-sm" @click="exportPreset">
              {{ $t('themeStudio.export') }}
            </button>
            <label class="rounded-lg border border-gray-200 px-4 py-2 text-sm cursor-pointer hover:theme-hover-soft theme-text-secondary">
              {{ $t('themeStudio.import') }}
              <input type="file" accept="application/json" class="hidden" @change="importPreset" />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  recommendThemes,
  applyThemePreset,
  getPresetThemeList,
  exportThemePreset,
  importThemePreset,
  loadTheme
} from '@acme/platform'

export default {
  name: 'ThemeStudioView',
  setup() {
    const { t, locale } = useI18n()
    const prompt = ref('')
    const messages = ref([
      { role: 'bot', text: t('themeStudio.welcome') }
    ])
    const suggestions = ref([])
    const activePresetId = ref(loadTheme().id || '')
    const chatScroll = ref(null)
    const presetThemes = getPresetThemeList()

    const isRTL = computed(() => locale.value === 'ar')

    async function scrollChat() {
      await nextTick()
      if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight
    }

    function sendPrompt() {
      const q = prompt.value.trim()
      if (!q) return
      messages.value.push({ role: 'user', text: q })
      prompt.value = ''
      const results = recommendThemes(q)
      suggestions.value = results
      const top = results[0]
      messages.value.push({
        role: 'bot',
        text: top
          ? t('themeStudio.botReply', { name: top.name, confidence: Math.round(top.confidence * 100) })
          : t('themeStudio.botNoMatch')
      })
      scrollChat()
    }

    function applySuggestion(s) {
      if (s.presetId) applyThemePreset(s.presetId)
      else if (s.theme) importThemePreset(JSON.stringify(s.theme))
      activePresetId.value = s.presetId || loadTheme().id
      messages.value.push({ role: 'bot', text: t('themeStudio.applied', { name: s.name }) })
      scrollChat()
    }

    function previewPreset(id) {
      applyThemePreset(id)
      activePresetId.value = id
    }

    function exportPreset() {
      const blob = new Blob([exportThemePreset()], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'keshta-theme.json'
      a.click()
      URL.revokeObjectURL(url)
    }

    function importPreset(e) {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          importThemePreset(reader.result)
          activePresetId.value = loadTheme().id
          messages.value.push({ role: 'bot', text: t('themeStudio.imported') })
        } catch {
          messages.value.push({ role: 'bot', text: t('themeStudio.importError') })
        }
        scrollChat()
      }
      reader.readAsText(file)
    }

    return {
      prompt,
      messages,
      suggestions,
      presetThemes,
      activePresetId,
      chatScroll,
      isRTL,
      sendPrompt,
      applySuggestion,
      previewPreset,
      exportPreset,
      importPreset
    }
  }
}
</script>
