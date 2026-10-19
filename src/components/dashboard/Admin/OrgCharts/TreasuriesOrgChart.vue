<template>
  <OrgChartShell
    :title="$t('orgCharts.treasuriesTitle')"
    :subtitle="subtitle"
    file-name="treasuries-chart"
    :loading="loading"
    :items="treeItems"
    @refresh="load"
    @node-select="onNodeSelect"
  />
</template>

<script>
import { getTreasuries, getTreasuryTransactions, getTreasurySummary } from '../../../../api'
import { formatCurrency } from '../../../../utils/formatting'
import { formatDateDMY } from '../../../../utils/dateUtils'
import OrgChartShell from './OrgChartShell.vue'

const LEDGER_LIMIT = 60

const CATEGORY_LABEL_KEYS = {
  TOPUP: 'categoryDirectDeposit',
  TRANSFER: 'categoryTransfer',
  EXPENSE: 'categoryExpense',
  PAYMENT: 'categoryPayment'
}

export default {
  name: 'TreasuriesOrgChart',
  components: { OrgChartShell },
  data() {
    return {
      loading: false,
      treasuries: [],
      // custodyId -> { id, name } of the MAIN treasury that funded it (best-effort)
      custodySources: {},
      // parentNodeId -> [child items] revealed by drilling down
      childItems: {},
      // parentNodeId -> true once its children have been loaded
      loadedParents: {},
      // parentNodeId -> true while its children are being fetched
      loadingParents: {},
      // treasuryId -> { summary, transactions }
      txCache: {}
    }
  },
  computed: {
    locale() {
      return this.$i18n && this.$i18n.locale ? this.$i18n.locale : 'ar'
    },
    subtitle() {
      return `${this.$t('orgCharts.treasuriesSubtitle')} · ${this.$t('orgCharts.drillHint')}`
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

      // Append every drilled-down level that has already been loaded
      for (const children of Object.values(this.childItems)) {
        for (const child of children) items.push(child)
      }

      return items.map(item =>
        this.loadingParents[item.id] ? { ...item, loadingChildren: true } : item
      )
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
    formatDate(value) {
      return value ? formatDateDMY(value) : ''
    },
    findTreasury(id) {
      return this.treasuries.find(t => t.id === id) || null
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
        details,
        // drill-down: clicking loads the accounting breakdown for this treasury
        nodeType: 'treasury',
        treasuryId: t.id,
        lazyChildren: true
      }
    },

    // --- Drill-down orchestration -------------------------------------------------

    async onNodeSelect(item) {
      if (!item || !item.nodeType) return
      if (this.loadedParents[item.id] || this.loadingParents[item.id]) return

      switch (item.nodeType) {
        case 'treasury':
          return this.loadTreasuryDetails(item)
        case 'accounts':
          return this.loadAccounts(item)
        case 'entities':
          return this.loadEntities(item)
        case 'ledger':
          return this.loadLedger(item)
        case 'category':
          return this.loadCategoryTransactions(item)
        case 'entity':
          return this.loadEntityTransactions(item)
        default:
          return undefined
      }
    },
    markLoading(parentId, value) {
      this.loadingParents[parentId] = value
    },
    setLoaded(parentId, children) {
      this.childItems[parentId] = children.length ? children : [this.placeholderItem(parentId)]
      this.loadedParents[parentId] = true
    },
    placeholderItem(parentId) {
      return {
        id: `tempty-${parentId}`,
        parentId,
        tone: 'root',
        icon: 'root',
        title: this.$t('treasury.noTransactions'),
        details: []
      }
    },
    async ensureTreasuryData(treasuryId) {
      if (this.txCache[treasuryId]) return this.txCache[treasuryId]
      const [summaryRes, txRes] = await Promise.all([
        getTreasurySummary(treasuryId).catch(() => ({ data: null })),
        getTreasuryTransactions(treasuryId, { page: 1, pageSize: 500 })
      ])
      const data = {
        summary: (summaryRes && summaryRes.data) || null,
        transactions: (txRes.data && txRes.data.items) || []
      }
      this.txCache[treasuryId] = data
      return data
    },
    computeTotals(summary, transactions) {
      const txIn = transactions.filter(tx => Number(tx.amount) >= 0).reduce((s, tx) => s + Number(tx.amount || 0), 0)
      const txOut = transactions.filter(tx => Number(tx.amount) < 0).reduce((s, tx) => s + Number(tx.amount || 0), 0)
      return {
        totalIn: summary && summary.totalIn != null ? Number(summary.totalIn) : txIn,
        totalOut: summary && summary.totalOut != null ? Number(summary.totalOut) : Math.abs(txOut),
        balance: summary && summary.balance != null ? Number(summary.balance) : null,
        count: transactions.length
      }
    },
    categoryLabel(refType) {
      const key = CATEGORY_LABEL_KEYS[refType] || 'categoryOther'
      return this.$t(`orgCharts.${key}`)
    },
    categoryGroups(transactions) {
      const map = new Map()
      for (const tx of transactions) {
        const key = `${tx.refType || 'NONE'}|${tx.type || ''}`
        if (!map.has(key)) {
          map.set(key, {
            key,
            refType: tx.refType,
            type: tx.type,
            label: this.categoryLabel(tx.refType),
            items: [],
            total: 0,
            totalIn: 0,
            totalOut: 0
          })
        }
        const g = map.get(key)
        const amount = Number(tx.amount || 0)
        g.items.push(tx)
        g.total += amount
        if (amount >= 0) g.totalIn += amount
        else g.totalOut += amount
      }
      return [...map.values()].sort((a, b) => b.items.length - a.items.length)
    },
    entityOf(tx) {
      if (tx.fromTreasuryName) {
        return { key: `treasury:${tx.fromTreasuryName}`, label: tx.fromTreasuryName, kind: 'treasury' }
      }
      if (tx.createdBy && tx.createdBy.name) {
        return { key: `user:${tx.createdBy.name}`, label: tx.createdBy.name, kind: 'user' }
      }
      return { key: 'external', label: this.$t('orgCharts.externalEntity'), kind: 'external' }
    },
    entityGroups(transactions) {
      const map = new Map()
      for (const tx of transactions) {
        const entity = this.entityOf(tx)
        if (!map.has(entity.key)) {
          map.set(entity.key, { key: entity.key, label: entity.label, kind: entity.kind, items: [], total: 0 })
        }
        const g = map.get(entity.key)
        g.items.push(tx)
        g.total += Number(tx.amount || 0)
      }
      return [...map.values()].sort((a, b) => b.items.length - a.items.length)
    },

    // --- Node builders ------------------------------------------------------------

    summaryNode(treasuryId, parentId, totals) {
      const treasury = this.findTreasury(treasuryId)
      const balance = totals.balance != null ? totals.balance : Number((treasury && treasury.balance) || 0)
      return {
        id: `tsum-${treasuryId}`,
        parentId,
        tone: 'treasury',
        icon: 'treasury',
        title: this.$t('orgCharts.financialSummary'),
        subtitle: `${this.formatBalance(balance)} · ${totals.count} ${this.$t('orgCharts.transactions')}`,
        badge: this.formatBalance(balance),
        stats: [
          { label: this.$t('orgCharts.totalIn'), value: this.formatBalance(totals.totalIn) },
          { label: this.$t('orgCharts.totalOut'), value: this.formatBalance(totals.totalOut) }
        ],
        details: [
          { label: this.$t('orgCharts.totalIn'), value: this.formatBalance(totals.totalIn) },
          { label: this.$t('orgCharts.totalOut'), value: this.formatBalance(totals.totalOut) },
          { label: this.$t('treasury.balance'), value: this.formatBalance(balance) },
          { label: this.$t('orgCharts.transactionsCount'), value: String(totals.count) }
        ]
      }
    },
    branchNode(treasuryId, parentId, kind, title, count, amount) {
      const details = [
        { label: this.$t('orgCharts.transactionsCount'), value: String(count) }
      ]
      if (amount != null) details.push({ label: this.$t('treasury.amount'), value: this.formatBalance(amount) })
      return {
        id: `t${kind}-${treasuryId}`,
        parentId,
        tone: 'treasury',
        icon: 'treasury',
        title,
        subtitle: `${count} ${this.$t('orgCharts.transactions')}`,
        badge: amount != null ? this.formatBalance(amount) : String(count),
        details,
        nodeType: kind,
        treasuryId,
        lazyChildren: true
      }
    },
    categoryNode(group, parentId, treasuryId, index) {
      return {
        id: `tcat-${treasuryId}-${index}`,
        parentId,
        tone: group.total >= 0 ? 'treasury' : 'custody',
        icon: 'treasury',
        title: group.label,
        subtitle: `${group.items.length} ${this.$t('orgCharts.transactions')}`,
        badge: this.formatBalance(group.total),
        details: [
          { label: this.$t('orgCharts.accountsTitle'), value: group.label },
          { label: this.$t('orgCharts.transactionsCount'), value: String(group.items.length) },
          { label: this.$t('orgCharts.totalIn'), value: this.formatBalance(group.totalIn) },
          { label: this.$t('orgCharts.totalOut'), value: this.formatBalance(group.totalOut) },
          { label: this.$t('treasury.amount'), value: this.formatBalance(group.total) }
        ],
        searchableText: `${group.label} ${group.refType || ''}`,
        nodeType: 'category',
        treasuryId,
        categoryKey: group.key,
        lazyChildren: true
      }
    },
    entityNode(group, parentId, treasuryId, index) {
      const kindLabel = group.kind === 'treasury'
        ? this.$t('orgCharts.mainTreasuries')
        : (group.kind === 'user' ? this.$t('treasury.createdBy') : this.$t('orgCharts.externalEntity'))
      return {
        id: `tent-${treasuryId}-${index}`,
        parentId,
        tone: group.kind === 'treasury' ? 'treasury' : 'custody',
        icon: group.kind === 'treasury' ? 'treasury' : 'custody',
        title: group.label,
        subtitle: `${group.items.length} ${this.$t('orgCharts.transactions')}`,
        badge: this.formatBalance(group.total),
        details: [
          { label: this.$t('orgCharts.entitiesTitle'), value: group.label },
          { label: this.$t('treasury.type'), value: kindLabel },
          { label: this.$t('orgCharts.transactionsCount'), value: String(group.items.length) },
          { label: this.$t('treasury.amount'), value: this.formatBalance(group.total) }
        ],
        searchableText: group.label,
        nodeType: 'entity',
        treasuryId,
        entityKey: group.key,
        lazyChildren: true
      }
    },
    txNode(tx, parentId, treasuryId) {
      const amount = Number(tx.amount || 0)
      const isIn = amount >= 0
      return {
        id: `ttx-${treasuryId}-${parentId}-${tx.id}`,
        parentId,
        tone: isIn ? 'treasury' : 'custody',
        icon: isIn ? 'treasury' : 'custody',
        title: tx.source || tx.refType || this.$t('treasury.type'),
        subtitle: `${this.formatBalance(tx.amount)} · ${this.formatDate(tx.date)}`,
        badge: this.formatBalance(tx.amount),
        details: [
          { label: this.$t('treasury.date'), value: this.formatDate(tx.date) },
          { label: this.$t('treasury.type'), value: tx.type || '' },
          { label: this.$t('treasury.source'), value: tx.source || tx.refType || '' },
          { label: this.$t('treasury.amount'), value: this.formatBalance(tx.amount) },
          { label: this.$t('treasury.description'), value: tx.description || '' },
          { label: this.$t('treasury.createdBy'), value: (tx.createdBy && tx.createdBy.name) || '' }
        ],
        searchableText: [tx.source, tx.refType, tx.type, tx.description].filter(Boolean).join(' ')
      }
    },

    // --- Level loaders ------------------------------------------------------------

    async loadTreasuryDetails(item) {
      const treasuryId = item.treasuryId
      this.markLoading(item.id, true)
      try {
        const { summary, transactions } = await this.ensureTreasuryData(treasuryId)
        const totals = this.computeTotals(summary, transactions)
        const categories = this.categoryGroups(transactions)
        const entities = this.entityGroups(transactions)
        const categoriesTotal = categories.reduce((s, g) => s + g.total, 0)

        this.setLoaded(item.id, [
          this.summaryNode(treasuryId, item.id, totals),
          this.branchNode(treasuryId, item.id, 'accounts', this.$t('orgCharts.accountsTitle'), categories.length, categoriesTotal),
          this.branchNode(treasuryId, item.id, 'entities', this.$t('orgCharts.entitiesTitle'), entities.length, null),
          this.branchNode(treasuryId, item.id, 'ledger', this.$t('orgCharts.ledgerTitle'), totals.count, null)
        ])
      } catch (e) {
        console.error('Failed to load treasury drill-down', e)
        this.setLoaded(item.id, [])
      } finally {
        this.markLoading(item.id, false)
      }
    },
    async loadAccounts(item) {
      this.markLoading(item.id, true)
      try {
        const { transactions } = await this.ensureTreasuryData(item.treasuryId)
        const groups = this.categoryGroups(transactions)
        this.setLoaded(item.id, groups.map((g, idx) => this.categoryNode(g, item.id, item.treasuryId, idx)))
      } catch (e) {
        console.error('Failed to load treasury categories', e)
        this.setLoaded(item.id, [])
      } finally {
        this.markLoading(item.id, false)
      }
    },
    async loadEntities(item) {
      this.markLoading(item.id, true)
      try {
        const { transactions } = await this.ensureTreasuryData(item.treasuryId)
        const groups = this.entityGroups(transactions)
        this.setLoaded(item.id, groups.map((g, idx) => this.entityNode(g, item.id, item.treasuryId, idx)))
      } catch (e) {
        console.error('Failed to load treasury entities', e)
        this.setLoaded(item.id, [])
      } finally {
        this.markLoading(item.id, false)
      }
    },
    async loadLedger(item) {
      this.markLoading(item.id, true)
      try {
        const { transactions } = await this.ensureTreasuryData(item.treasuryId)
        const nodes = transactions
          .slice(0, LEDGER_LIMIT)
          .map(tx => this.txNode(tx, item.id, item.treasuryId))
        this.setLoaded(item.id, nodes)
      } catch (e) {
        console.error('Failed to load treasury ledger', e)
        this.setLoaded(item.id, [])
      } finally {
        this.markLoading(item.id, false)
      }
    },
    async loadCategoryTransactions(item) {
      this.markLoading(item.id, true)
      try {
        const { transactions } = await this.ensureTreasuryData(item.treasuryId)
        const group = this.categoryGroups(transactions).find(g => g.key === item.categoryKey)
        const list = (group ? group.items : []).slice(0, LEDGER_LIMIT)
        this.setLoaded(item.id, list.map(tx => this.txNode(tx, item.id, item.treasuryId)))
      } catch (e) {
        console.error('Failed to load category transactions', e)
        this.setLoaded(item.id, [])
      } finally {
        this.markLoading(item.id, false)
      }
    },
    async loadEntityTransactions(item) {
      this.markLoading(item.id, true)
      try {
        const { transactions } = await this.ensureTreasuryData(item.treasuryId)
        const group = this.entityGroups(transactions).find(g => g.key === item.entityKey)
        const list = (group ? group.items : []).slice(0, LEDGER_LIMIT)
        this.setLoaded(item.id, list.map(tx => this.txNode(tx, item.id, item.treasuryId)))
      } catch (e) {
        console.error('Failed to load entity transactions', e)
        this.setLoaded(item.id, [])
      } finally {
        this.markLoading(item.id, false)
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
    resetDrillDown() {
      this.childItems = {}
      this.loadedParents = {}
      this.loadingParents = {}
      this.txCache = {}
    },
    async load() {
      this.loading = true
      this.resetDrillDown()
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
