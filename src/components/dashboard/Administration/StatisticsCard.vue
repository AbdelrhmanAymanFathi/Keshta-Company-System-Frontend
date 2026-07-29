<template>
  <div
    class="relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/50"
    @click="$emit('click')"
  >
    <div v-if="loading" class="animate-pulse space-y-3">
      <div class="flex items-center justify-between">
        <div class="h-4 w-24 rounded bg-slate-200" />
        <div class="h-10 w-10 rounded-xl bg-slate-200" />
      </div>
      <div class="h-8 w-28 rounded bg-slate-200" />
      <div class="flex items-center gap-2">
        <div class="h-3 w-16 rounded bg-slate-200" />
        <div class="h-8 w-20 rounded bg-slate-200" />
      </div>
    </div>

    <template v-else-if="error">
      <div class="flex flex-col items-center justify-center py-4 text-center">
        <svg class="w-8 h-8 text-red-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs text-red-400">{{ error }}</p>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium theme-text-secondary truncate">
          {{ title }}
        </p>
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl"
          :class="iconBgClass"
        >
          <svg class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="iconPath"></svg>
        </div>
      </div>

      <p class="text-2xl font-bold theme-text-primary mb-1">
        {{ formattedValue }}
      </p>

      <div class="flex items-center gap-2">
        <StatTrend
          v-if="trend !== null && trend !== undefined"
          :value="trend"
          :direction="trend >= 0 ? 'up' : 'down'"
          :invert="trendInvert"
        />
        <span v-if="trendLabel" class="text-xs theme-text-muted">{{ trendLabel }}</span>

        <div v-if="sparklineData && sparklineData.length > 0" class="ml-auto">
          <Sparkline
            :data="sparklineData"
            :color="sparklineColor"
            :height="40"
            :width="80"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import Sparkline from './Sparkline.vue'
import StatTrend from './StatTrend.vue'

const ICON_PATHS = {
  wallet: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />',
  chart: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />',
  currency: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
  clipboard: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />',
  building: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />',
  users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />',
  document: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />',
  truck: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25c0-2.828-2.172-6.444-4.688-7.5l-1.042-.416a.375.375 0 00-.27 0l-1.042.416C11.172 4.806 9 8.422 9 11.25v.75m-3 0v5.25" />',
  check: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
  exclamation: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />',
  settings: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />',
  scale: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.97zm-13.5 0A48.584 48.584 0 0112 4.5c2.291 0 4.545.16 6.75.47m-13.5 0L3.63 15.196c-.122.5.106 1.028.589 1.202a5.988 5.988 0 002.031.352 5.988 5.988 0 002.031-.352c.483-.174.711-.703.589-1.202L5.25 4.97z" />'
}

export default {
  name: 'StatisticsCard',
  components: { Sparkline, StatTrend },
  props: {
    title: { type: String, default: '' },
    value: { type: [Number, String], default: null },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    icon: { type: String, default: 'chart' },
    color: { type: String, default: 'indigo' },
    trend: { type: Number, default: null },
    trendLabel: { type: String, default: '' },
    trendInvert: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    sparklineData: { type: Array, default: null },
    sparklineColor: { type: String, default: '#6366f1' }
  },
  emits: ['click'],
  computed: {
    iconPath() {
      return ICON_PATHS[this.icon] || ICON_PATHS.chart
    },
    formattedValue() {
      if (this.value === null || this.value === undefined) return '—'
      if (typeof this.value === 'number' && !Number.isInteger(this.value)) {
        return `${this.prefix}${this.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${this.suffix}`
      }
      if (typeof this.value === 'number') {
        return `${this.prefix}${this.value.toLocaleString()}${this.suffix}`
      }
      return `${this.prefix}${this.value}${this.suffix}`
    },
    colorClasses() {
      const map = {
        indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600' },
        sky: { bg: 'bg-sky-100', icon: 'text-sky-600' },
        amber: { bg: 'bg-amber-100', icon: 'text-amber-600' },
        rose: { bg: 'bg-rose-100', icon: 'text-rose-600' },
        violet: { bg: 'bg-violet-100', icon: 'text-violet-600' },
        cyan: { bg: 'bg-cyan-100', icon: 'text-cyan-600' },
        slate: { bg: 'bg-slate-100', icon: 'text-slate-600' }
      }
      return map[this.color] || map.indigo
    },
    iconBgClass() {
      return this.colorClasses.bg
    },
    iconColorClass() {
      return this.colorClasses.icon
    }
  }
}
</script>
