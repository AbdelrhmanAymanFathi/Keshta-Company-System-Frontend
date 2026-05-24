<script setup lang="ts">
import { getPresetThemeList } from '@acme/ui-presets'

const presets = getPresetThemeList()
</script>

<template>
  <div class="max-w-3xl mx-auto p-8 font-sans">
    <h1 class="text-3xl font-bold mb-2">ACME UI Platform</h1>
    <p class="text-slate-600 mb-8">Runtime UI Operating System for Vue 3 enterprise dashboards.</p>

    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-3">Packages</h2>
      <ul class="list-disc pl-5 space-y-1 text-sm">
        <li><code>@acme/theme-engine</code> — core runtime, CSS vars, persistence, plugins</li>
        <li><code>@acme/icon-packs</code> — semantic icons, lazy packs</li>
        <li><code>@acme/layout-engine</code> — sidebar / layout modes</li>
        <li><code>@acme/motion-engine</code> — animation presets</li>
        <li><code>@acme/theme-ai</code> — rule-based theme recommendations</li>
        <li><code>@acme/ui-presets</code> — ERP / SaaS / cyber personalities</li>
        <li><code>@acme/platform</code> — bootstrap wiring all engines</li>
      </ul>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-3">Presets</h2>
      <div class="grid gap-3">
        <article v-for="p in presets" :key="p.id" class="border rounded-lg p-4">
          <h3 class="font-medium">{{ p.name }}</h3>
          <p class="text-sm text-slate-600">{{ p.description }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
