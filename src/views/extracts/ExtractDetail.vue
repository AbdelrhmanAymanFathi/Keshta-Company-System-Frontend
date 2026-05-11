<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Extract Detail</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Failed to load extract.</div>
    <div v-else>
      <div class="mb-4">
        <strong>ID:</strong> {{ extract.id }}
      </div>
      <div class="mb-2"><strong>Date From:</strong> {{ formatDate(extract.dateFrom || extract.date) }}</div>
      <div class="mb-2"><strong>Date To:</strong> {{ formatDate(extract.dateTo || extract.date) }}</div>
      <div class="mb-2"><strong>Contractor:</strong> {{ extract.contractor?.name || extract.contractorId || '-' }}</div>
      <div class="mb-2"><strong>Location:</strong> {{ extract.location?.name || '-' }}</div>
      <div class="mb-2"><strong>Area:</strong> {{ extract.area?.name || '-' }}</div>
      <div class="mb-2"><strong>Total:</strong> {{ extract.total }}</div>
      <div class="mb-2"><strong>Notes:</strong> {{ extract.notes || '-' }}</div>
      <div class="mt-4">
        <h3 class="font-semibold">Lines</h3>
        <ul class="list-disc pl-6">
          <li v-for="(l, i) in extract.lines" :key="i">
            {{ formatItemWithUnit(l.item) || l.item?.name || l.itemId }} — {{ l.quantity }} × {{ l.price }} = {{ l.total }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getExtract } from '@/services/extracts'

const route = useRoute()
const id = route.params.id
const extract = ref(null)
const isLoading = ref(false)
const error = ref(null)

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('en-GB').format(new Date(value))
  } catch (e) {
    return value
  }
}

function formatItemWithUnit(item) {
  if (!item) return ''
  const name = item?.name || ''
  const unitName = item?.unit?.name || item?.unitName || item?.unit_name || ''
  if (!name && !unitName) return ''
  if (!unitName) return name
  if (!name) return unitName
  return `${name} (${unitName})`
}

onMounted(async () => {
  if (!id) return
  isLoading.value = true
  try {
    extract.value = await getExtract(id)
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
})
</script>
