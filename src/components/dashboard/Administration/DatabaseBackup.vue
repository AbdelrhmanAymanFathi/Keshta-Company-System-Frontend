<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <PageHeader :title="$t('databaseBackup.title')" :subtitle="$t('databaseBackup.description')" />

    <!-- Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Download -->
      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 p-6 flex flex-col">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center h-12 w-12 rounded-xl theme-icon-bg">
            <svg class="h-6 w-6 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold theme-text-primary">{{ $t('databaseBackup.downloadCardTitle') }}</h3>
            <p class="text-sm theme-text-muted mt-0.5">{{ $t('databaseBackup.downloadCardDescription') }}</p>
          </div>
        </div>

        <div class="mt-6 flex flex-1 items-end">
          <button
            @click="onDownload"
            :disabled="downloading"
            class="flex items-center gap-2 rounded-xl theme-button px-5 py-2.5 text-sm theme-text-light shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
          >
            <svg v-if="!downloading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ downloading ? $t('databaseBackup.downloading') : $t('databaseBackup.download') }}
          </button>
        </div>
      </div>

      <!-- Restore -->
      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 p-6 flex flex-col">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-red-100 text-red-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold theme-text-primary">{{ $t('databaseBackup.restoreCardTitle') }}</h3>
            <p class="text-sm theme-text-muted mt-0.5">{{ $t('databaseBackup.restoreCardDescription') }}</p>
          </div>
        </div>

        <!-- File selection -->
        <div class="mt-6 space-y-3 flex-1">
          <label
            :class="['flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-sm cursor-pointer transition-colors',
              selectedFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 theme-text-secondary hover:border-slate-400 hover:theme-hover-soft']"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {{ selectedFile ? selectedFile.name : $t('databaseBackup.chooseFile') }}
            <input ref="fileInput" type="file" accept=".dump,application/octet-stream" class="hidden" @change="onFileChange" />
          </label>

          <!-- Selected file info -->
          <div v-if="selectedFile" class="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-medium theme-text-primary">{{ $t('databaseBackup.fileInfo') }}</span>
              <button @click="clearFile" class="theme-text-muted hover:text-red-500 transition-colors" :disabled="restoring" aria-label="Clear file">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="theme-text-secondary flex justify-between">
              <span>{{ $t('databaseBackup.fileName') }}</span>
              <span class="font-medium theme-text-primary truncate max-w-[60%]">{{ selectedFile.name }}</span>
            </p>
            <p class="theme-text-secondary flex justify-between">
              <span>{{ $t('databaseBackup.fileSize') }}</span>
              <span class="font-medium theme-text-primary">{{ formatBytes(selectedFile.size) }}</span>
            </p>
            <p class="theme-text-secondary flex justify-between">
              <span>{{ $t('databaseBackup.lastModified') }}</span>
              <span class="font-medium theme-text-primary">{{ formatDate(selectedFile.lastModified) }}</span>
            </p>
          </div>

          <!-- Upload progress -->
          <div v-if="restoring && uploadPercent > 0 && uploadPercent < 100" class="space-y-1">
            <div class="flex items-center justify-between text-xs theme-text-muted">
              <span>{{ $t('databaseBackup.uploading') }}</span>
              <span>{{ Math.round(uploadPercent) }}%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div class="h-full bg-blue-500 transition-all duration-200" :style="{ width: uploadPercent + '%' }"></div>
            </div>
          </div>

          <div v-if="restoring" class="flex items-center gap-2 text-sm theme-text-secondary">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('databaseBackup.restoring') }}
          </div>

          <button
            @click="showConfirm = true"
            :disabled="!selectedFile || restoring"
            class="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-full"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 3v12m0 0l-4-4m4 4l4-4" />
            </svg>
            {{ $t('databaseBackup.restoreNow') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Backups on disk -->
    <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 class="text-base font-semibold theme-text-primary">{{ $t('databaseBackup.backupsTitle') }}</h3>
        <button @click="loadBackups" :disabled="filesLoading" class="flex items-center gap-1.5 text-sm theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" :class="{ 'animate-spin': filesLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div v-if="filesLoading" class="p-6">
        <div v-for="n in 4" :key="n" class="animate-pulse h-4 rounded bg-slate-200 mb-3" :style="{ width: (100 - n * 15) + '%' }"></div>
      </div>
      <div v-else-if="!backupFiles.length" class="p-6 text-sm theme-text-muted text-center">{{ $t('databaseBackup.backupsEmpty') }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="theme-table-thead-gradient">
            <tr>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colName') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colDate') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colSize') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colType') }}</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="f in backupFiles" :key="f.name" class="theme-table-row-hover transition-colors">
              <td class="px-5 py-3 text-sm theme-text-primary max-w-[260px] truncate" :title="f.name">{{ f.name }}</td>
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatDate(f.createdAt) }}</td>
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatBytes(f.sizeBytes) }}</td>
              <td class="px-5 py-3 whitespace-nowrap">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="f.type === 'safety' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'">
                  {{ f.type === 'safety' ? $t('databaseBackup.typeSafety') : $t('databaseBackup.typeBackup') }}
                </span>
              </td>
              <td class="px-5 py-3 whitespace-nowrap text-right">
                <button
                  @click="onDownloadFile(f)"
                  :disabled="downloadingFile === f.name"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm theme-text-secondary hover:theme-hover-soft transition-colors disabled:opacity-40"
                >
                  <svg v-if="downloadingFile !== f.name" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ $t('databaseBackup.actionBackupDownload') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Backup history -->
    <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 class="text-base font-semibold theme-text-primary">{{ $t('databaseBackup.logsTitle') }}</h3>
        <button @click="loadLogs" :disabled="logsLoading" class="flex items-center gap-1.5 text-sm theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" :class="{ 'animate-spin': logsLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div v-if="logsLoading" class="p-6">
        <div v-for="n in 4" :key="n" class="animate-pulse h-4 rounded bg-slate-200 mb-3" :style="{ width: (100 - n * 15) + '%' }"></div>
      </div>
      <div v-else-if="!logs.length" class="p-6 text-sm theme-text-muted text-center">{{ $t('databaseBackup.logsEmpty') }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="theme-table-thead-gradient">
            <tr>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colDate') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colAction') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colStatus') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colFile') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colSize') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('databaseBackup.colBy') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="log in logs" :key="log.id" class="theme-table-row-hover transition-colors" :title="log.details || ''">
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-primary">{{ formatDate(log.createdAt) }}</td>
              <td class="px-5 py-3 whitespace-nowrap">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="log.action === 'BACKUP_DOWNLOAD' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'">
                  {{ log.action === 'BACKUP_DOWNLOAD' ? $t('databaseBackup.actionBackupDownload') : $t('databaseBackup.actionBackupRestore') }}
                </span>
              </td>
              <td class="px-5 py-3 whitespace-nowrap">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                  {{ log.status === 'SUCCESS' ? $t('databaseBackup.statusSuccess') : $t('databaseBackup.statusFailed') }}
                </span>
              </td>
              <td class="px-5 py-3 text-sm theme-text-secondary max-w-[220px] truncate">{{ log.fileName || '—' }}</td>
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatBytes(log.sizeBytes) }}</td>
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ log.createdBy ? log.createdBy.name : '—' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span class="text-xs theme-text-muted">{{ page }} / {{ totalPages }}</span>
          <div class="flex gap-2">
            <button @click="changePage(page - 1)" :disabled="page <= 1" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm theme-text-secondary hover:theme-hover-soft transition-colors disabled:opacity-40">
              {{ isRTL ? '→' : '←' }}
            </button>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="px-3 py-1.5 rounded-lg border border-slate-200 text-sm theme-text-secondary hover:theme-hover-soft transition-colors disabled:opacity-40">
              {{ isRTL ? '←' : '→' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Restore confirmation -->
    <ConfirmDialog
      :show="showConfirm"
      type="danger"
      :title="$t('databaseBackup.restoreConfirmTitle')"
      :message="$t('databaseBackup.restoreConfirmMessage')"
      :confirm-text="$t('databaseBackup.confirm')"
      :cancel-text="$t('databaseBackup.cancel')"
      :loading="restoring"
      :loading-text="$t('databaseBackup.restoring')"
      :prevent-backdrop-close="restoring"
      @confirm="onRestore"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/shared/PageHeader.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { downloadDatabaseBackup, restoreDatabaseBackup, getDatabaseBackupLogs, listDatabaseBackupFiles, downloadDatabaseBackupFile } from '@/api'

export default {
  name: 'DatabaseBackup',
  components: { PageHeader, ConfirmDialog },
  setup() {
    const { locale } = useI18n()
    return { locale }
  },
  data() {
    return {
      downloading: false,
      restoring: false,
      uploadPercent: 0,
      selectedFile: null,
      showConfirm: false,
      backupFiles: [],
      filesLoading: false,
      downloadingFile: null,
      logs: [],
      logsLoading: false,
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1
    }
  },
  computed: {
    isRTL() { return this.locale === 'ar' }
  },
  mounted() {
    this.loadBackups()
    this.loadLogs()
  },
  methods: {
    async onDownload() {
      if (this.downloading) return
      this.downloading = true
      try {
        const response = await downloadDatabaseBackup()
        const blob = response.data
        if (!blob || blob.size === 0) throw new Error('empty response')

        let fileName = `accounting-backup-${new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19)}.dump`
        const contentDisposition = response.headers?.['content-disposition'] || ''
        const match = contentDisposition.match(/filename="?([^";]+)"?/)
        if (match && match[1]) fileName = decodeURIComponent(match[1])

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        if (window.$toast) window.$toast(this.$t('databaseBackup.downloadSuccess'), 'success', 4000)
        this.loadLogs()
      } catch (error) {
        console.error('Backup download failed:', error)
        if (window.$toast) window.$toast(this.$t('databaseBackup.downloadError'), 'error', 5000)
      } finally {
        this.downloading = false
      }
    },
    onFileChange(e) {
      const file = e.target.files?.[0]
      if (!file) return
      this.selectedFile = file
      this.uploadPercent = 0
      e.target.value = null
    },
    async loadBackups() {
      this.filesLoading = true
      try {
        const response = await listDatabaseBackupFiles()
        this.backupFiles = response.data?.items || []
      } catch (error) {
        console.error('Failed to load backup files:', error)
        if (window.$toast) window.$toast(this.$t('databaseBackup.loadBackupsError'), 'error')
      } finally {
        this.filesLoading = false
      }
    },
    async onDownloadFile(file) {
      if (!file?.name || this.downloadingFile === file.name) return
      this.downloadingFile = file.name
      try {
        const response = await downloadDatabaseBackupFile(file.name)
        const blob = response.data
        if (!blob || blob.size === 0) throw new Error('empty response')

        let fileName = file.name
        const contentDisposition = response.headers?.['content-disposition'] || ''
        const match = contentDisposition.match(/filename="?([^";]+)"?/)
        if (match && match[1]) fileName = decodeURIComponent(match[1])

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        if (window.$toast) window.$toast(this.$t('databaseBackup.downloadSuccess'), 'success', 4000)
      } catch (error) {
        console.error('Backup file download failed:', error)
        if (window.$toast) window.$toast(this.$t('databaseBackup.downloadError'), 'error', 5000)
      } finally {
        this.downloadingFile = null
      }
    },
    clearFile() {
      if (this.restoring) return
      this.selectedFile = null
      if (this.$refs.fileInput) this.$refs.fileInput.value = null
    },
    async onRestore() {
      if (!this.selectedFile || this.restoring) return
      this.showConfirm = false
      this.restoring = true
      this.uploadPercent = 0
      try {
        await restoreDatabaseBackup(this.selectedFile, (e) => {
          if (e && e.total > 0) {
            this.uploadPercent = Math.min(100, Math.round((e.loaded / e.total) * 100))
          }
        })
        if (window.$toast) window.$toast(this.$t('databaseBackup.restoreSuccess'), 'success', 6000)
        this.selectedFile = null
        if (this.$refs.fileInput) this.$refs.fileInput.value = null
        this.loadBackups()
        this.loadLogs()
      } catch (error) {
        const message = error?.response?.data?.message
        const msg = error?.response?.status === 409
          ? this.$t('databaseBackup.restoreInProgress')
          : (message || this.$t('databaseBackup.restoreError'))
        if (window.$toast) window.$toast(msg, 'error', 6000)
        console.error('Backup restore failed:', error)
      } finally {
        this.restoring = false
        this.uploadPercent = 0
      }
    },
    async loadLogs() {
      this.logsLoading = true
      try {
        const response = await getDatabaseBackupLogs({ page: this.page, pageSize: this.pageSize })
        const data = response.data
        this.logs = data.items || []
        this.total = data.total || 0
        this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize))
      } catch (error) {
        console.error('Failed to load backup logs:', error)
        if (window.$toast) window.$toast(this.$t('databaseBackup.loadLogsError'), 'error')
      } finally {
        this.logsLoading = false
      }
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages || p === this.page) return
      this.page = p
      this.loadLogs()
    },
    formatBytes(v) {
      const n = Number(v)
      if (!Number.isFinite(n) || n <= 0) return '—'
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let i = 0
      let size = n
      while (size >= 1024 && i < units.length - 1) {
        size /= 1024
        i++
      }
      return `${size.toFixed(size >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
    },
    formatDate(d) {
      if (!d) return '—'
      const date = new Date(d)
      if (isNaN(date.getTime())) return String(d)
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
