<template>
  <div class="grid grid-cols-6 gap-2 items-start">
    <div class="col-span-2">
      <SearchDropdown
        v-model="internal.itemSearch"
        :items="items"
        :allItems="items"
        :placeholder="$t ? $t('labels.item') : 'Item'"
        :inputClass="'w-full p-2 border rounded text-sm focus:outline-none theme-input-focus'"
        @select="selectItem"
      >
        <template #afterOptions>
          <div
            @click="emitAddItem"
            style="color: #10b981;"
            class="px-3 py-2 theme-hover-soft cursor-pointer text-sm font-medium border-t border-gray-100"
          >
            + {{ $t ? $t('labels.addNew') : 'Add New' }}
          </div>
        </template>
      </SearchDropdown>
      <div v-if="displayUnitName" class="mt-1 text-xs text-gray-500">
        {{ displayUnitName }}
      </div>
    </div>
    <div class="relative">
      <input type="number" step="0.01" v-model="internal.price" placeholder="Price" class="p-2 border rounded" />
      <div v-if="showDefaultHint" class="text-xs text-gray-500 mt-1">Will use item default extract price</div>
    </div>
    <input type="number" v-model.number="internal.quantity" placeholder="Qty" class="p-2 border rounded" />
    <input type="number" min="0" step="0.01" v-model.number="internal.discount" placeholder="Discount" class="p-2 border rounded" />
    <div class="p-2">{{ formattedTotal }}</div>
    <button type="button" @click="onRemove" class="text-red-600">Remove</button>
  </div>
</template>

<script setup>
/* global defineProps, defineEmits */
import { reactive, watch, computed } from 'vue'
import SearchDropdown from '@/components/shared/SearchDropdown.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ itemId: '', itemSearch: '', price: null, quantity: 1, discount: 0, total: null })
  },
  items: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'remove', 'add-item'])

const internal = reactive({ ...props.modelValue })

watch(() => props.modelValue, (v) => {
  Object.assign(internal, v || {})
})

const showDefaultHint = computed(() => {
  const item = props.items.find(i => Number(i.id) === Number(internal.itemId))
  const defaultPrice = item?.defaultExtractPrice ?? item?.currentPrice ?? item?.price ?? item?.current_price
  return (internal.price === null || internal.price === '' || internal.price === undefined) && defaultPrice !== null && defaultPrice !== undefined
})

const displayUnitName = computed(() => {
  const item = props.items.find(i => Number(i.id) === Number(internal.itemId))
  return item?.unit?.name || item?.unitName || item?.unit_name || ''
})

const formattedTotal = computed(() => {
  const p = Number(internal.price)
  const q = Number(internal.quantity)
  const discount = Math.max(0, Number(internal.discount || 0))
  const total = Math.max(0, (Number.isFinite(p) ? p : 0) * (Number.isFinite(q) ? q : 0) - discount)
  return Number(total).toFixed(2)
})

watch(internal, (val) => {
  const priceNum = val.price === null || val.price === '' || val.price === undefined ? 0 : Number(val.price)
  const qtyNum = val.quantity === null || val.quantity === '' || val.quantity === undefined ? 0 : Number(val.quantity)
  const discountNum = val.discount === null || val.discount === '' || val.discount === undefined ? 0 : Number(val.discount)
  val.discount = Number.isFinite(discountNum) ? Math.max(0, discountNum) : 0
  const total = Math.max(0, (Number.isFinite(priceNum) ? priceNum : 0) * (Number.isFinite(qtyNum) ? qtyNum : 0) - val.discount)
  val.total = Number(total.toFixed(2))

  emit('update:modelValue', { ...val })
}, { deep: true })

function onRemove() {
  emit('remove')
}

function emitAddItem() {
  emit('add-item')
}

function selectItem(item) {
  internal.itemId = item?.id || ''
  internal.itemSearch = item?.name || ''
  const maybePrice = item?.defaultExtractPrice ?? item?.currentPrice ?? item?.price ?? item?.current_price
  const parsed = Number(maybePrice)
  if (!Number.isNaN(parsed) && (internal.price === null || internal.price === undefined || internal.price === '' || Number(internal.price) === 0)) {
    internal.price = parsed
    internal.total = Number(Math.max(0, parsed * Number(internal.quantity || 0) - Number(internal.discount || 0)).toFixed(2))
  }
}
</script>

<style scoped>
.grid { align-items: center; }
</style>
