<template>
  <OrgChartShell
    :title="title"
    :subtitle="subtitle"
    :file-name="fileName"
    :loading="loading"
    :items="treeItems"
    @refresh="load"
    @open-link="openLink"
  />
</template>

<script>
import OrgChartShell from './OrgChartShell.vue'

/**
 * Generic organization chart built from a flat list of records.
 *
 * Groups records by one or more module keys (each record may belong to
 * several groups), then renders each record as a leaf node under its group.
 * Records that match no group are collected under a single "غير مصنف" node.
 *
 * Props:
 *   title / subtitle / fileName : shell labels + export file name
 *   fetchData                   : () => Promise<Array>   (raw records)
 *   groups                      : [{ key, tone, icon, labelKey, match }]
 *   ungroupedLabelKey           : label for the "no group" bucket
 *   itemTitle / itemSubtitle    : (record) => string
 *   itemDetails                 : (record) => [{ label, value }]
 *   itemLink                    : (record) => route location | null
 *   itemLinkLabelKey            : label for the leaf "open" button
 */
export default {
  name: 'DataOrgChart',
  components: { OrgChartShell },
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    fileName: { type: String, default: 'org-chart' },
    fetchData: { type: Function, required: true },
    groups: { type: Array, required: true },
    ungroupedLabelKey: { type: String, default: 'orgCharts.unclassified' },
    itemTitle: { type: Function, required: true },
    itemSubtitle: { type: Function, default: () => '' },
    itemDetails: { type: Function, default: () => [] },
    itemLink: { type: Function, default: () => null },
    itemLinkLabelKey: { type: String, default: 'orgCharts.openDetails' },
    itemActions: { type: Function, default: () => [] },
  },
  data() {
    return {
      loading: false,
      records: [],
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
        subtitle: this.title,
        badge: `${this.records.length} ${this.$t('orgCharts.itemsCount')}`,
        details: [
          { label: this.$t('orgCharts.modulesCount'), value: String(this.groups.length) },
          { label: this.$t('orgCharts.itemsCount'), value: String(this.records.length) },
        ],
      }

      const items = [root]
      const matchedIds = new Set()

      for (const group of this.groups) {
        const inGroup = this.records.filter(group.match)
        inGroup.forEach((record) => matchedIds.add(record.id))

        items.push({
          id: `group-${group.key}`,
          parentId: 'root',
          tone: group.tone,
          icon: group.icon,
          title: this.$t(group.labelKey),
          badge: `${inGroup.length} ${this.$t('orgCharts.itemsCount')}`,
          details: [
            { label: this.$t('orgCharts.itemsCount'), value: String(inGroup.length) },
            {
              label: this.$t('orgCharts.shareOfCompany'),
              value: `${this.records.length ? Math.round((inGroup.length / this.records.length) * 100) : 0}%`,
            },
          ],
        })

        for (const record of inGroup) {
          items.push(this.leafNode(record, `group-${group.key}`, this.$t(group.labelKey)))
        }
      }

      const ungrouped = this.records.filter((record) => !matchedIds.has(record.id))
      if (ungrouped.length) {
        items.push({
          id: 'group-ungrouped',
          parentId: 'root',
          tone: 'other',
          icon: 'contractor',
          title: this.$t(this.ungroupedLabelKey),
          badge: `${ungrouped.length} ${this.$t('orgCharts.itemsCount')}`,
          details: [{ label: this.$t('orgCharts.itemsCount'), value: String(ungrouped.length) }],
        })
        for (const record of ungrouped) {
          items.push(this.leafNode(record, 'group-ungrouped', this.$t(this.ungroupedLabelKey)))
        }
      }

      return items
    },
  },
  mounted() {
    this.load()
  },
  methods: {
    leafNode(record, parentId, groupLabel) {
      const subtitle = this.itemSubtitle(record)
      return {
        id: `leaf-${parentId}-${record.id}`,
        parentId,
        tone: 'contractor',
        icon: 'contractor',
        title: this.itemTitle(record),
        subtitle,
        searchableText: `${this.itemTitle(record)} ${subtitle} ${groupLabel}`,
        details: this.itemDetails(record),
        link: this.itemLink(record),
        linkLabel: this.$t(this.itemLinkLabelKey),
        actions: this.itemActions(record) || [],
      }
    },
    openLink(link) {
      if (link && link.name) this.$router.push(link)
    },
    async load() {
      this.loading = true
      try {
        const rows = await this.fetchData()
        this.records = Array.isArray(rows) ? rows : []
      } catch (e) {
        console.error(`[DataOrgChart] failed to load ${this.fileName}`, e)
        this.records = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
