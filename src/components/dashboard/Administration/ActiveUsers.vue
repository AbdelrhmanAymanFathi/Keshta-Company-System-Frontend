<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <PageHeader :title="$t('activeUsers.title')" :subtitle="$t('activeUsers.description')" />

    <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <h3 class="text-base font-semibold theme-text-primary">{{ $t('activeUsers.connectedUsers') }}</h3>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            :class="count > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 theme-text-muted'"
          >
            <span class="w-2 h-2 rounded-full" :class="count > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'"></span>
            {{ count }}
          </span>
        </div>
        <button
          @click="refresh"
          :disabled="loading"
          class="flex items-center gap-2 text-sm theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('activeUsers.refresh') }}
        </button>
      </div>

      <div v-if="loading && !users.length" class="p-6">
        <div v-for="n in 5" :key="n" class="animate-pulse h-4 rounded bg-slate-200 mb-3" :style="{ width: (100 - n * 10) + '%' }"></div>
      </div>

      <div v-else-if="!users.length" class="p-6 text-sm theme-text-muted text-center">
        {{ $t('activeUsers.empty') }}
      </div>

      <div v-else>
        <table v-app-table class="app-table divide-y divide-slate-200">
          <thead class="theme-table-thead-gradient">
            <tr>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('activeUsers.colName') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('activeUsers.colPage') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('activeUsers.colSince') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="u in users" :key="u.userId" class="theme-table-row-hover">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold text-white shrink-0"
                    :style="{ backgroundColor: colorFor(u.userId) }"
                  >
                    {{ initials(u.name) }}
                  </div>
                  <span class="text-sm font-medium theme-text-primary">{{ u.name || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-sm theme-text-secondary">
                <span v-if="u.page" class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium theme-text-secondary">
                  {{ pageLabel(u.page) }}
                </span>
                <span v-else class="text-xs theme-text-muted">{{ $t('activeUsers.noPage') }}</span>
              </td>
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatSince(u.since) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useActiveUsers } from '@/composables/useActiveUsers'

const PALETTE = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6']

export default {
  name: 'ActiveUsers',
  components: { PageHeader },
  setup() {
    const { locale, t } = useI18n()
    const { users, count, loading, refresh } = useActiveUsers()
    return { locale, t, users, count, loading, refresh }
  },
  computed: {
    isRTL() {
      return this.locale === 'ar'
    }
  },
  methods: {
    pageLabel(page) {
      const key = `activeUsers.pageLabels.${page}`
      const label = this.t(key)
      return label && label !== key ? label : page
    },
    formatSince(epochMs) {
      if (!epochMs) return '—'
      const d = new Date(epochMs)
      if (Number.isNaN(d.getTime())) return '—'
      return d.toLocaleTimeString(this.locale === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    initials(name) {
      const parts = (name || '?').trim().split(/\s+/)
      const first = parts[0]?.[0] ?? '?'
      const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
      return ((first + second).toUpperCase()) || '?'
    },
    colorFor(userId) {
      return PALETTE[userId % PALETTE.length]
    }
  }
}
</script>
