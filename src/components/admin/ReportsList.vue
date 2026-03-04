<template>
  <div class="p-6" :dir="isRTL ? 'rtl' : 'ltr'" :class="{ 'direction-rtl': isRTL }">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">{{ $t('admin.reports') }}</h2>
      <div class="flex gap-2">
        <router-link :to="{ name: 'admin-reports-from-table' }" class="px-3 py-2 bg-emerald-600 text-white rounded flex items-center gap-2 hover:bg-emerald-500 transition">
          <span>{{ $t('admin.newReport') }}</span>
        </router-link>
        <!-- <router-link :to="{ name: 'admin-reports-from-table' }" class="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-500 transition">
          <span>{{ $t('admin.newReportFromTable') || 'From Table' }}</span>
        </router-link> -->
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
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id">
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.key }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ (locale.value !== 'en' && r.arTitle) ? r.arTitle : r.title }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.module }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.active ? $t('labels.active') : $t('labels.inactive') }}</td>
            <td :class="isRTL ? 'text-left p-2' : 'text-right p-2'">
              <div :class="isRTL ? 'flex items-center justify-start gap-2' : 'flex items-center justify-end gap-2'">
                <button @click="runReport(r.id)" class="px-2 py-1 bg-indigo-600 text-white rounded inline-flex items-center gap-2 hover:bg-indigo-500 transition">
                  <span> {{ $t('admin.run') }}</span>
                </button>
                <router-link :to="{ name: 'admin-reports-from-table', params: { id: r.id } }" class="px-2 py-1 bg-amber-500 text-white rounded inline-flex items-center gap-2 hover:bg-amber-400 transition">
                  <span>{{ $t('labels.edit') }}</span>
                </router-link>
                <button @click="remove(r.id)" class="px-2 py-1 bg-red-600 text-white rounded inline-flex items-center gap-2 hover:bg-red-500 transition">
                  <span>{{ $t('labels.delete') }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <ReportRunModal v-if="showRun" :reportId="runReportId" @close="showRun=false" />

      <!-- Report creation/editing now handled by DynamicReportFromTable route -->
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getReportDefs, deleteReportDef } from '@/api'
import ReportRunModal from './ReportRunModal.vue'

export default {
  components: { ReportRunModal },
  setup() {
    const { locale, t } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')
    const reports = ref([])
    const showRun = ref(false)
    const runReportId = ref(null)

    // Using DynamicReportFromTable route for create/edit

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

    // legacy modal handlers removed; route-based editor used instead

    onMounted(load)
    return { reports, showRun, runReportId, remove, runReport, isRTL, locale }
  }
}
</script>
