<template>
  <OrgChartShell
    :title="$t('orgCharts.modulesTitle')"
    :subtitle="$t('orgCharts.modulesSubtitle')"
    file-name="modules-chart"
    :loading="loading"
    :items="treeItems"
    @refresh="load"
  />
</template>

<script>
import { getContractors } from '../../../../api'
import OrgChartShell from './OrgChartShell.vue'

// System modules — same list used as البند الرئيسي in ExpensesList
const MODULES = [
  { key: 'transport', tone: 'transport', icon: 'transport', labelKey: 'navbar.transport', match: c => c.availableForTransports === true },
  { key: 'extracts', tone: 'extracts', icon: 'extracts', labelKey: 'navbar.extracts', match: c => c.availableForExtracts === true },
  { key: 'supplies', tone: 'supplies', icon: 'supplies', labelKey: 'navbar.supplies', match: c => c.availableForSupplies === true || c.availableForExports === true },
  { key: 'equipment', tone: 'equipment', icon: 'equipment', labelKey: 'dashboard.equipmentLog', match: c => c.availableForRentals === true || c.availableForEquipmentRental === true }
]

export default {
  name: 'ModulesOrgChart',
  components: { OrgChartShell },
  data() {
    return {
      loading: false,
      contractors: []
    }
  },
  computed: {
    treeItems() {
      const root = {
        id: 'root',
        parentId: null,
        tone: 'root',
        icon: 'root',
        title: this.$t('orgCharts.companyName'),
        subtitle: this.$t('orgCharts.modulesTitle'),
        badge: `${this.contractors.length} ${this.$t('orgCharts.contractorsCount')}`,
        details: [
          { label: this.$t('orgCharts.modulesCount'), value: String(MODULES.length) },
          { label: this.$t('orgCharts.contractorsCount'), value: String(this.contractors.length) }
        ]
      }

      const moduleNodes = MODULES.map(mod => {
        const count = this.contractors.filter(mod.match).length
        return {
          id: `module-${mod.key}`,
          parentId: 'root',
          tone: mod.tone,
          icon: mod.icon,
          title: this.$t(mod.labelKey),
          badge: `${count} ${this.$t('orgCharts.contractorsCount')}`,
          stats: [
            { label: this.$t('orgCharts.contractorsCount'), value: String(count) }
          ],
          details: [
            { label: this.$t('orgCharts.contractorsCount'), value: String(count) },
            { label: this.$t('orgCharts.shareOfCompany'), value: `${this.contractors.length ? Math.round((count / this.contractors.length) * 100) : 0}%` }
          ]
        }
      })

      return [root, ...moduleNodes]
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await getContractors({ page: 1, pageSize: 1000 })
        const payload = res.data
        if (Array.isArray(payload)) {
          this.contractors = payload
        } else if (payload && Array.isArray(payload.data)) {
          this.contractors = payload.data
        } else if (payload && Array.isArray(payload.items)) {
          this.contractors = payload.items
        } else {
          this.contractors = []
        }
      } catch (e) {
        console.error('Failed to load contractors for modules chart', e)
        this.contractors = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
