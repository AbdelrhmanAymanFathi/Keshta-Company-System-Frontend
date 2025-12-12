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
            {{ $t('rental.hourlyRate') }} *
          </label>
          <input
            v-model.number="localForm.hourlyRate"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        hourlyRate: 0,
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
    // Always apply external modelValue changes to localForm. We no longer
    // emit update:modelValue on every change, so copying here is safe and
    // ensures the edit form is populated correctly when opened.
    watch(() => props.modelValue, (newVal) => {
      if (newVal && typeof newVal === 'object') {
        // Deep copy to avoid reference issues
        localForm.value = JSON.parse(JSON.stringify(newVal))
      } else {
        localForm.value = { ...props.modelValue }
      }
      if (localForm.value.isCompanyOwned === undefined) {
        localForm.value.isCompanyOwned = true
      }
    }, { deep: true, immediate: true })

    // Do NOT emit update:modelValue on every change — we only emit on submit.
    // This avoids unnecessary parent <-> child two-way binding that can lead
    // to recursive update loops. The parent should pass the initial
    // `modelValue` and react to the `submit` event.

    const handleSubmit = () => {
      // Validate required fields
      if (!localForm.value.date || !localForm.value.equipment || !localForm.value.name) {
        if (window.$toast) {
          window.$toast('Please fill in all required fields', 'error')
        }
        return
      }

      if (localForm.value.hourlyRate <= 0) {
        if (window.$toast) {
          window.$toast('Hourly rate must be greater than 0', 'error')
        }
        return
      }

      // Format date to ISO string and prepare payload
      // Only send: date, equipment, name, hourlyRate, notes, isCompanyOwned
      // Do NOT send hours or total
      const submitData = {
        date: new Date(localForm.value.date).toISOString(),
        equipment: localForm.value.equipment,
        name: localForm.value.name,
        hourlyRate: localForm.value.hourlyRate,
        notes: localForm.value.notes || '',
        isCompanyOwned: localForm.value.isCompanyOwned !== undefined ? localForm.value.isCompanyOwned : true
      }

      emit('submit', submitData)
    }

    return {
      localForm,
      handleSubmit
    }
  }
}
</script>

