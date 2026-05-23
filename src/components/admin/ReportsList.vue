<template>
  <div class="p-0 sm:p-0.5 md:p-1 lg:p-0" :dir="isRTL ? 'rtl' : 'ltr'" :class="{ 'direction-rtl': isRTL }">
    <div class="app-page-header mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <h2 class="text-lg sm:text-xl font-bold theme-text-primary">{{ $t('admin.reports') }}</h2>
      <div class="flex gap-2">
        <router-link :to="{ name: 'admin-reports-from-table' }" class="flex items-center gap-2 rounded-xl theme-button px-3 py-2 theme-text-light shadow-sm  transition ">
          <span>{{ $t('admin.newReport') }}</span>
        </router-link>
        <!-- <router-link :to="{ name: 'admin-reports-from-table' }" class="px-3 py-2 bg-blue-600 theme-text-light rounded flex items-center gap-2 hover:bg-blue-500 transition">
          <span>{{ $t('admin.newReportFromTable') || 'From Table' }}</span>
        </router-link> -->
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/40">
      <table class="min-w-full table-auto">
        <thead class="theme-table-thead-gradient">
          <tr>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnKey') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnTitle') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnModule') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.totalsLabel') || 'Totals' }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnActive') }}</th>
            <th :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ $t('reports.columnActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id" class="border-t border-slate-200 theme-table-row-hover">
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.key }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ (locale.value !== 'en' && r.arTitle) ? r.arTitle : r.title }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.module }}</td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">
              <div v-if="getTotalsColumns(r).length" class="flex flex-wrap gap-1">
                <span
                  v-for="column in getTotalsColumns(r)"
                  :key="`${r.id}-${column}`"
                  class="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900"
                >
                  {{ column }}
                </span>
              </div>
              <span v-else class="text-sm theme-caption">-</span>
            </td>
            <td :class="isRTL ? 'text-right p-2' : 'text-left p-2'">{{ r.active ? $t('labels.active') : $t('labels.inactive') }}</td>
            <td :class="isRTL ? 'text-left p-2' : 'text-right p-2'">
              <div :class="isRTL ? 'flex items-center justify-start gap-2' : 'flex items-center justify-end gap-2'">
                <router-link
                  :to="{ name: 'admin-reports-run', params: { id: r.id } }"
                  :title="$t('admin.run')"
                  :aria-label="$t('admin.run')"
                  class="inline-flex items-center rounded-lg theme-button p-2 theme-text-light transition "
                >
                  <PlayIcon class="h-4 w-4" />
                </router-link>
                <router-link
                  :to="{ name: 'admin-reports-from-table', params: { id: r.id } }"
                  :title="$t('labels.edit')"
                  :aria-label="$t('labels.edit')"
                  class="inline-flex items-center rounded-lg bg-slate-700 p-2 theme-text-light transition hover:bg-slate-800"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </router-link>
                <button
                  @click="remove(r.id)"
                  :title="$t('labels.delete')"
                  :aria-label="$t('labels.delete')"
                  class="inline-flex items-center rounded-lg bg-red-600 p-2 theme-text-light transition hover:bg-red-700"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <!-- Report creation/editing now handled by DynamicReportFromTable route -->
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PencilSquareIcon, PlayIcon, TrashIcon } from '@/theme/icons/legacy'
import { getReportDefs, deleteReportDef } from '@/api'
import { normalizeReportTotals } from '@/utils/reportDefinitions'

export default {
  components: {
    PencilSquareIcon,
    PlayIcon,
    TrashIcon
  },
  setup() {
    const { locale, t } = useI18n()
    const isRTL = computed(() => locale.value === 'ar')
    const reports = ref([])

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

    const getTotalsColumns = (report) => normalizeReportTotals(report || {})

    // legacy modal handlers removed; route-based editor used instead

    onMounted(load)
    return { reports, remove, getTotalsColumns, isRTL, locale }
  }
}
</script>
