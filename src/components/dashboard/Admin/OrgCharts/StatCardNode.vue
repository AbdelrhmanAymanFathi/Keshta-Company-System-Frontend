<template>
  <div
    class="org-chart-node w-60 rounded-2xl border bg-white shadow-sm transition-all duration-200 cursor-pointer select-none"
    :class="cardClass"
    @click.stop="handleClick"
  >
    <Handle type="target" :position="Position.Top" class="!bg-emerald-500 !border-emerald-600" />

    <div class="p-3 flex items-start gap-2.5">
      <span
        class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border"
        :class="iconClass"
      >
        <component :is="iconComponent" class="w-5 h-5" />
      </span>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold text-slate-800 truncate" :title="data.title">
          {{ data.title }}
        </p>
        <p v-if="data.subtitle" class="text-[11px] theme-text-secondary truncate mt-0.5" :title="data.subtitle">
          {{ data.subtitle }}
        </p>
      </div>

      <ShadcnButton variant="outline" size="native"
        v-if="data.loading"
        type="button"
        disabled
        class="w-6 h-6 shrink-0 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center"
        :title="$t('orgCharts.loadingChildren')"
      >
        <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </ShadcnButton>
      <ShadcnButton variant="outline" size="native"
        v-else-if="data.hasChildren"
        type="button"
        class="w-6 h-6 shrink-0 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-transform duration-200"
        :class="{ 'rotate-90': !data.collapsed }"
        :title="data.collapsed ? $t('orgCharts.expand') : $t('orgCharts.collapse')"
        @click.stop="data.onToggle && data.onToggle(id)"
      >
        <svg class="w-3.5 h-3.5" :class="$i18n.locale === 'ar' ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </ShadcnButton>
    </div>

    <div v-if="data.badge" class="px-3 pb-2">
      <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" :class="badgeClass">
        {{ data.badge }}
      </span>
    </div>

    <div v-if="data.stats && data.stats.length" class="px-3 pb-3 space-y-1">
      <div
        v-for="(stat, i) in data.stats"
        :key="i"
        class="flex items-center justify-between text-[11px] bg-slate-50 rounded-lg px-2 py-1"
      >
        <span class="theme-text-secondary">{{ stat.label }}</span>
        <span class="font-bold text-slate-700">{{ stat.value }}</span>
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" class="!bg-emerald-500 !border-emerald-600" />
  </div>
</template>

<script>
import { Handle, Position } from '@vue-flow/core'
import {
  BuildingOffice2Icon,
  TruckIcon,
  DocumentTextIcon,
  CubeIcon,
  UserGroupIcon,
  BanknotesIcon,
  WalletIcon,
  Square3Stack3DIcon
} from '@heroicons/vue/24/outline'

const TONE_ICONS = {
  root: BuildingOffice2Icon,
  transport: TruckIcon,
  extracts: DocumentTextIcon,
  supplies: CubeIcon,
  equipment: Square3Stack3DIcon,
  contractor: UserGroupIcon,
  treasury: BanknotesIcon,
  custody: WalletIcon,
  expenses: BanknotesIcon,
  other: CubeIcon
}

const TONE_STYLES = {
  root: {
    card: 'border-slate-300 ring-1 ring-slate-200',
    icon: 'bg-slate-100 text-slate-700 border-slate-200',
    badge: 'bg-slate-100 text-slate-700'
  },
  transport: {
    card: 'border-emerald-200',
    icon: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  extracts: {
    card: 'border-sky-200',
    icon: 'bg-sky-100 text-sky-700 border-sky-200',
    badge: 'bg-sky-100 text-sky-700'
  },
  supplies: {
    card: 'border-amber-200',
    icon: 'bg-amber-100 text-amber-700 border-amber-200',
    badge: 'bg-amber-100 text-amber-700'
  },
  equipment: {
    card: 'border-violet-200',
    icon: 'bg-violet-100 text-violet-700 border-violet-200',
    badge: 'bg-violet-100 text-violet-700'
  },
  contractor: {
    card: 'border-indigo-200',
    icon: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700'
  },
  treasury: {
    card: 'border-teal-200',
    icon: 'bg-teal-100 text-teal-700 border-teal-200',
    badge: 'bg-teal-100 text-teal-700'
  },
  custody: {
    card: 'border-rose-200',
    icon: 'bg-rose-100 text-rose-700 border-rose-200',
    badge: 'bg-rose-100 text-rose-700'
  },
  expenses: {
    card: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-700 border-orange-200',
    badge: 'bg-orange-100 text-orange-700'
  },
  other: {
    card: 'border-slate-200',
    icon: 'bg-slate-100 text-slate-600 border-slate-200',
    badge: 'bg-slate-100 text-slate-600'
  }
}

export default {
  name: 'StatCardNode',
  components: { Handle },
  props: {
    id: { type: String, required: true },
    data: { type: Object, required: true }
  },
  setup() {
    return { Position }
  },
  computed: {
    toneStyles() {
      return TONE_STYLES[this.data.tone] || TONE_STYLES.root
    },
    iconComponent() {
      if (this.data.icon && TONE_ICONS[this.data.icon]) return TONE_ICONS[this.data.icon]
      return TONE_ICONS[this.data.tone] || TONE_ICONS.root
    },
    cardClass() {
      const classes = [this.toneStyles.card]
      if (this.data.matched) classes.push('ring-2 ring-emerald-400')
      if (this.data.selected) classes.push('ring-2 ring-emerald-600 shadow-md')
      if (this.data.dimmed) classes.push('opacity-40')
      return classes
    },
    iconClass() {
      return this.toneStyles.icon
    },
    badgeClass() {
      return this.toneStyles.badge
    }
  },
  methods: {
    handleClick() {
      if (this.data.onSelect) this.data.onSelect(this.id)
    }
  }
}
</script>

<style scoped>
.org-chart-node {
  width: 15rem;
}
</style>
