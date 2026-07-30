<template>
  <div class="space-y-6 p-0 sm:p-0.5 md:p-1 lg:p-0">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">{{ $t('equipmentLog.detail') }}</h3>
      <div class="flex items-center gap-2">
        <button @click="$emit('close')" class="theme-text-muted hover:theme-text-secondary">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {{ error }}
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('equipmentLog.date') }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ formatDate(rental.date) }}</div>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('equipmentLog.equipment') }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ rental.equipment || rental.equipmentLog || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('equipmentLog.total') }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ formatCurrency(rental.total || 0) }}</div>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('labels.discount') || 'Discount' }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ formatCurrency(rental.discount || 0) }}</div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('labels.location') || 'Location' }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ rental.location?.name || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('labels.area') || 'Area' }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ rental.area?.name || '-' }}</div>
        </div>
        <div class="bg-white rounded-lg p-4 border">
          <div class="text-sm theme-text-muted">{{ $t('equipmentLog.driver') }}</div>
          <div class="mt-2 font-medium theme-text-primary">{{ rental.driver?.name || rental.driverLabel || '-' }}</div>
        </div>
      </div>

      <div class="mt-4 bg-white rounded-lg p-4 border">
        <h4 class="text-sm font-medium mb-3">{{ $t('equipmentLog.jobEntries') }}</h4>
        <div v-if="jobs.length === 0" class="theme-text-muted py-6 text-center">
          {{ $t('equipmentLog.noJobs') }}
        </div>
        <div v-else class="space-y-3">
          <div v-for="job in jobs" :key="job.id" class="flex items-center justify-between p-3 border rounded">
            <div>
              <div class="text-sm font-medium">{{ job.name || job.notes || job.note || '-' }}</div>
              <div class="text-xs theme-text-muted">
                {{ formatDate(job.date) }} • {{ job.hours }} {{ $t('equipmentLog.hours') }} • {{ $t('labels.discount') || 'Discount' }}: {{ formatCurrency(job.discount || 0) }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm font-semibold">{{ formatCurrency(job.total ?? Math.max(0, (Number(job.hours || 0) * Number(job.hourlyRate || rental.hourlyRate || 0)) - Number(job.discount || 0))) }}</div>
              <button @click="editJob(job)" class="theme-text hover:theme-accent-muted text-sm">{{ $t('labels.edit') }}</button>
              <button @click="deleteJob(job)" class="text-red-600 hover:text-red-900 text-sm">{{ $t('labels.delete') }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-4 border">
        <h4 class="text-sm font-medium mb-3">{{ $t('equipmentLog.addJob') }}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <DateField v-model="jobForm.date" class="border rounded px-3 py-2 text-sm" />
          <input v-model.number="jobForm.hours" type="number" min="0" step="0.1" placeholder="Hours"
            class="border rounded px-3 py-2 text-sm" />
          <input v-model.number="jobForm.hourlyRate" type="number" min="0" step="0.01" placeholder="Hourly Rate"
            class="border rounded px-3 py-2 text-sm" />
          <input v-model.number="jobForm.discount" type="number" min="0" step="0.01" placeholder="Discount"
            class="border rounded px-3 py-2 text-sm" />
          <input v-model="jobForm.note" type="text" placeholder="Note"
            class="border rounded px-3 py-2 text-sm col-span-1 sm:col-span-4" />
        </div>
        <div class="mt-3 flex gap-2">
          <button @click="saveJob" :disabled="savingJob"
            class="theme-button px-4 py-2 rounded">{{ savingJob ? $t('labels.saving') : $t('labels.save') }}</button>
          <button @click="resetJobForm" class="px-4 py-2 border rounded">{{ $t('labels.reset') }}</button>
        </div>
      </div>

      <div class="bg-white rounded-lg p-4 border">
        <h4 class="text-sm font-medium mb-3">{{ $t('equipmentLog.notes') }}</h4>
        <textarea v-model="rental.notes" rows="4" class="w-full border rounded px-3 py-2 text-sm"></textarea>
        <div class="mt-3 flex justify-end">
          <button @click="saveNotes" class="bg-green-600 hover:bg-green-700 theme-text-light px-4 py-2 rounded">{{ $t('labels.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DateField from '@/components/shared/DateField.vue'
import { formatToISODate, getTodayISO } from '@/utils/dateUtils'
import { getRental, getRentalJobs, createEquipmentLog, updateEquipmentLog, deleteEquipmentLog } from '@/api'

export default {
  name: 'EquipmentLogDetail',
  props: {
    rentalId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close'],
  components: { DateField },
  setup(props) {
    const { locale } = useI18n()
    const loading = ref(true)
    const error = ref(null)
    const rental = ref({})
    const jobs = ref([])
    const savingJob = ref(false)
    const jobForm = ref({ id: null, date: getTodayISO(), hours: 0, hourlyRate: 0, discount: 0, note: '' })

    const fetchRental = async () => {
      loading.value = true
      error.value = null
      try {
        const res = await getRental(props.rentalId)
        rental.value = res.data || res
        await fetchJobs()
      } catch (e) {
        error.value = e.response?.data?.message || 'Failed to load'
      } finally {
        loading.value = false
      }
    }

    const fetchJobs = async () => {
      try {
        const res = await getRentalJobs(props.rentalId)
        jobs.value = Array.isArray(res.data) ? res.data : (res.data?.items || [])
      } catch (e) {
        jobs.value = []
      }
    }

    const saveJob = async () => {
      savingJob.value = true
      try {
        // normalize numeric fields to avoid Zod validation errors
        const equipmentIdCandidate = rental.value.equipmentId ?? rental.value.equipment ?? null
        const equipmentIdNumeric = equipmentIdCandidate != null ? Number(equipmentIdCandidate) : NaN
        if (isNaN(equipmentIdNumeric)) {
          if (window.$toast) window.$toast('Please ensure the rental has a valid equipment selected', 'error')
          savingJob.value = false
          return
        }

        let hoursNum = Number(jobForm.value.hours)
        if (isNaN(hoursNum) || hoursNum <= 0) hoursNum = 1

        const hourlyRateNum = Number(jobForm.value.hourlyRate || rental.value.hourlyRate || 0)
        const discountNum = Math.max(0, Number(jobForm.value.discount || 0))
        const totalNum = Number(Math.max(0, (hoursNum * hourlyRateNum) - discountNum).toFixed(2))

          const payload = {
            date: new Date(jobForm.value.date).toISOString(),
            hours: hoursNum,
            hourlyRate: hourlyRateNum,
            discount: discountNum,
            total: totalNum,
            note: jobForm.value.note,
            isRental: true,
            equipmentId: equipmentIdNumeric
          }

        if (jobForm.value.id) {
          await updateEquipmentLog(jobForm.value.id, payload)
        } else {
          await createEquipmentLog(payload)
        }
        await fetchJobs()
        resetJobForm()
      } catch (e) {
        console.error(e)
        if (window.$toast) window.$toast(e.response?.data?.message || 'Failed to save job', 'error')
      } finally {
        savingJob.value = false
      }
    }

    const editJob = (job) => {
      jobForm.value = {
        id: job.id,
        date: job.date ? formatToISODate(job.date) : getTodayISO(),
        hours: job.hours || 0,
        hourlyRate: job.hourlyRate || 0,
        discount: job.discount || 0,
        note: job.note || job.notes || ''
      }
    }

    const deleteJob = async (job) => {
      try {
        await deleteEquipmentLog(job.id)
        await fetchJobs()
        if (window.$toast) window.$toast('Job deleted', 'success')
      } catch (e) {
        console.error(e)
        if (window.$toast) window.$toast('Failed to delete job', 'error')
      }
    }

    const resetJobForm = () => {
      jobForm.value = { id: null, date: getTodayISO(), hours: 0, hourlyRate: 0, discount: 0, note: '' }
    }

    const saveNotes = async () => {
      try {
        await updateEquipmentLog(props.rentalId, { note: rental.value.notes })
        if (window.$toast) window.$toast('Notes saved', 'success')
      } catch (e) {
        console.error(e)
        if (window.$toast) window.$toast('Failed to save notes', 'error')
      }
    }

    const formatDate = (d) => {
      if (!d) return '-'
      const date = new Date(d)
      if (isNaN(date.getTime())) return d
      return new Intl.DateTimeFormat('en-GB').format(date)
    }

    const formatCurrency = (amount) => {
      const rtl = locale.value === 'ar'
      const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)
      return rtl && formatted.startsWith('-') ? '\u200E' + formatted : formatted
    }

    onMounted(fetchRental)

    return { loading, error, rental, jobs, jobForm, savingJob, fetchJobs, saveJob, editJob, deleteJob, resetJobForm, saveNotes, formatDate, formatCurrency }
  }
}
</script>

<style scoped>
.text-small { font-size: 0.875rem }
</style>
