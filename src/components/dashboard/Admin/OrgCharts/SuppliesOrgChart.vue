<template>
  <DataOrgChart
    :title="$t('orgCharts.suppliesTitle')"
    :subtitle="$t('orgCharts.suppliesSubtitle')"
    file-name="supplies-chart"
    :fetch-data="fetchSupplies"
    :groups="groups"
    ungrouped-label-key="orgCharts.suppliesUngrouped"
    :item-title="itemTitle"
    :item-subtitle="itemSubtitle"
    :item-details="itemDetails"
    :item-link="itemLink"
    item-link-label-key="orgCharts.openContractorPage"
  />
</template>

<script>
import DataOrgChart from './DataOrgChart.vue'
import { getSupplies } from '../../../../api'

export default {
  name: 'SuppliesOrgChart',
  components: { DataOrgChart },
  data() {
    return {
      groups: [
        { key: 'transport', tone: 'transport', icon: 'transport', labelKey: 'navbar.transport', match: (r) => !!(r.contractor?.availableForTransports) },
        { key: 'loading', tone: 'supplies', icon: 'supplies', labelKey: 'orgCharts.suppliesLoading', match: (r) => this.isLoading(r) },
        { key: 'supply', tone: 'supplies', icon: 'supplies', labelKey: 'orgCharts.suppliesMaterial', match: (r) => !this.isLoading(r) && !!(r.contractor?.availableForSupplies || r.contractor?.availableForExports) },
      ],
    }
  },
  methods: {
    isLoading(r) {
      const name = String(r.item?.name || r.itemName || '').toLowerCase()
      return name.includes('نقل') || name.includes('تحميل') || name.includes('transport')
    },
    async fetchSupplies() {
      const res = await getSupplies({ page: 1, pageSize: 1000 })
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
      return r.item?.name || r.itemName || ''
    },
    itemDetails(r) {
      const fields = []
      fields.push({ label: this.$t('orgCharts.itemsCount'), value: String(r.count || r.quantity || r.totalSupplies || 1) })
      if (r.totalAmount != null) fields.push({ label: this.$t('orgCharts.totalAmount'), value: String(r.totalAmount) })
      if (r.contractor?.phone) fields.push({ label: this.$t('contractors.phone'), value: r.contractor.phone })
      return fields
    },
    itemLink(r) {
      const id = r.contractor?.id || r.contractorId
      return id ? { name: 'contractor-detail', params: { id } } : null
    },
  },
}
</script>
