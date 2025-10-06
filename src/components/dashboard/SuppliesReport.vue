<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-4 space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2">
        <input v-model="search" @keyup.enter="fetchReport" class="px-3 py-2 border rounded" :placeholder="$t('labels.search')" />
        <button @click="fetchReport" class="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">{{ $t('labels.refresh') }}</button>
      </div>
      <div class="flex items-center gap-2">
        <button :disabled="downloading" @click="downloadExcel" class="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
          <span v-if="!downloading">{{ $t('labels.download') }}</span>
          <span v-else>{{ $t('labels.downloading') }}...</span>
        </button>
      </div>
    </div>

    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y">
        <thead class="bg-indigo-50">
          <tr>
            <th v-for="(h, idx) in displayHeaders" :key="idx" class="p-3 text-left">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIdx) in rows" :key="rIdx" class="hover:bg-gray-50">
            <td v-for="(cell, cIdx) in row" :key="cIdx" class="p-3">
              {{ formatCell(cell) }}
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td class="p-3" :colspan="headers.length">{{ $t('labels.noData') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getSuppliesReport } from '../../api'
import * as XLSX from 'xlsx'

export default {
  name: 'SuppliesReport',
  data() {
    return {
      headers: [],
      rows: [],
      downloading: false,
      search: ''
    }
  },
  computed: {
    isRTL() { return this.$i18n && this.$i18n.locale === 'ar' },
    displayHeaders() {
      // Keep Arabic as-is. When in English and headers are Arabic, map to English/i18n labels.
      if (this.isRTL) return this.headers
      const mapping = {
        'التاريخ': this.$t('labels.date'),
        'الكسارة': this.$t('labels.crusher'),
        'الموقع': this.$t('labels.location'),
        'المقاول': this.$t('labels.contractor'),
        'تذكرة الكسارة': this.$t('labels.crusherTicket'),
        'تذكرة الشركة': this.$t('labels.companyTicket'),
        'سعة الشركة': this.$t('labels.companyCapacity'),
        'سعة الكسارة': this.$t('labels.crusherCapacity'),
        'سعر الوحدة': this.$t('labels.unitPrice'),
        'الخصم': this.$t('labels.discount'),
        'إجمالي': this.$t('labels.total'),
        'id': 'id'
      }
      return (this.headers || []).map(h => mapping[h] || String(h))
    }
  },
  mounted() {
    this.fetchReport()
  },
  methods: {
    async fetchReport() {
      try {
        const res = await getSuppliesReport(this.search ? { q: this.search } : {})
        await this.parseAndRenderExcel(res.data)
      } catch (e) {
        this.headers = []
        this.rows = []
      }
    },
    async parseAndRenderExcel(blob) {
      const arrayBuffer = await blob.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      if (!Array.isArray(json) || json.length === 0) {
        this.headers = []
        this.rows = []
        return
      }
      this.headers = (json[0] || []).map(h => String(h))
      this.rows = json.slice(1)
    },
    async downloadExcel() {
      try {
        this.downloading = true
        const res = await getSuppliesReport(this.search ? { q: this.search } : {})
        const blob = res.data

        // Try to use the File System Access API if available (shows Save As dialog)
        const fileName = this.extractFilename(res.headers) || `supplies-report-${new Date().toISOString().slice(0,10)}.xlsx`
        const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        if (window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: fileName,
              types: [{ description: 'Excel Workbook', accept: { [mime]: ['.xlsx'] } }]
            })
            const writable = await handle.createWritable()
            await writable.write(blob)
            await writable.close()
            return
          } catch (e) {
            // If user cancels or API fails, fall back to default browser download
          }
        }

        // Fallback: anchor download (browser decides whether to prompt)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } finally {
        this.downloading = false
      }
    },
    extractFilename(headers) {
      try {
        const cd = headers && (headers['content-disposition'] || headers['Content-Disposition'])
        if (!cd) return null
        // content-disposition: attachment; filename="name.xlsx"
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd)
        const raw = match ? (match[1] || match[2]) : null
        return raw ? decodeURIComponent(raw) : null
      } catch (_) { return null }
    },
    formatCell(v) {
      if (v == null) return ''
      if (typeof v === 'number') return v.toLocaleString(this.isRTL ? 'ar-EG' : 'en-US')
      return String(v)
    }
  }
}
</script>

<style scoped>
/* minimal */
</style>


