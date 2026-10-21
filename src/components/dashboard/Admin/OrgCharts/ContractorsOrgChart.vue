<template>
  <OrgChartShell
    :title="$t('orgCharts.contractorsTitle')"
    :subtitle="$t('orgCharts.contractorsSubtitle')"
    file-name="contractors-chart"
    :loading="loading"
    :items="treeItems"
    :summary="summary"
    :header-actions="headerActions"
    @refresh="load"
    @open-link="openContractor"
    @header-action="onHeaderAction"
  />
</template>

<script>
import { getContractors, getTreasuries } from '../../../../api'
import { formatCurrency } from '../../../../utils/formatting'
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
      contractors: [],
      treasuries: []
    }
  },
  computed: {
    locale() {
      return this.$i18n && this.$i18n.locale ? this.$i18n.locale : 'ar'
    },
    summary() {
      const totalBalance = this.treasuries.reduce((sum, t) => {
        const n = typeof t.balance === 'string' ? parseFloat(t.balance) : Number(t.balance || 0)
        return sum + (isNaN(n) ? 0 : n)
      }, 0)
      const activeContracts = this.contractors.filter(
        c => c.availableForSupplies || c.availableForTransports || c.availableForExtracts ||
             c.availableForRentals || c.availableForEquipmentRental || c.availableForExports
      ).length
      return [
        { label: this.$t('orgCharts.kpiTreasuryBalance'), value: formatCurrency(totalBalance, this.locale) },
        { label: this.$t('orgCharts.kpiContractors'), value: String(this.contractors.length) },
        { label: this.$t('orgCharts.kpiActiveContractors'), value: String(activeContracts) },
        { label: this.$t('orgCharts.modulesCount'), value: String(MODULES.length) }
      ]
    },
    headerActions() {
      return [
        { tone: 'primary', label: this.$t('orgCharts.activityReport'), name: 'contractors-activity-report' }
      ]
    },
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
            linkLabel: this.$t('orgCharts.openContractorPage'),
            actions: this.contractorActions(contractor)
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
    contractorActions(c) {
      const actions = []
      const statementRoute = this.statementRouteFor(c)
      if (statementRoute) {
        actions.push({
          tone: 'primary',
          label: this.$t('orgCharts.openStatement'),
          link: { name: statementRoute, params: { id: c.id } }
        })
      }
      actions.push({
        tone: 'secondary',
        label: this.$t('orgCharts.openContractorPage'),
        link: { name: 'contractor-detail', params: { id: c.id } }
      })
      return actions
    },
    statementRouteFor(c) {
      if (c.availableForTransports === true) return 'contractor-transport-statement'
      if (c.availableForRentals === true || c.availableForEquipmentRental === true) return 'equipment-contractor-statement'
      if (c.availableForExtracts === true) return 'contractor-extract-statement'
      if (c.availableForSupplies === true || c.availableForExports === true) return 'contractor-supply-statement'
      return 'contractor-supply-statement'
    },
    openContractor(link) {
      if (link && link.name) {
        const id = link.params && link.params.id
        if (id && String(link.name).includes('statement')) {
          localStorage.setItem('contractor-statement-id', String(id))
        }
        this.$router.push(link)
      }
    },
    onHeaderAction(action) {
      if (action && action.name) this.$router.push({ name: action.name })
    },
    async load() {
      this.loading = true
      try {
        const [res, treasuryRes] = await Promise.all([
          getContractors({ page: 1, pageSize: 1000 }),
          getTreasuries().catch(() => null)
        ])
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

        const tPayload = treasuryRes && treasuryRes.data
        if (Array.isArray(tPayload)) this.treasuries = tPayload
        else if (tPayload && Array.isArray(tPayload.data)) this.treasuries = tPayload.data
        else this.treasuries = []
      } catch (e) {
        console.error('Failed to load contractors for chart', e)
        this.contractors = []
        this.treasuries = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
