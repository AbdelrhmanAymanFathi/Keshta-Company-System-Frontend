<template>
  <div class="space-y-4">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('rental.date') }} *
          </label>
          <input
            v-model="localForm.date"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('rental.equipment') }} *
          </label>
          <input
            v-model="localForm.equipment"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('rental.name') }} *
          </label>
          <input
            v-model="localForm.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('rental.hours') }} *
          </label>
          <input
            v-model.number="localForm.hours"
            type="number"
            min="0"
            step="0.5"
            required
            @input="calculateTotal"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('rental.hourlyRate') }} *
          </label>
          <input
            v-model.number="localForm.hourlyRate"
            type="number"
            min="0"
            step="0.01"
            required
            @input="calculateTotal"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('rental.total') }}
          </label>
          <input
            v-model.number="localForm.total"
            type="number"
            min="0"
            step="0.01"
            @input="handleTotalChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :title="$t('rental.totalCanOverride')"
          >
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ $t('rental.notes') }}
        </label>
        <textarea
          v-model="localForm.notes"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="localForm.isCompanyOwned"
            type="checkbox"
            class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          >
          <span class="text-sm font-medium text-gray-700">
            {{ $t('rental.isCompanyOwned') }}
          </span>
          <Badge :variant="localForm.isCompanyOwned ? 'company' : 'external'" class="ml-2">
            {{ localForm.isCompanyOwned ? $t('rental.companyEquipment') : $t('rental.externalRental') }}
          </Badge>
        </label>
        <p class="text-xs text-gray-500 mt-1">{{ $t('rental.isCompanyOwnedDescription') }}</p>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          {{ $t('labels.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {{ loading ? $t('labels.saving') : (isEditing ? $t('labels.update') : $t('labels.save')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import Badge from '../shared/Badge.vue'

export default {
  name: 'RentalForm',
  components: { Badge },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        date: new Date().toISOString().split('T')[0],
        equipment: '',
        name: '',
        hours: 0,
        hourlyRate: 0,
        total: 0,
        notes: '',
        isCompanyOwned: true
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'submit', 'cancel'],
  setup(props, { emit }) {
    const localForm = ref({ ...props.modelValue })

    // Ensure isCompanyOwned defaults to true
    if (localForm.value.isCompanyOwned === undefined) {
      localForm.value.isCompanyOwned = true
    }

    // Watch for external changes to modelValue. Only apply the update if
    // the incoming value differs from our local form to avoid causing a
    // loop (parent -> child -> parent ...).
    const isEqual = (a, b) => {
      try {
        return JSON.stringify(a) === JSON.stringify(b)
      } catch (e) {
        return false
      }
    }

    watch(() => props.modelValue, (newVal) => {
      if (!isEqual(newVal, localForm.value)) {
        localForm.value = { ...newVal }
        if (localForm.value.isCompanyOwned === undefined) {
          localForm.value.isCompanyOwned = true
        }
      }
    }, { deep: true })

    // Emit changes to parent only when localForm differs from props.modelValue
    // to avoid emitting updates that came from the parent.
    watch(localForm, (newVal) => {
      if (!isEqual(newVal, props.modelValue)) {
        emit('update:modelValue', newVal)
      }
    }, { deep: true })

    const calculateTotal = () => {
      if (localForm.value.hours && localForm.value.hourlyRate) {
        localForm.value.total = localForm.value.hours * localForm.value.hourlyRate
      }
    }

    const handleTotalChange = () => {
      // Allow manual override of total
    }

    const handleSubmit = () => {
      // Validate required fields
      if (!localForm.value.date || !localForm.value.equipment || !localForm.value.name) {
        if (window.$toast) {
          window.$toast('Please fill in all required fields', 'error')
        }
        return
      }

      if (localForm.value.hours <= 0 || localForm.value.hourlyRate <= 0) {
        if (window.$toast) {
          window.$toast('Hours and hourly rate must be greater than 0', 'error')
        }
        return
      }

      // Ensure total is calculated if not manually set
      if (!localForm.value.total || localForm.value.total === 0) {
        calculateTotal()
      }

      // Format date to ISO string
      const submitData = {
        ...localForm.value,
        date: new Date(localForm.value.date).toISOString()
      }

      emit('submit', submitData)
    }

    return {
      localForm,
      calculateTotal,
      handleTotalChange,
      handleSubmit
    }
  }
}
</script>

