<template>
  <div class="grid grid-cols-6 gap-2 items-start">
    <div class="col-span-2">
      <SearchDropdown
        v-model="internal.itemSearch"
        :items="items"
        :allItems="items"
        :placeholder="$t ? $t('labels.item') : 'Item'"
        :inputClass="'w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'"
        @select="selectItem"
      >
        <template #afterOptions>
          <div
            @click="emitAddItem"
            style="color: #10b981;"
            class="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-medium border-t border-gray-100"
          >
            + {{ $t ? $t('labels.addNew') : 'Add New' }}
          </div>
        </template>
      </SearchDropdown>
    </div>
    <div class="relative">
      <input type="number" step="0.01" v-model="internal.price" placeholder="Price" class="p-2 border rounded" />
      <div v-if="showDefaultHint" class="text-xs text-gray-500 mt-1">Will use item default extract price</div>
    </div>
    <input type="number" v-model.number="internal.quantity" placeholder="Qty" class="p-2 border rounded" />
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
    default: () => ({ itemId: '', itemSearch: '', price: null, quantity: 1, total: null })
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

const formattedTotal = computed(() => {
  const totalVal = internal.total
  if (totalVal !== null && totalVal !== undefined && totalVal !== '') return Number(totalVal).toFixed(2)
  const p = Number(internal.price)
  const q = Number(internal.quantity)
  if (!Number.isNaN(p) && p !== 0 && !Number.isNaN(q)) return Number((p * q) || 0).toFixed(2)
  return '-'
})

watch(internal, (val) => {
  // When price exists, auto-calc total if total is not provided or is falsy
  const priceNum = val.price === null || val.price === '' || val.price === undefined ? null : Number(val.price)
  const qtyNum = Number(val.quantity) || 0

  if (priceNum !== null && !Number.isNaN(priceNum)) {
    val.total = Number((priceNum * qtyNum).toFixed(2))
  } else {
    // price not set — keep total as provided (could be null) and don't override
    if (val.total === undefined) val.total = null
  }

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
    internal.total = Number((parsed * Number(internal.quantity || 0)).toFixed(2))
  }
}
</script>

<style scoped>
.grid { align-items: center; }
</style>
