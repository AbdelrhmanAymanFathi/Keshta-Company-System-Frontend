<template>
  <DataOrgChart
    :title="$t('orgCharts.expensesTitle')"
    :subtitle="$t('orgCharts.expensesSubtitle')"
    file-name="expenses-chart"
    :fetch-data="fetchExpenses"
    :groups="groups"
    ungrouped-label-key="orgCharts.expensesUngrouped"
    :item-title="itemTitle"
    :item-subtitle="itemSubtitle"
    :item-details="itemDetails"
    item-link-label-key="orgCharts.openDetails"
  />
</template>

<script>
import DataOrgChart from './DataOrgChart.vue'
import { getExpenses } from '../../../../api'

export default {
  name: 'ExpensesOrgChart',
  components: { DataOrgChart },
  data() {
    return {
      groups: [
        { key: 'feed', tone: 'expenses', icon: 'expenses', labelKey: 'orgCharts.expensesFeed', match: (r) => this.isFeed(r) },
        { key: 'operating', tone: 'expenses', icon: 'expenses', labelKey: 'orgCharts.expensesOperating', match: (r) => !this.isFeed(r) && this.isOperating(r) },
        { key: 'other', tone: 'expenses', icon: 'expenses', labelKey: 'orgCharts.expensesOther', match: (r) => !this.isFeed(r) && !this.isOperating(r) },
      ],
    }
  },
  methods: {
    isFeed(r) {
      const name = String(r.mainCategory?.name || r.category?.name || r.categoryName || '').toLowerCase()
      return name.includes('تغذية') || name.includes('عهدة') || name.includes('feed')
    },
    isOperating(r) {
      const name = String(r.mainCategory?.name || r.category?.name || r.categoryName || '').toLowerCase()
      return name.includes('تشغيل') || name.includes('operating') || name.includes('صيانة') || name.includes('maintenance')
    },
    async fetchExpenses() {
      const res = await getExpenses({ page: 1, pageSize: 1000 })
      const payload = res.data
      if (Array.isArray(payload)) return payload
      if (payload && Array.isArray(payload.items)) return payload.items
      if (payload && Array.isArray(payload.data)) return payload.data
      return []
    },
    itemTitle(r) {
      return r.mainCategory?.name || r.category?.name || r.categoryName || this.$t('orgCharts.expensesOther')
    },
    itemSubtitle(r) {
      return r.subCategory?.name || r.subCategoryName || r.notes || ''
    },
    itemDetails(r) {
      const fields = []
      if (r.mainCategory?.name || r.category?.name) fields.push({ label: this.$t('orgCharts.expensesCategory'), value: r.mainCategory?.name || r.category?.name })
      if (r.amount != null) fields.push({ label: this.$t('orgCharts.totalAmount'), value: String(r.amount) })
      if (r.branch?.name || r.branchName) fields.push({ label: this.$t('orgCharts.expensesBranch'), value: r.branch?.name || r.branchName })
      if (r.location?.name || r.locationName) fields.push({ label: this.$t('orgCharts.expensesLocation'), value: r.location?.name || r.locationName })
      return fields
    },
  },
}
</script>
