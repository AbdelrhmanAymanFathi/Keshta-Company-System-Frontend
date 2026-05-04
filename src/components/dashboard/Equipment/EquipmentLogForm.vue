<template>
  <div class="space-y-4">
    <form @submit.prevent="onFormSubmit" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-600">{{ $t('labels.step') || 'Step' }} {{ currentStep }} / 2</div>
      </div>

      <!-- Stage 1: date, equipment, hourlyRate -->
      <div v-if="currentStep === 1" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('equipmentLog.date') }} *
          </label>
          <DateField
            v-model="localForm.date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('equipmentLog.equipment') }} *
          </label>
          <SearchDropdown
            v-model="localForm.equipmentLabel"
            :items="equipments"
            :item-key="'id'"
            :item-label="'name'"
            :placeholder="$t('equipmentLog.searchPlaceholder') || 'Search equipment'"
            @select="onSelectEquipment"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('equipmentLog.hourlyRate') }} *
          </label>
          <input
            v-model.number="localForm.hourlyRate"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Stage 2: notes, hours, driver -->
      <div v-if="currentStep === 2" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('equipmentLog.hours') }}
            </label>
            <input
              v-model.number="localForm.hours"
              type="number"
              min="0"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('equipmentLog.driver') }}
            </label>
            <SearchDropdown
              v-model="localForm.driverLabel"
              :items="driverItems"
              :item-key="'id'"
              :item-label="'name'"
              :placeholder="$t('equipmentLog.searchDriver') || 'Search driver'"
              @select="onSelectDriver"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ $t('labels.location') || 'Location' }}
            </label>
            <select v-model="localForm.locationId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">{{ $t('labels.select') || 'Select location' }}</option>
              <option v-for="loc in topLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('equipmentLog.notes') }}</label>
          <textarea
            v-model="localForm.notes"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('labels.area') || 'Area' }}</label>
          <select v-model="localForm.areaId" :disabled="!localForm.locationId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100">
            <option value="">{{ $t('labels.select') || 'Select area' }}</option>
            <option v-for="a in availableAreas" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
          <p class="text-xs text-gray-400 mt-1">Optional — choose location and area where the work occurred</p>
        </div>
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
          v-if="currentStep === 1"
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {{ $t('labels.next') || 'Next' }}
        </button>

        <div v-else class="flex gap-3">
          <button
            type="button"
            @click="currentStep = 1"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            {{ $t('labels.back') || 'Back' }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {{ loading ? $t('labels.saving') : (isEditing ? $t('labels.update') : $t('labels.save')) }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue'
import SearchDropdown from '../../shared/SearchDropdown.vue'
import DateField from '../../shared/DateField.vue'
import { getDrivers } from '@/api'
import { getLocations } from '@/api'
import { getTodayISO } from '@/utils/dateUtils'

export default {
  name: 'EquipmentLogForm',
  components: { SearchDropdown, DateField },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        date: getTodayISO(),
        equipmentLog: '',
        equipmentId: '',
        isRental: false,
        driverId: '',
        hours: 1,
        hourlyRate: 0,
        notes: '',
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    equipments: {
      type: Array,
      default: () => []
    },
    drivers: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'submit', 'cancel'],
  setup(props, { emit }) {
    const localForm = ref({ ...props.modelValue, equipmentId: props.modelValue.equipmentId || '', driverId: props.modelValue.driverId || '', isRental: Boolean(props.modelValue.isRental), equipmentLabel: '', driverLabel: '' })
    const fetchedDrivers = ref([])
    const driverItems = computed(() => ((props.drivers && props.drivers.length) ? props.drivers : fetchedDrivers.value))

    const currentStep = ref(1)
    const locations = ref([])
    const topLocations = ref([])

    onMounted(async () => {
      try {
        const res = await getDrivers({ page: 1, pageSize: 1000 })
        fetchedDrivers.value = Array.isArray(res.data) ? res.data : (res.data?.items || res.data || [])
      } catch (e) {
        fetchedDrivers.value = []
      }
      // load locations for optional site/area
      try {
        const locRes = await getLocations()
        const all = Array.isArray(locRes.data) ? locRes.data : []
        locations.value = all
        topLocations.value = all.filter(l => !l.parentId)
      } catch (e) {
        locations.value = []
        topLocations.value = []
      }
    })

    watch(() => props.modelValue, (newVal) => {
      if (newVal && typeof newVal === 'object') {
        localForm.value = JSON.parse(JSON.stringify(newVal))
      } else {
        localForm.value = { ...props.modelValue }
      }
      if (newVal) {
        if (newVal.equipmentLog) {
          localForm.value.equipmentLabel = newVal.equipmentLog
        } else if (newVal.equipment) {
          localForm.value.equipmentLabel = newVal.equipment
        }
        if (newVal.equipmentId != null) {
          localForm.value.equipmentId = Number(newVal.equipmentId)
        }
        if (newVal.isRental != null) {
          localForm.value.isRental = Boolean(newVal.isRental)
        }
        if (newVal.driverId != null) {
          localForm.value.driverId = Number(newVal.driverId)
        }
        if (newVal.hours != null) {
          localForm.value.hours = Number(newVal.hours)
        }
        // location/area
        if (newVal.locationId != null) localForm.value.locationId = Number(newVal.locationId)
        if (newVal.areaId != null) localForm.value.areaId = Number(newVal.areaId)
      }
    }, { deep: true, immediate: true })

    const handleSubmit = () => {
      if (!localForm.value.date || !(localForm.value.equipmentLabel || localForm.value.equipment || localForm.value.equipmentLog)) {
        if (window.$toast) {
          window.$toast('Please fill in all required fields', 'error')
        }
        return
      }

      const hourlyRateNum = Number(localForm.value.hourlyRate || 0)
      if (isNaN(hourlyRateNum) || hourlyRateNum <= 0) {
        if (window.$toast) {
          window.$toast('Hourly rate must be greater than 0', 'error')
        }
        return
      }

      let equipmentIdNumeric = Number(localForm.value.equipmentId)
      if (isNaN(equipmentIdNumeric)) {
        const found = (props.equipments || []).find(e => (e.name || String(e)).toString() === (localForm.value.equipmentLabel || localForm.value.equipment || localForm.value.equipmentLog))
        if (found && found.id != null) equipmentIdNumeric = Number(found.id)
      }
      if (isNaN(equipmentIdNumeric)) {
        if (window.$toast) {
          window.$toast('Please select equipment from the dropdown', 'error')
        }
        return
      }

      let driverIdNumeric = Number(localForm.value.driverId)
      if (isNaN(driverIdNumeric)) {
        const foundDriver = (props.drivers || []).find(d => (d.name || String(d)).toString() === (localForm.value.driverLabel || ''))
        if (foundDriver && foundDriver.id != null) driverIdNumeric = Number(foundDriver.id)
      }
      if (isNaN(driverIdNumeric)) driverIdNumeric = null

      let hoursNum = Number(localForm.value.hours)
      if (isNaN(hoursNum) || hoursNum <= 0) hoursNum = 1

      const submitData = {
        date: new Date(localForm.value.date).toISOString(),
        equipmentId: equipmentIdNumeric,
        driverId: driverIdNumeric,
        hourlyRate: hourlyRateNum,
        hours: hoursNum,
        total: Number((hourlyRateNum * hoursNum).toFixed(2)),
        notes: localForm.value.notes || '',
        isRental: Boolean(localForm.value.isRental) // true when selected equipment has a contractor
      }

      if (localForm.value.locationId != null && localForm.value.locationId !== '') submitData.locationId = Number(localForm.value.locationId)
      if (localForm.value.areaId != null && localForm.value.areaId !== '') submitData.areaId = Number(localForm.value.areaId)

      emit('submit', submitData)
    }

    const onFormSubmit = () => {
      // If currently on step 1, validate basic fields and advance to step 2
      if (currentStep.value === 1) {
        if (!localForm.value.date || !(localForm.value.equipmentLabel || localForm.value.equipment || localForm.value.equipmentLog)) {
          if (window.$toast) window.$toast('Please fill in all required fields', 'error')
          return
        }
        const hourlyRateNum = Number(localForm.value.hourlyRate || 0)
        if (isNaN(hourlyRateNum) || hourlyRateNum <= 0) {
          if (window.$toast) window.$toast('Hourly rate must be greater than 0', 'error')
          return
        }
        currentStep.value = 2
        return
      }

      // On step 2, submit final payload
      handleSubmit()
    }

    const availableAreas = computed(() => {
      if (!locations.value || !Array.isArray(locations.value)) return []
      if (!localForm.value.locationId) return []
      return locations.value.filter(l => Number(l.parentId) === Number(localForm.value.locationId))
    })

    function onSelectEquipment(item) {
      if (!item) {
        localForm.value.equipmentId = ''
        localForm.value.equipmentLabel = ''
        localForm.value.isRental = false
        return
      }
      localForm.value.equipmentId = item.id != null ? Number(item.id) : ''
      localForm.value.equipmentLabel = item.name ?? ''
      // if equipment has a contractor, treat as rental; otherwise company-owned
      localForm.value.isRental = Boolean(item.contractorId ?? item.contractor ?? false)
      if (item.hourlyRate != null && item.hourlyRate !== '') localForm.value.hourlyRate = Number(item.hourlyRate)
    }

    function onSelectDriver(item) {
      if (!item) {
        localForm.value.driverId = ''
        localForm.value.driverLabel = ''
        return
      }
      localForm.value.driverId = item.id != null ? Number(item.id) : ''
      localForm.value.driverLabel = item.name ?? ''
    }

    return { localForm, onSelectEquipment, onSelectDriver, handleSubmit, onFormSubmit, currentStep, driverItems, locations, topLocations, availableAreas }
  }
}
</script>
