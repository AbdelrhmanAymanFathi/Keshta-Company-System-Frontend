<template>
  <OrgChartShell
    :title="$t('orgCharts.contractorsTitle')"
    :subtitle="$t('orgCharts.contractorsSubtitle')"
    file-name="contractors-chart"
    :loading="loading"
    :items="treeItems"
    @refresh="load"
    @open-link="openContractor"
  />
</template>

<script>
import { getContractors } from '../../../../api'
import OrgChartShell from './OrgChartShell.vue'

const MODULES = [
  { key: 'transport', tone: 'transport', icon: 'transport', labelKey: 'navbar.transport', match: c => c.availableForTransports === true },
  { key: 'extracts', tone: 'extracts', icon: 'extracts', labelKey: 'navbar.extracts', match: c => c.availableForExtracts === true },
  { key: 'supplies', tone: 'supplies', icon: 'supplies', labelKey: 'navbar.supplies', match: c => c.availableForSupplies === true || c.availableForExports === true },
  { key: 'equipment', tone: 'equipment', icon: 'equipment', labelKey: 'dashboard.equipmentLog', match: c => c.availableForRentals === true || c.availableForEquipmentRental === true }
]

export default {
  name: 'ContractorsOrgChart',
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
        subtitle: this.$t('orgCharts.contractorsTitle'),
        badge: `${this.contractors.length} ${this.$t('orgCharts.contractorsCount')}`,
        details: [
          { label: this.$t('orgCharts.contractorsCount'), value: String(this.contractors.length) }
        ]
      }

      const items = [root]

      for (const mod of MODULES) {
        const inModule = this.contractors.filter(mod.match)
        const moduleLabel = this.$t(mod.labelKey)

        items.push({
          id: `module-${mod.key}`,
          parentId: 'root',
          tone: mod.tone,
          icon: mod.icon,
          title: moduleLabel,
          badge: `${inModule.length} ${this.$t('orgCharts.contractorsCount')}`,
          details: [
            { label: this.$t('orgCharts.contractorsCount'), value: String(inModule.length) }
          ]
        })

        for (const c of inModule) {
          const contractor = c
          items.push({
            id: `contractor-${mod.key}-${contractor.id}`,
            parentId: `module-${mod.key}`,
            tone: 'contractor',
            icon: 'contractor',
            title: contractor.name || '',
            subtitle: contractor.phone || contractor.bankName || '',
            searchableText: `${contractor.name || ''} ${contractor.phone || ''} ${contractor.bankName || ''} ${contractor.accountNumber || ''} ${moduleLabel}`,
            details: this.contractorFields(contractor),
            link: { name: 'contractor-detail', params: { id: contractor.id } },
            linkLabel: this.$t('orgCharts.openContractorPage')
          })
        }
      }

      return items
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    contractorFields(c) {
      const fields = []
      if (c.phone) fields.push({ label: this.$t('contractors.phone'), value: c.phone })
      if (c.bankName) fields.push({ label: this.$t('contractors.bankName'), value: c.bankName })
      if (c.accountNumber) fields.push({ label: this.$t('contractors.accountNumber'), value: c.accountNumber })
      if (c.notes) fields.push({ label: this.$t('orgCharts.notes'), value: c.notes })
      const flags = MODULES.filter(m => m.match(c)).map(m => this.$t(m.labelKey))
      if (flags.length) fields.push({ label: this.$t('orgCharts.availableIn'), value: flags.join('، ') })
      return fields
    },
    openContractor(link) {
      if (link && link.name) this.$router.push(link)
    },
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
        console.error('Failed to load contractors for chart', e)
        this.contractors = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
