<template>
  <DataOrgChart
    :title="$t('orgCharts.transportTitle')"
    :subtitle="$t('orgCharts.transportSubtitle')"
    file-name="transport-chart"
    :fetch-data="fetchTransports"
    :groups="groups"
    ungrouped-label-key="orgCharts.transportUngrouped"
    :item-title="itemTitle"
    :item-subtitle="itemSubtitle"
    :item-details="itemDetails"
    :item-link="itemLink"
    item-link-label-key="orgCharts.openContractorPage"
  />
</template>

<script>
import DataOrgChart from './DataOrgChart.vue'
import { getTransports } from '../../../../api'

export default {
  name: 'TransportOrgChart',
  components: { DataOrgChart },
  data() {
    return {
      groups: [
        { key: 'company', tone: 'transport', icon: 'transport', labelKey: 'orgCharts.transportCompanyVehicles', match: (r) => this.isCompanyOwned(r) },
        { key: 'contractor', tone: 'transport', icon: 'transport', labelKey: 'orgCharts.transportContractorVehicles', match: (r) => !this.isCompanyOwned(r) },
      ],
    }
  },
  methods: {
    isCompanyOwned(r) {
      return r.isCompanyOwned === true || r.vehicle?.isCompanyOwned === true
    },
    async fetchTransports() {
      const res = await getTransports({ page: 1, pageSize: 1000 })
      const payload = res.data
      if (Array.isArray(payload)) return payload
      if (payload && Array.isArray(payload.items)) return payload.items
      if (payload && Array.isArray(payload.data)) return payload.data
      return []
    },
    itemTitle(r) {
      return r.contractor?.name || r.contractorName || this.$t('orgCharts.unknownEntity')
    },
    itemSubtitle(r) {
      return r.vehicle?.plateNumber || r.vehicle?.name || r.item?.name || r.itemName || ''
    },
    itemDetails(r) {
      const fields = []
      if (r.vehicle?.plateNumber) fields.push({ label: this.$t('orgCharts.transportPlate'), value: r.vehicle.plateNumber })
      if (r.item?.name || r.itemName) fields.push({ label: this.$t('orgCharts.transportItem'), value: r.item?.name || r.itemName })
      if (r.totalAmount != null) fields.push({ label: this.$t('orgCharts.totalAmount'), value: String(r.totalAmount) })
      return fields
    },
    itemLink(r) {
      const id = r.contractor?.id || r.contractorId
      return id ? { name: 'contractor-detail', params: { id } } : null
    },
  },
}
</script>
