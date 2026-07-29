<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="p in presets"
          :key="p.key"
          @click="selectPreset(p.key)"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="activePreset === p.key
            ? 'theme-button theme-text-light'
            : 'theme-text-secondary hover:bg-slate-100'"
        >
          {{ $t(p.label) }}
        </button>
      </div>
      <div v-if="activePreset === 'custom'" class="flex flex-col sm:flex-row gap-3 items-end">
        <div class="flex-1 w-full">
          <label class="mb-1 block text-xs font-medium theme-text-secondary">
            {{ $t('labels.fromDate') || 'From' }}
          </label>
          <DateField
            v-model="customFrom"
            class="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm theme-input-focus"
          />
        </div>
        <div class="flex-1 w-full">
          <label class="mb-1 block text-xs font-medium theme-text-secondary">
            {{ $t('labels.toDate') || 'To' }}
          </label>
          <DateField
            v-model="customTo"
            class="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm theme-input-focus"
          />
        </div>
        <button
          @click="applyCustom"
          class="rounded-lg theme-button px-4 py-1.5 text-sm theme-text-light"
        >
          {{ $t('changes.loadChanges') || 'Apply' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DateField from '@/components/shared/DateField.vue'

function formatISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

const PRESETS = [
  { key: 'today', label: 'adminStats.today', fn: () => {
    const d = new Date(); return { startDate: formatISO(d), endDate: formatISO(d) }
  }},
  { key: 'yesterday', label: 'adminStats.yesterday', fn: () => {
    const d = new Date(Date.now() - 86400000); return { startDate: formatISO(d), endDate: formatISO(d) }
  }},
  { key: 'last7', label: 'adminStats.last7Days', fn: () => {
    const e = new Date(); const s = new Date(Date.now() - 6 * 86400000)
    return { startDate: formatISO(s), endDate: formatISO(e) }
  }},
  { key: 'last30', label: 'adminStats.last30Days', fn: () => {
    const e = new Date(); const s = new Date(Date.now() - 29 * 86400000)
    return { startDate: formatISO(s), endDate: formatISO(e) }
  }},
  { key: 'thisMonth', label: 'adminStats.thisMonth', fn: () => {
    const n = new Date(); return { startDate: formatISO(startOfMonth(n)), endDate: formatISO(n) }
  }},
  { key: 'lastMonth', label: 'adminStats.lastMonth', fn: () => {
    const n = new Date(); const lm = new Date(n.getFullYear(), n.getMonth() - 1, 1)
    return { startDate: formatISO(startOfMonth(lm)), endDate: formatISO(endOfMonth(lm)) }
  }},
  { key: 'thisYear', label: 'adminStats.thisYear', fn: () => {
    const n = new Date(); return { startDate: formatISO(new Date(n.getFullYear(), 0, 1)), endDate: formatISO(n) }
  }},
  { key: 'custom', label: 'adminStats.custom', fn: null }
]

export default {
  name: 'DateRangeToolbar',
  components: { DateField },
  props: {
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' }
  },
  emits: ['update:startDate', 'update:endDate', 'change'],
  data() {
    return {
      presets: PRESETS,
      activePreset: 'last30',
      customFrom: '',
      customTo: ''
    }
  },
  mounted() {
    this.selectPreset('last30')
  },
  methods: {
    selectPreset(key) {
      this.activePreset = key
      if (key === 'custom') return
      const p = this.presets.find(x => x.key === key)
      if (!p || !p.fn) return
      const range = p.fn()
      this.$emit('update:startDate', range.startDate)
      this.$emit('update:endDate', range.endDate)
      this.$emit('change', { startDate: range.startDate, endDate: range.endDate, preset: key })
    },
    applyCustom() {
      if (!this.customFrom) return
      const sd = this.customFrom
      const ed = this.customTo || this.customFrom
      this.$emit('update:startDate', sd)
      this.$emit('update:endDate', ed)
      this.$emit('change', { startDate: sd, endDate: ed, preset: 'custom' })
    }
  }
}
</script>
