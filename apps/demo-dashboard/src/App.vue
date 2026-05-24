<script setup lang="ts">
import { ref } from 'vue'
import { applyThemePreset, recommendThemes, loadTheme } from '@acme/platform'

const query = ref('minimal SaaS dashboard')
const suggestions = ref(recommendThemes(query.value))
const active = ref(loadTheme().name)

function search() {
  suggestions.value = recommendThemes(query.value)
}

function apply(id: string) {
  const next = applyThemePreset(id)
  active.value = next.name
}
</script>

<template>
  <div class="min-h-screen p-8 theme-typography-transition" style="font-family: var(--theme-font-family)">
    <header class="theme-card-header rounded-xl p-6 mb-6">
      <h1 class="text-xl font-bold theme-text-light">@acme/platform Demo</h1>
      <p class="text-sm theme-text-light-secondary">Runtime UI OS — switch full product identity instantly</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <section class="rounded-xl border bg-white p-4 shadow-sm">
        <h2 class="font-semibold mb-2">Theme Bot</h2>
        <form class="flex gap-2" @submit.prevent="search">
          <input v-model="query" class="flex-1 border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" class="theme-button rounded-lg px-4 py-2 text-sm">Suggest</button>
        </form>
        <ul class="mt-3 space-y-2">
          <li v-for="s in suggestions" :key="s.presetId">
            <button
              type="button"
              class="w-full text-left border rounded-lg px-3 py-2 hover:bg-slate-50"
              @click="apply(s.presetId!)"
            >
              {{ s.name }} — {{ Math.round(s.confidence * 100) }}%
            </button>
          </li>
        </ul>
      </section>

      <section class="rounded-xl border bg-white p-4 shadow-sm">
        <h2 class="font-semibold mb-2">Active theme</h2>
        <p class="text-sm theme-text-secondary">{{ active }}</p>
        <div class="theme-button inline-block mt-4 rounded-lg px-4 py-2 text-sm">Sample action</div>
      </section>
    </div>
  </div>
</template>
