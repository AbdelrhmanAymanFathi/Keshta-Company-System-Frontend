<template>
  <DataOrgChart
    :title="$t('orgCharts.equipmentTitle')"
    :subtitle="$t('orgCharts.equipmentSubtitle')"
    file-name="equipment-chart"
    :fetch-data="fetchEquipment"
    :groups="groups"
    ungrouped-label-key="orgCharts.equipmentUngrouped"
    :item-title="itemTitle"
    :item-subtitle="itemSubtitle"
    :item-details="itemDetails"
    :item-link="itemLink"
    item-link-label-key="orgCharts.openDetails"
  />
</template>

<script>
import DataOrgChart from './DataOrgChart.vue'
import { getEquipments } from '../../../../api'

export default {
  name: 'EquipmentOrgChart',
  components: { DataOrgChart },
  data() {
    return {
      groups: [
        { key: 'owned', tone: 'equipment', icon: 'equipment', labelKey: 'orgCharts.equipmentOwned', match: (r) => r.isCompanyOwned === true },
        { key: 'rented', tone: 'equipment', icon: 'equipment', labelKey: 'orgCharts.equipmentRented', match: (r) => r.isCompanyOwned !== true },
      ],
    }
  },
  methods: {
    async fetchEquipment() {
      const res = await getEquipments({ page: 1, pageSize: 1000 })
      const payload = res.data
      if (Array.isArray(payload)) return payload
      if (payload && Array.isArray(payload.items)) return payload.items
      if (payload && Array.isArray(payload.data)) return payload.data
      return []
    },
    itemTitle(r) {
      return r.name || r.equipmentName || this.$t('orgCharts.unknownEntity')
    },
    itemSubtitle(r) {
      return r.contractor?.name || r.contractorName || r.plateNumber || ''
    },
    itemDetails(r) {
      const fields = []
      fields.push({
        label: this.$t('orgCharts.equipmentOwnership'),
        value: r.isCompanyOwned === true ? this.$t('orgCharts.equipmentOwned') : this.$t('orgCharts.equipmentRented'),
      })
      if (r.contractor?.name || r.contractorName) fields.push({ label: this.$t('orgCharts.transportContractorVehicles'), value: r.contractor?.name || r.contractorName })
      if (r.dailyRate != null) fields.push({ label: this.$t('orgCharts.equipmentDailyRate'), value: String(r.dailyRate) })
      return fields
    },
    itemLink(r) {
      const id = r.contractor?.id || r.contractorId
      return id ? { name: 'contractor-detail', params: { id } } : null
    },
  },
}
</script>
