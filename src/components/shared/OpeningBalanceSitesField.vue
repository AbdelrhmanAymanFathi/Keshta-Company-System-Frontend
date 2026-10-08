<template>
  <!-- «رصيد أول المدة» split per site: one row per site the contractor works at -->
  <div>
    <div class="text-sm mb-1">{{ isAr ? 'رصيد أول المدة حسب الموقع' : 'Opening balance per site' }}</div>
    <div class="space-y-2">
      <div v-for="(line, i) in modelValue" :key="i" class="flex items-center gap-2">
        <select
          :value="line.locationId"
          @change="update(i, 'locationId', $event.target.value ? Number($event.target.value) : '')"
          class="flex-1 min-w-0 px-3 py-2 border rounded bg-white theme-input-focus"
        >
          <option value="">{{ isAr ? 'بدون موقع' : 'No site' }}</option>
          <option
            v-for="l in locations"
            :key="l.id"
            :value="l.id"
            :disabled="isTaken(l.id, i)"
          >{{ l.name }}</option>
        </select>
        <input
          :value="line.amount"
          @input="update(i, 'amount', $event.target.value === '' ? '' : Number($event.target.value))"
          type="number"
          step="0.01"
          :placeholder="isAr ? 'المبلغ' : 'Amount'"
          class="w-32 sm:w-44 px-3 py-2 border rounded theme-input-focus"
        />
        <button
          type="button"
          @click="remove(i)"
          class="shrink-0 rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
          :title="isAr ? 'حذف' : 'Remove'"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
    <div class="mt-2 flex items-center justify-between gap-3 text-sm">
      <button type="button" @click="add" class="inline-flex items-center gap-1 theme-text hover:underline">
        <PlusIcon class="h-4 w-4" />
        {{ isAr ? 'إضافة موقع' : 'Add site' }}
      </button>
      <span v-if="modelValue.length > 1" class="theme-text-muted">
        {{ isAr ? 'الإجمالي:' : 'Total:' }}
        <span dir="ltr" class="font-medium theme-text-primary">{{ formattedTotal }}</span>
      </span>
    </div>
  </div>
</template>

<script>
import { PlusIcon, XMarkIcon } from '@acme/icon-packs/legacy'

/** An empty row; `amount` stays '' until typed so a blank row is not sent as 0. */
export const emptyOpeningBalanceLine = () => ({ locationId: '', amount: '' })

/** Rows from GET /contractors/:id/opening-balance, with one blank row when there are none. */
export function openingBalanceLinesFromApi(lines) {
  const rows = (Array.isArray(lines) ? lines : []).map(l => ({ locationId: l.locationId ?? '', amount: Number(l.amount) }))
  return rows.length ? rows : [emptyOpeningBalanceLine()]
}

/** Rows as the API takes them; rows with no amount are left out. */
export function openingBalanceLinesPayload(rows) {
  return (rows || [])
    .filter(r => r.amount !== '' && r.amount !== null && r.amount !== undefined && Number.isFinite(Number(r.amount)))
    .map(r => ({ locationId: r.locationId ? Number(r.locationId) : null, amount: Number(r.amount) }))
}

/** True when two sets of rows give the same amount on every site. */
export function sameOpeningBalanceLines(a, b) {
  const key = rows => {
    const bySite = {}
    for (const r of openingBalanceLinesPayload(rows)) bySite[r.locationId ?? 0] = (bySite[r.locationId ?? 0] || 0) + r.amount
    return Object.keys(bySite).filter(k => Math.abs(bySite[k]) >= 0.005).sort().map(k => `${k}:${bySite[k].toFixed(2)}`).join('|')
  }
  return key(a) === key(b)
}

export default {
  name: 'OpeningBalanceSitesField',
  components: { PlusIcon, XMarkIcon },
  props: {
    modelValue: { type: Array, required: true },
    locations: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  computed: {
    isAr() {
      return this.$i18n?.locale === 'ar'
    },
    formattedTotal() {
      const total = openingBalanceLinesPayload(this.modelValue).reduce((sum, l) => sum + l.amount, 0)
      return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  },
  methods: {
    // A site already used on another row can't be picked twice
    isTaken(locationId, rowIndex) {
      return this.modelValue.some((l, i) => i !== rowIndex && Number(l.locationId) === Number(locationId))
    },
    update(index, key, value) {
      this.$emit('update:modelValue', this.modelValue.map((l, i) => (i === index ? { ...l, [key]: value } : l)))
    },
    add() {
      this.$emit('update:modelValue', [...this.modelValue, emptyOpeningBalanceLine()])
    },
    remove(index) {
      const rows = this.modelValue.filter((_, i) => i !== index)
      this.$emit('update:modelValue', rows.length ? rows : [emptyOpeningBalanceLine()])
    }
  }
}
</script>
