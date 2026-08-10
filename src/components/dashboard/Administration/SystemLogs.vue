<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <PageHeader :title="$t('systemLogs.title')" :subtitle="$t('systemLogs.description')" />

    <div class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 class="text-base font-semibold theme-text-primary">{{ $t('systemLogs.filesTitle') }}</h3>
          <button @click="loadFiles" :disabled="filesLoading" class="flex items-center gap-2 text-sm theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50">
            <svg class="w-4 h-4" :class="{ 'animate-spin': filesLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('systemLogs.refresh') }}
          </button>
        </div>

        <div v-if="filesLoading" class="p-6">
          <div v-for="n in 5" :key="n" class="animate-pulse h-4 rounded bg-slate-200 mb-3" :style="{ width: (100 - n * 10) + '%' }"></div>
        </div>

        <div v-else-if="!files.length" class="p-6 text-sm theme-text-muted text-center">
          {{ $t('systemLogs.noFiles') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="theme-table-thead-gradient">
              <tr>
                <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('systemLogs.colName') }}</th>
                <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('systemLogs.colModified') }}</th>
                <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider text-right">{{ $t('systemLogs.colSize') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="file in files" :key="file.name" class="theme-table-row-hover cursor-pointer" @click="selectFile(file)">
                <td class="px-5 py-3 text-sm theme-text-primary truncate" :title="file.name">{{ file.name }}</td>
                <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatDate(file.modifiedAt) }}</td>
                <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary text-right">{{ formatBytes(file.sizeBytes) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold theme-text-primary">{{ selectedFile ? selectedFile.name : $t('systemLogs.filePreviewTitle') }}</h3>
            <p class="text-sm theme-text-muted mt-1">{{ selectedFile ? $t('systemLogs.filePreviewSubtitle') : $t('systemLogs.noFileSelected') }}</p>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm theme-text-secondary">{{ $t('systemLogs.linesLabel') }}</label>
            <select v-model.number="lines" @change="reloadFile" class="rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm theme-input-focus">
              <option :value="100">100</option>
              <option :value="200">200</option>
              <option :value="500">500</option>
              <option :value="1000">1000</option>
            </select>
          </div>
        </div>

        <div class="p-5">
          <div v-if="fileLoading" class="space-y-2">
            <div v-for="n in 4" :key="n" class="animate-pulse h-4 rounded bg-slate-200" />
          </div>
          <div v-else-if="!selectedFile" class="text-sm theme-text-muted">
            {{ $t('systemLogs.noFileSelectedDescription') }}
          </div>
          <div v-else>
            <pre class="max-h-[calc(100vh-250px)] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100"><code>{{ fileContent }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/shared/PageHeader.vue'
import { getServerLogFiles, getServerLogFile } from '@/api'

export default {
  name: 'SystemLogs',
  components: { PageHeader },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      files: [],
      selectedFile: null,
      fileContent: '',
      filesLoading: false,
      fileLoading: false,
      lines: 200,
    }
  },
  computed: {
    isRTL() {
      return this.locale === 'ar'
    }
  },
  mounted() {
    this.loadFiles()
  },
  methods: {
    async loadFiles() {
      this.filesLoading = true
      try {
        const response = await getServerLogFiles()
        this.files = response.data?.items || []
        if (!this.selectedFile && this.files.length > 0) {
          this.selectFile(this.files[0])
        }
      } catch (error) {
        console.error('Failed to load log files:', error)
        if (window.$toast) window.$toast(this.$t('systemLogs.loadFilesError'), 'error')
      } finally {
        this.filesLoading = false
      }
    },
    async selectFile(file) {
      if (!file || this.selectedFile?.name === file.name) return
      this.selectedFile = file
      await this.reloadFile()
    },
    async reloadFile() {
      if (!this.selectedFile) return
      this.fileLoading = true
      this.fileContent = ''
      try {
        const response = await getServerLogFile(this.selectedFile.name, this.lines)
        this.fileContent = response.data?.content || ''
      } catch (error) {
        console.error('Failed to load log content:', error)
        if (window.$toast) window.$toast(this.$t('systemLogs.loadContentError'), 'error')
      } finally {
        this.fileLoading = false
      }
    },
    formatBytes(value) {
      const n = Number(value)
      if (!Number.isFinite(n) || n <= 0) return '—'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = n
      let i = 0
      while (size >= 1024 && i < units.length - 1) {
        size /= 1024
        i += 1
      }
      return `${size.toFixed(size >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
    },
    formatDate(value) {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    }
  }
}
</script>
