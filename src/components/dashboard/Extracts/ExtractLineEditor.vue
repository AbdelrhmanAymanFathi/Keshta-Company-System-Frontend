<template>
  <div class="grid grid-cols-6 gap-2 items-center">
    <input v-model="internal.itemId" placeholder="Item ID" class="col-span-2 p-2 border rounded" />
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

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ itemId: '', price: null, quantity: 1, total: null })
  },
  // optional hint: item default extract price (number|null)
  itemDefaultPrice: {
    type: [Number, String, null],
    default: null
  }
})
const emit = defineEmits(['update:modelValue','remove'])

const internal = reactive({ ...props.modelValue })

watch(() => props.modelValue, (v) => {
  Object.assign(internal, v || {})
})

const showDefaultHint = computed(() => {
  return (internal.price === null || internal.price === '' || internal.price === undefined) && (props.itemDefaultPrice !== null && props.itemDefaultPrice !== undefined)
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
    if (val.total === null || val.total === undefined || val.total === '') {
      val.total = Number((priceNum * qtyNum).toFixed(2))
    }
  } else {
    // price not set — keep total as provided (could be null) and don't override
    if (val.total === undefined) val.total = null
  }

  emit('update:modelValue', { ...val })
}, { deep: true })

function onRemove() {
  emit('remove')
}
</script>

<style scoped>
.grid { align-items: center; }
</style>
