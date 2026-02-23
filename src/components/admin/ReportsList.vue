<template>
  <div class="p-6" :dir="isRTL ? 'rtl' : 'ltr'" :class="{ 'direction-rtl': isRTL }">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">{{ $t('admin.reports') }}</h2>
      <div class="flex gap-2">
        <button @click="showEditor = true" class="px-3 py-2 bg-emerald-600 text-white rounded flex items-center gap-2 hover:bg-emerald-500 transition">
          <span>{{ $t('admin.newReport') }}</span>
        </button>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4">
      <table class="w-full table-auto">
        <thead>
          <tr>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnKey') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnTitle') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnModule') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnActive') }}</th>
            <th :class="isRTL ? 'text-left p-2' : 'text-right p-2'">{{ $t('reports.columnActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id">
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.key }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ (locale.value !== 'en' && r.arTitle) ? r.arTitle : r.title }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.module }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.active ? $t('labels.active') : $t('labels.inactive') }}</td>
            <td :class="isRTL ? 'text-left p-2' : 'text-right p-2'">
              <button @click="runReport(r.id)" class="px-2 py-1 bg-indigo-600 text-white rounded mr-2 flex items-center gap-2 hover:bg-indigo-500 transition">
                <span> {{ $t('admin.run') }}</span>
              </button>
              <router-link :to="{ name: 'admin-reports-edit', params: { id: r.id } }" class="px-2 py-1 bg-amber-500 text-white rounded mr-2 flex items-center gap-2 hover:bg-amber-400 transition">
                <span>{{ $t('labels.edit') }}</span>
              </router-link>
              <button @click="remove(r.id)" class="px-2 py-1 bg-red-600 text-white rounded flex items-center gap-2 hover:bg-red-500 transition">
                <span>{{ $t('labels.delete') }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <ReportRunModal v-if="showRun" :reportId="runReportId" @close="showRun=false" />

      <Modal :visible="showEditor" title="New Report" :closeOnBackdrop="false" @update:visible="onModalVisibleChange">
        <report-editor modal @saved="onEditorSaved" @dirty-changed="onEditorDirty" />
      </Modal>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getReportDefs, deleteReportDef } from '@/api'
import ReportRunModal from './ReportRunModal.vue'
import ReportEditor from './ReportEditor.vue'
import Modal from '@/components/shared/Modal.vue'

export default {
  components: { ReportRunModal, ReportEditor, Modal },
  setup() {
    const { locale, t } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')
    const reports = ref([])
    const showRun = ref(false)
    const runReportId = ref(null)

    const showEditor = ref(false)

    const load = async () => {
      try {
        const res = await getReportDefs()
        reports.value = res.data || []
      } catch (err) {
        console.error('Failed to load reports', err)
      }
    }

    const remove = async (id) => {
      if (!confirm(t('reports.confirmDelete'))) return
      try {
        await deleteReportDef(id)
        await load()
      } catch (err) {
        console.error('Delete failed', err)
      }
    }

    const runReport = (id) => {
      runReportId.value = id
      showRun.value = true
    }

    const editorDirty = ref(false)

    function onEditorDirty(dirty) {
      editorDirty.value = !!dirty
    }

    function tryCloseEditor() {
      if (editorDirty.value) {
        if (!confirm('Discard unsaved changes?')) return
      }
      showEditor.value = false
      editorDirty.value = false
    }

    function onModalVisibleChange(val) {
      if (!val) {
        tryCloseEditor()
      } else {
        showEditor.value = true
      }
    }

    const onEditorSaved = async () => {
      showEditor.value = false
      await load()
    }

    onMounted(load)
    return { reports, showRun, runReportId, remove, runReport, showEditor, onEditorSaved, onEditorDirty, tryCloseEditor, onModalVisibleChange, isRTL, locale }
  }
}
</script>
