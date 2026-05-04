<template>
  <div class="p-4 w-full">
    <h3 class="text-lg font-semibold mb-4">{{ $t('extracts.title') }} - {{ $t('labels.add') }}</h3>

    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <button @click="openAddModal" class="bg-green-600 text-white px-4 py-2 rounded">{{ $t('labels.add') }}</button>
        <button @click="loadItems" class="px-3 py-2 border rounded">{{ $t('refresh') }}</button>
      </div>
      <div v-if="error" class="text-red-600">{{ error }}</div>
    </div>

    <div class="overflow-x-auto bg-white border rounded w-full">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left">
          <tr>
            <th class="p-2">#</th>
            <th class="p-2">{{ $t('labels.itemName') }}</th>
            <th class="p-2">{{ $t('labels.price') }}</th>
            <th class="p-2">{{ $t('addExportItem') }}</th>
            <th class="p-2">{{ $t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(it,i) in items" :key="it.id" class="border-t">
            <td class="p-2">{{ i + 1 }}</td>
            <td class="p-2">
              <div v-if="editingId === it.id">
                <input v-model="editForm.name" class="p-1 border rounded w-full" />
              </div>
              <div v-else>{{ it.name }}</div>
            </td>
            <td class="p-2">
              <div v-if="editingId === it.id">
                <input v-model.number="editForm.currentPrice" type="number" step="0.01" class="p-1 border rounded w-full" />
              </div>
              <div v-else>{{ it.currentPrice }}</div>
            </td>
            <td class="p-2">{{ it.availableForExports ? $t('labels.yes') : $t('labels.no') }}</td>
            <td class="p-2 flex gap-2">
              <button v-if="editingId !== it.id" @click="startEdit(it)" class="px-2 py-1 border rounded">{{ $t('edit') }}</button>
              <button v-else @click="saveEdit(it)" class="px-2 py-1 bg-indigo-600 text-white rounded">{{ $t('save') }}</button>
              <button @click="removeItem(it)" class="px-2 py-1 border rounded text-red-600">{{ $t('delete') }}</button>
            </td>
          </tr>
          <tr v-if="!items || !items.length"><td class="p-4 text-center" colspan="5">{{ $t('noData') }}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Reuse ItemList's modal for creating items -->
    <ItemList ref="itemListRef" mode="all" style="display:none" @saved="onItemSaved" />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getExportItems, createExportItem, updateExportItem, deleteExportItem } from '@/api'
import ItemList from '@/components/dashboard/Items/ItemList.vue'
import normalizeItem from '@/utils/normalizeItem'

export default {
  name: 'ExtractItemsManager',
  components: { ItemList },
  setup() {
    const { locale } = useI18n()
    const items = ref([])
    const loading = ref(false)
    const adding = ref(false)
    const error = ref('')
    const modalError = ref('')
    const showAddModal = ref(false)

    const form = ref({ name: '', currentPrice: '' })
    const editingId = ref(null)
    const editForm = ref({ name: '', currentPrice: '' })
    const itemListRef = ref(null)

    const extractArray = (res) => {
      if (!res) return []
      if (res?.data?.items) return Array.isArray(res.data.items) ? res.data.items : []
      if (res?.data) {
        if (Array.isArray(res.data)) return res.data
        if (typeof res.data === 'object') {
          const firstValue = Object.values(res.data)[0]
          return Array.isArray(firstValue) ? firstValue : []
        }
      }
      if (Array.isArray(res)) return res
      return []
    }

    async function loadItems() {
      loading.value = true
      error.value = ''
      try {
        const res = await getExportItems({ mode: 'extracts' })
        const raw = extractArray(res)

        items.value = raw.map(normalizeItem).filter(i => i && (i.availableForExports === true || i.availableForExtracts === true))
      } catch (e) {
        error.value = e?.message || 'Failed to load items'
      } finally { loading.value = false }
    }

    async function addItem() {
      if (!form.value.name || !form.value.currentPrice) return
      adding.value = true
      try {
        const payload = { name: form.value.name.trim(), currentPrice: Number(form.value.currentPrice), availableForExports: true, availableForExtracts: true }
        await createExportItem(payload)
        form.value.name = ''
        form.value.currentPrice = ''
        await loadItems()
      } catch (e) {
        error.value = e?.message || 'Failed to add item'
      } finally { adding.value = false }
    }

    function openAddModal() {
      modalError.value = ''
      // Prefer using the shared ItemList modal; fall back to local modal if not available
      if (itemListRef.value && typeof itemListRef.value.openCreateModal === 'function') {
        itemListRef.value.openCreateModal({ availableForExtracts: true })
      } else {
        showAddModal.value = true
      }
    }

    function onItemSaved() {
      // Refresh the extract-item list when an item is created/updated via ItemList
      loadItems()
    }

    function closeAddModal() {
      showAddModal.value = false
      modalError.value = ''
      form.value.name = ''
      form.value.currentPrice = ''
    }

    async function confirmAddItem() {
      modalError.value = ''
      if (!form.value.name || !form.value.currentPrice) {
        modalError.value = 'All fields required'
        return
      }
      await addItem()
      if (!error.value) closeAddModal()
    }

    function startEdit(it) {
      editingId.value = it.id
      editForm.value = { name: it.name, currentPrice: it.currentPrice }
    }

    async function saveEdit(it) {
      try {
        await updateExportItem(it.id, { name: editForm.value.name.trim(), currentPrice: Number(editForm.value.currentPrice), availableForExports: true })
        editingId.value = null
        await loadItems()
      } catch (e) {
        error.value = e?.message || 'Failed to save'
      }
    }

    async function removeItem(it) {
      try {
        await deleteExportItem(it.id)
        await loadItems()
      } catch (e) {
        error.value = e?.message || 'Failed to delete'
      }
    }

    watch(locale, () => { loadItems() })
    onMounted(() => { loadItems() })

    return { items, loading, form, addItem, error, editingId, editForm, startEdit, saveEdit, removeItem, loadItems, showAddModal, openAddModal, closeAddModal, confirmAddItem, modalError, adding, itemListRef, onItemSaved }
  }
}
</script>

<style scoped>
.p-4 { padding: 1rem }
</style>
