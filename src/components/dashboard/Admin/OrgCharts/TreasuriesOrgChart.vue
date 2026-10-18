<template>
  <OrgChartShell
    :title="$t('orgCharts.treasuriesTitle')"
    :subtitle="$t('orgCharts.treasuriesSubtitle')"
    file-name="treasuries-chart"
    :loading="loading"
    :items="treeItems"
    @refresh="load"
  />
</template>

<script>
import { getTreasuries, getTreasuryTransactions } from '../../../../api'
import { formatCurrency } from '../../../../utils/formatting'
import OrgChartShell from './OrgChartShell.vue'

export default {
  name: 'TreasuriesOrgChart',
  components: { OrgChartShell },
  data() {
    return {
      loading: false,
      treasuries: [],
      // custodyId -> { id, name } of the MAIN treasury that funded it (best-effort)
      custodySources: {}
    }
  },
  computed: {
    locale() {
      return this.$i18n && this.$i18n.locale ? this.$i18n.locale : 'ar'
    },
    treeItems() {
      const mainTreasuries = this.treasuries.filter(t => t.type === 'MAIN')
      const custodyTreasuries = this.treasuries.filter(t => t.type === 'CUSTODY')
      const archivedCount = this.treasuries.filter(t => t.deletedAt).length

      const root = {
        id: 'root',
        parentId: null,
        tone: 'root',
        icon: 'root',
        title: this.$t('orgCharts.treasuriesTitle'),
        subtitle: `${this.treasuries.length} ${this.$t('treasury.items')}`,
        badge: `${this.treasuries.length} ${this.$t('treasury.items')}`,
        details: [
          { label: this.$t('treasury.items'), value: String(this.treasuries.length) },
          { label: this.$t('orgCharts.mainTreasuries'), value: String(mainTreasuries.length) },
          { label: this.$t('orgCharts.custodyTreasuries'), value: String(custodyTreasuries.length) },
          { label: this.$t('treasury.archived'), value: String(archivedCount) }
        ]
      }

      const items = [root]

      // MAIN treasuries as direct children of root
      for (const t of mainTreasuries) {
        items.push(this.treasuryItem(t, 'root', 'treasury'))
      }

      // CUSTODY treasuries under their funding MAIN treasury (or root if unknown)
      for (const t of custodyTreasuries) {
        const source = this.custodySources[t.id]
        const parentId = source && mainTreasuries.some(m => m.id === source.id) ? `treasury-${source.id}` : 'root'
        const item = this.treasuryItem(t, parentId, 'custody')
        if (!source) {
          item.badge = `${this.$t('orgCharts.unlinkedCustody')} · ${this.formatBalance(t.balance)}`
        }
        items.push(item)
      }

      return items
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    formatBalance(value) {
      const num = typeof value === 'string' ? parseFloat(value) : Number(value || 0)
      return formatCurrency(isNaN(num) ? 0 : num, this.locale)
    },
    treasuryItem(t, parentId, tone) {
      const typeLabel = t.type === 'MAIN' ? this.$t('treasury.typeMain') : this.$t('treasury.typeCustody')
      const statusLabel = t.deletedAt ? this.$t('treasury.archived') : this.$t('treasury.active')
      const details = [
        { label: this.$t('treasury.name'), value: t.name || '' },
        { label: this.$t('treasury.type'), value: typeLabel },
        { label: this.$t('treasury.balance'), value: this.formatBalance(t.balance) },
        { label: this.$t('treasury.status'), value: statusLabel }
      ]
      if (t.nameEn) details.push({ label: this.$t('treasury.nameEn') || 'Name (EN)', value: t.nameEn })

      if (tone === 'custody') {
        const source = this.custodySources[t.id]
        details.push({
          label: this.$t('orgCharts.fundedFrom'),
          value: source ? source.name : this.$t('orgCharts.unlinkedCustody')
        })
      }

      return {
        id: `treasury-${t.id}`,
        parentId,
        tone,
        icon: tone,
        title: t.name || '',
        subtitle: `${typeLabel} · ${this.formatBalance(t.balance)}`,
        badge: t.deletedAt ? `${statusLabel} · ${this.formatBalance(t.balance)}` : this.formatBalance(t.balance),
        searchableText: `${t.name || ''} ${t.nameEn || ''} ${typeLabel} ${statusLabel}`,
        stats: [
          { label: this.$t('treasury.balance'), value: this.formatBalance(t.balance) }
        ],
        details
      }
    },
    // Best-effort: find which MAIN treasury funded each custody via its transfer history
    async loadCustodySources(custodyTreasuries) {
      const sources = {}
      await Promise.all(custodyTreasuries.map(async t => {
        try {
          const res = await getTreasuryTransactions(t.id, { page: 1, pageSize: 50, type: 'DEPOSIT' })
          const items = (res.data && res.data.items) || []
          // A custody deposit comes from a MAIN treasury via a TRANSFER leg
          const transfer = items.find(tx => tx.refType === 'TRANSFER' && tx.transfer && tx.transfer.fromTreasury && tx.transfer.fromTreasury.id !== t.id)
          if (transfer) {
            sources[t.id] = { id: transfer.transfer.fromTreasury.id, name: transfer.transfer.fromTreasury.name }
          }
        } catch (e) {
          console.error(`Failed to load funding source for custody ${t.id}`, e)
        }
      }))
      return sources
    },
    async load() {
      this.loading = true
      try {
        const res = await getTreasuries({ includeArchived: true })
        const list = Array.isArray(res.data) ? res.data : (res.data && res.data.data) || []
        this.treasuries = list
        this.custodySources = await this.loadCustodySources(list.filter(t => t.type === 'CUSTODY'))
      } catch (e) {
        console.error('Failed to load treasuries for chart', e)
        this.treasuries = []
        this.custodySources = {}
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
