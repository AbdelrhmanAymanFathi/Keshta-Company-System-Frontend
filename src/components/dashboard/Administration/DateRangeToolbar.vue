<template>
  <Card class="shadcn-ui border-border/80 bg-card shadow-lg shadow-slate-200/40">
    <CardContent class="flex flex-col gap-4 p-4">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-for="p in presets"
          :key="p.key"
          type="button"
          :variant="activePreset === p.key ? 'default' : 'outline'"
          size="sm"
          class="rounded-lg px-3"
          @click="selectPreset(p.key)"
        >
          {{ $t(p.label) }}
        </Button>
      </div>
      <div v-if="activePreset === 'custom'" class="flex flex-col items-end gap-3 sm:flex-row">
        <div class="w-full flex-1 space-y-1">
          <Label class="text-xs font-medium text-muted-foreground">
            {{ $t('labels.fromDate') || 'From' }}
          </Label>
          <DateField v-model="customFrom" class="w-full" />
        </div>
        <div class="w-full flex-1 space-y-1">
          <Label class="text-xs font-medium text-muted-foreground">
            {{ $t('labels.toDate') || 'To' }}
          </Label>
          <DateField v-model="customTo" class="w-full" />
        </div>
        <Button type="button" size="sm" class="rounded-lg px-4" @click="applyCustom">
          {{ $t('changes.loadChanges') || 'Apply' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script>
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
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
  components: { Button, Card, CardContent, DateField, Label },
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
