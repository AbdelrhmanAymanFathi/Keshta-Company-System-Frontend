<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ rental?.equipment }}</h2>
        <p class="text-gray-600 mt-1">{{ rental?.name }}</p>
      </div>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Computed Fields (Read-only) -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('rental.summary') }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <div class="text-sm text-gray-600">{{ $t('rental.hourlyRate') }}</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatCurrency(rental?.hourlyRate || 0) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ $t('rental.hours') }} ({{ $t('rental.computed') }})</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatHours(rental?.hours) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ $t('rental.total') }} ({{ $t('rental.computed') }})</div>
          <div class="text-lg font-semibold text-gray-900">{{ formatCurrency(rental?.total || 0) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ $t('rental.paid') }}</div>
          <div class="text-lg font-semibold text-green-600">{{ formatCurrency(rental?.paid || 0) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600">{{ $t('rental.remaining') }}</div>
          <div class="text-lg font-semibold text-red-600">{{ formatCurrency(rental?.remaining || 0) }}</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'jobs'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'jobs'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ $t('rental.jobs') }}
        </button>
        <button
          @click="activeTab = 'summary'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'summary'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ $t('rental.jobsSummary') }}
        </button>
        <button
          @click="activeTab = 'payouts'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'payouts'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ $t('rental.payouts') }}
        </button>
      </nav>
    </div>

    <!-- Jobs Tab -->
    <div v-if="activeTab === 'jobs'" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">{{ $t('rental.jobs') }}</h3>
        <button
          @click="openAddJobModal"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          {{ $t('rental.addJob') }}
        </button>
      </div>

      <!-- Jobs Table -->
      <div v-if="jobsLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      <div v-else-if="jobs.length === 0" class="text-center py-8 text-gray-500">
        {{ $t('rental.noJobs') }}
      </div>
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.date') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.job') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.hours') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('rental.notes') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('labels.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(job.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ job.job }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ job.hours }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ job.notes || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-3">
                  <button
                    @click="openEditJobModal(job)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    {{ $t('labels.edit') }}
                  </button>
                  <button
                    @click="confirmDeleteJob(job)"
                    class="text-red-600 hover:text-red-900"
                  >
                    {{ $t('labels.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Jobs Summary Tab -->
    <div v-if="activeTab === 'summary'" class="space-y-4">
      <div v-if="summaryLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      <div v-else-if="summary">
        <!-- Summary Box -->
        <div class="bg-indigo-50 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('rental.summary') }}</h3>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-gray-600">{{ $t('rental.hourlyRate') }}</div>
              <div class="text-xl font-semibold text-gray-900">{{ formatCurrency(summary.hourlyRate || 0) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ $t('rental.totalHours') }}</div>
              <div class="text-xl font-semibold text-gray-900">{{ formatHours(summary.totalHours) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">{{ $t('rental.totalPay') }}</div>
              <div class="text-xl font-semibold text-gray-900">{{ formatCurrency(summary.totalPay || 0) }}</div>
            </div>
          </div>
        </div>

        <!-- Per-day Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <h3 class="text-lg font-semibold text-gray-900 p-4 border-b">{{ $t('rental.perDayBreakdown') }}</h3>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('rental.date') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('rental.hours') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('rental.pay') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="day in summary.days" :key="day.date" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(day.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ day.hours }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(day.pay) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Payouts Tab -->
    <div v-if="activeTab === 'payouts'" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">{{ $t('rental.payouts') }}</h3>
      </div>

      <!-- Add Payout Form -->
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('rental.addPayout') }}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            v-model="payoutForm.amount"
            type="number"
            :placeholder="$t('rental.amount')"
            class="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="payoutForm.date"
            type="date"
            class="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <input
            v-model="payoutForm.notes"
            type="text"
            :placeholder="$t('rental.notes') + ' (optional)'"
            class="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <button
          @click="savePayout"
          :disabled="!payoutForm.amount || payoutsLoading"
          class="mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
        >
          {{ payoutsLoading ? $t('labels.saving') : $t('labels.add') }}
        </button>
      </div>

      <!-- Payouts List -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-3">{{ $t('rental.payoutsList') }}</h4>
        <div v-if="payoutsLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <div v-else-if="payouts.length === 0" class="text-center py-4 text-gray-500">
          {{ $t('rental.noPayouts') }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="payout in payouts"
            :key="payout.id"
            class="flex items-center justify-between bg-gray-50 p-3 rounded border"
          >
            <div>
              <div class="text-sm font-medium">{{ formatCurrency(payout.amount) }}</div>
              <div class="text-xs text-gray-500">{{ formatDate(payout.date) }}</div>
              <div v-if="payout.notes" class="text-xs text-gray-600">{{ payout.notes }}</div>
            </div>
            <button
              @click="deletePayout(payout.id)"
              :disabled="payoutsLoading"
              class="text-red-600 hover:text-red-900 text-sm"
            >
              {{ $t('labels.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Job Modal -->
    <div
      v-if="showJobModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeJobModal"
    >
      <div class="relative bg-white rounded-md shadow-lg border w-full max-w-md">
        <div class="p-5 border-b flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingJob ? $t('rental.editJob') : $t('rental.addJob') }}
          </h3>
          <button @click="closeJobModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('rental.date') }} *
            </label>
            <input
              v-model="jobForm.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('rental.job') }} *
            </label>
            <input
              v-model="jobForm.job"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('rental.hours') }} *
            </label>
            <input
              v-model.number="jobForm.hours"
              type="number"
              min="0"
              step="0.5"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('rental.notes') }}
            </label>
            <textarea
              v-model="jobForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              @click="closeJobModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {{ $t('labels.cancel') }}
            </button>
            <button
              @click="saveJob"
              :disabled="savingJob || !jobForm.date || !jobForm.job || !jobForm.hours"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ savingJob ? $t('labels.saving') : $t('labels.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Job Confirmation -->
    <ConfirmDialog
      :show="showDeleteJobModal"
      :title="$t('rental.deleteJob')"
      :message="$t('rental.deleteJobConfirmation')"
      :loading="deletingJob"
      type="danger"
      @confirm="deleteJob"
      @cancel="showDeleteJobModal = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import {
  getRentalJobs,
  createRentalJob,
  updateRentalJob,
  deleteRentalJob,
  getRentalJobsSummary,
  getRentalPayouts,
  createRentalPayout,
  deleteRentalPayout,
  getRental
} from '@/api'
import ConfirmDialog from '../shared/ConfirmDialog.vue'

export default {
  name: 'RentalDetail',
  components: { ConfirmDialog },
  props: {
    rentalId: {
      type: [Number, String],
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const rental = ref(null)
    const activeTab = ref('jobs')
    const jobs = ref([])
    const jobsLoading = ref(false)
    const summary = ref(null)
    const summaryLoading = ref(false)
    const payouts = ref([])
    const payoutsLoading = ref(false)
    const showJobModal = ref(false)
    const editingJob = ref(null)
    const savingJob = ref(false)
    const showDeleteJobModal = ref(false)
    const jobToDelete = ref(null)
    const deletingJob = ref(false)

    const jobForm = ref({
      date: new Date().toISOString().split('T')[0],
      job: '',
      hours: 0,
      notes: ''
    })

    const payoutForm = ref({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })

    const loadRental = async () => {
      try {
        const response = await getRental(props.rentalId)
        rental.value = response.data
      } catch (error) {
        console.error('Error loading rental:', error)
        if (window.$toast) {
          window.$toast('Failed to load rental', 'error')
        }
      }
    }

    const loadJobs = async () => {
      jobsLoading.value = true
      try {
        const response = await getRentalJobs(props.rentalId)
        jobs.value = response.data || []
      } catch (error) {
        console.error('Error loading jobs:', error)
        if (window.$toast) {
          window.$toast('Failed to load jobs', 'error')
        }
      } finally {
        jobsLoading.value = false
      }
    }

    const loadSummary = async () => {
      summaryLoading.value = true
      try {
        const response = await getRentalJobsSummary(props.rentalId)
        summary.value = response.data
      } catch (error) {
        console.error('Error loading summary:', error)
        if (window.$toast) {
          window.$toast('Failed to load summary', 'error')
        }
      } finally {
        summaryLoading.value = false
      }
    }

    const loadPayouts = async () => {
      payoutsLoading.value = true
      try {
        const response = await getRentalPayouts(props.rentalId)
        payouts.value = response.data || []
      } catch (error) {
        console.error('Error loading payouts:', error)
        if (window.$toast) {
          window.$toast('Failed to load payouts', 'error')
        }
      } finally {
        payoutsLoading.value = false
      }
    }

    const refreshAll = async () => {
      await Promise.all([
        loadRental(),
        loadJobs(),
        loadSummary(),
        loadPayouts()
      ])
    }

    const openAddJobModal = () => {
      editingJob.value = null
      jobForm.value = {
        date: new Date().toISOString().split('T')[0],
        job: '',
        hours: 0,
        notes: ''
      }
      showJobModal.value = true
    }

    const openEditJobModal = (job) => {
      editingJob.value = job
      jobForm.value = {
        date: job.date ? job.date.split('T')[0] : new Date().toISOString().split('T')[0],
        job: job.job || '',
        hours: job.hours || 0,
        notes: job.notes || ''
      }
      showJobModal.value = true
    }

    const closeJobModal = () => {
      showJobModal.value = false
      editingJob.value = null
      jobForm.value = {
        date: new Date().toISOString().split('T')[0],
        job: '',
        hours: 0,
        notes: ''
      }
    }

    const saveJob = async () => {
      savingJob.value = true
      try {
        const payload = {
          date: new Date(jobForm.value.date).toISOString(),
          job: jobForm.value.job,
          hours: parseFloat(jobForm.value.hours),
          notes: jobForm.value.notes || ''
        }

        if (editingJob.value) {
          await updateRentalJob(props.rentalId, editingJob.value.id, payload)
          if (window.$toast) {
            window.$toast('Job updated successfully', 'success')
          }
        } else {
          await createRentalJob(props.rentalId, payload)
          if (window.$toast) {
            window.$toast('Job created successfully', 'success')
          }
        }

        closeJobModal()
        await refreshAll()
      } catch (error) {
        console.error('Error saving job:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to save job', 'error')
        }
      } finally {
        savingJob.value = false
      }
    }

    const confirmDeleteJob = (job) => {
      jobToDelete.value = job
      showDeleteJobModal.value = true
    }

    const deleteJob = async () => {
      deletingJob.value = true
      try {
        await deleteRentalJob(props.rentalId, jobToDelete.value.id)
        if (window.$toast) {
          window.$toast('Job deleted successfully', 'success')
        }
        showDeleteJobModal.value = false
        jobToDelete.value = null
        await refreshAll()
      } catch (error) {
        console.error('Error deleting job:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to delete job', 'error')
        }
      } finally {
        deletingJob.value = false
      }
    }

    const savePayout = async () => {
      if (!payoutForm.value.amount || payoutForm.value.amount <= 0) {
        if (window.$toast) {
          window.$toast('Please enter a valid amount', 'error')
        }
        return
      }

      payoutsLoading.value = true
      try {
        await createRentalPayout(props.rentalId, {
          amount: parseFloat(payoutForm.value.amount),
          date: payoutForm.value.date,
          notes: payoutForm.value.notes
        })
        if (window.$toast) {
          window.$toast('Payout created successfully', 'success')
        }
        payoutForm.value = {
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        }
        await refreshAll()
      } catch (error) {
        console.error('Error creating payout:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to create payout', 'error')
        }
      } finally {
        payoutsLoading.value = false
      }
    }

    const deletePayout = async (payoutId) => {
      payoutsLoading.value = true
      try {
        await deleteRentalPayout(props.rentalId, payoutId)
        if (window.$toast) {
          window.$toast('Payout deleted successfully', 'success')
        }
        await refreshAll()
      } catch (error) {
        console.error('Error deleting payout:', error)
        if (window.$toast) {
          window.$toast(error.response?.data?.message || 'Failed to delete payout', 'error')
        }
      } finally {
        payoutsLoading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
      }).format(amount)
    }

    const formatHours = (value) => {
      const num = Number(value || 0)
      if (Number.isNaN(num)) {
        return '0.00'
      }
      return num.toFixed(2)
    }

    watch(activeTab, (newTab) => {
      if (newTab === 'summary' && !summary.value) {
        loadSummary()
      } else if (newTab === 'payouts' && payouts.value.length === 0) {
        loadPayouts()
      }
    })

    onMounted(() => {
      refreshAll()
    })

    return {
      rental,
      activeTab,
      jobs,
      jobsLoading,
      summary,
      summaryLoading,
      payouts,
      payoutsLoading,
      showJobModal,
      editingJob,
      savingJob,
      jobForm,
      payoutForm,
      showDeleteJobModal,
      deletingJob,
      openAddJobModal,
      openEditJobModal,
      closeJobModal,
      saveJob,
      confirmDeleteJob,
      deleteJob,
      savePayout,
      deletePayout,
      formatDate,
      formatCurrency,
      formatHours
    }
  }
}
</script>

