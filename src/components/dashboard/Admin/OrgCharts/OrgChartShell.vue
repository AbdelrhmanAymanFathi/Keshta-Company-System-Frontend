<template>
  <div class="space-y-4" :class="{ 'direction-rtl': isRTL }">
    <PageHeader :title="title" :subtitle="subtitle">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-1.5 text-xs sm:text-sm font-semibold theme-text-secondary bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          :disabled="exporting"
          @click="downloadImage"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ $t('orgCharts.downloadImage') }}
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs sm:text-sm font-semibold theme-text-secondary bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          :disabled="exporting"
          @click="downloadPdf"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('orgCharts.exportPdf') }}
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5"
          :disabled="loading"
          @click="$emit('refresh')"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          {{ $t('orgCharts.refresh') }}
        </button>
      </div>
    </PageHeader>

    <!-- Search & controls bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-4 items-center">
      <div class="relative flex-1 w-full">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('orgCharts.searchPlaceholder')"
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl theme-input-focus text-sm transition-all"
          :class="isRTL ? 'text-right pr-10 pl-4' : 'text-left pl-10 pr-4'"
        />
        <svg class="w-5 h-5 text-slate-400 absolute top-3" :class="isRTL ? 'right-3' : 'left-3'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-semibold theme-text-secondary bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
          @click="expandAll"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          {{ $t('orgCharts.expandAll') }}
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-semibold theme-text-secondary bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
          @click="collapseAll"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
          </svg>
          {{ $t('orgCharts.collapseAll') }}
        </button>
      </div>
    </div>

    <!-- Canvas + side panel -->
    <div class="flex flex-col lg:flex-row gap-4 items-stretch">
      <div
        ref="flowWrapper"
        class="relative flex-1 bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden"
        style="min-height: 520px"
      >
        <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>

        <div
          v-if="!loading && !flowNodes.length"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-400 pointer-events-none"
        >
          <svg class="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="text-sm font-semibold">{{ searchQuery ? $t('orgCharts.noResults') : $t('orgCharts.empty') }}</p>
        </div>

        <VueFlow
          v-model:nodes="flowNodes"
          v-model:edges="flowEdges"
          :min-zoom="0.2"
          :max-zoom="1.5"
          :nodes-draggable="true"
          :nodes-connectable="false"
          :edges-updatable="false"
          :fit-view-on-init="true"
          :default-edge-options="{ type: 'smoothstep' }"
          @node-click="onNodeClick"
        >
          <template #node-statCard="nodeProps">
            <StatCardNode :id="nodeProps.id" :data="nodeProps.data" />
          </template>

          <Background :gap="18" pattern-color="#cbd5e1" />
          <Controls :show-interactive="false" position="bottom-right" />
          <MiniMap pannable zoomable position="bottom-left" class="!bg-slate-100" />
        </VueFlow>
      </div>

      <!-- Details side panel -->
      <aside
        v-if="selectedDetails"
        class="w-full lg:w-[360px] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 space-y-4 self-start"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-lg font-bold text-slate-900 break-words">{{ selectedDetails.title }}</h3>
            <p v-if="selectedDetails.subtitle" class="text-sm theme-text-secondary mt-0.5">
              {{ selectedDetails.subtitle }}
            </p>
          </div>
          <button
            type="button"
            class="w-8 h-8 shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            :title="$t('orgCharts.closePanel')"
            @click="selectedId = null"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="selectedDetails.badge" class="flex flex-wrap gap-2">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            {{ selectedDetails.badge }}
          </span>
        </div>

        <div v-if="selectedDetails.fields && selectedDetails.fields.length" class="space-y-2">
          <div
            v-for="(field, i) in selectedDetails.fields"
            :key="i"
            class="flex items-center justify-between gap-3 text-sm bg-slate-50 rounded-xl px-3 py-2"
          >
            <span class="theme-text-secondary shrink-0">{{ field.label }}</span>
            <span class="font-semibold text-slate-800 text-left break-all">{{ field.value }}</span>
          </div>
        </div>

        <div v-if="selectedDetails.link" class="pt-1">
          <button
            type="button"
            class="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-2"
            @click="$emit('open-link', selectedDetails.link)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {{ selectedDetails.linkLabel || $t('orgCharts.openDetails') }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import dagre from 'dagre'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import PageHeader from '../../../shared/PageHeader.vue'
import StatCardNode from './StatCardNode.vue'
import { downloadBlobData } from '../../../../utils/downloadFile'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const NODE_WIDTH = 240
const NODE_HEIGHT = 130

export default {
  name: 'OrgChartShell',
  components: { VueFlow, Background, Controls, MiniMap, PageHeader, StatCardNode },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    fileName: { type: String, default: 'org-chart' },
    loading: { type: Boolean, default: false },
    // items: flat tree list -> [{ id, parentId|null, tone, icon, title, subtitle, badge, stats: [{label, value}], details: [{label, value}], link, linkLabel, searchableText }]
    items: { type: Array, default: () => [] }
  },
  emits: ['refresh', 'open-link'],
  setup() {
    const { fitView } = useVueFlow()
    return { fitViewFlow: fitView }
  },
  data() {
    return {
      searchQuery: '',
      collapsedIds: [],
      selectedId: null,
      flowNodes: [],
      flowEdges: [],
      exporting: false
    }
  },
  computed: {
    isRTL() {
      return this.$i18n && this.$i18n.locale === 'ar'
    },
    matchedIds() {
      const q = this.searchQuery.trim().toLowerCase()
      if (!q) return null
      const ids = new Set()
      for (const item of this.items) {
        const haystack = `${item.title || ''} ${item.subtitle || ''} ${item.searchableText || ''}`.toLowerCase()
        if (haystack.includes(q)) ids.add(item.id)
      }
      return ids
    },
    selectedDetails() {
      if (!this.selectedId) return null
      const item = this.items.find(i => i.id === this.selectedId)
      if (!item) return null
      return {
        title: item.title,
        subtitle: item.subtitle,
        badge: item.badge,
        fields: item.details || [],
        link: item.link,
        linkLabel: item.linkLabel
      }
    },
    childrenMap() {
      const map = new Map()
      for (const item of this.items) {
        if (!item.parentId) continue
        if (!map.has(item.parentId)) map.set(item.parentId, [])
        map.get(item.parentId).push(item.id)
      }
      return map
    },
    itemById() {
      const map = new Map()
      for (const item of this.items) map.set(item.id, item)
      return map
    }
  },
  watch: {
    items: {
      handler() {
        this.collapsedIds = []
        this.selectedId = null
        this.rebuildGraph()
        this.$nextTick(() => this.fitViewFlow({ padding: 0.15, duration: 200 }))
      },
      deep: true
    },
    searchQuery() {
      this.rebuildGraph()
    },
    collapsedIds() {
      this.rebuildGraph()
    }
  },
  methods: {
    isHiddenByCollapse(itemId) {
      let current = this.itemById.get(itemId)
      while (current && current.parentId) {
        if (this.collapsedIds.includes(current.parentId)) return true
        current = this.itemById.get(current.parentId)
      }
      return false
    },
    ancestorIds(itemId) {
      const ancestors = []
      let current = this.itemById.get(itemId)
      while (current && current.parentId) {
        ancestors.push(current.parentId)
        current = this.itemById.get(current.parentId)
      }
      return ancestors
    },
    rebuildGraph() {
      const matched = this.matchedIds
      const searching = matched !== null

      // which items are shown?
      let displayItems
      if (searching) {
        // matches + their ancestors (search overrides collapse)
        const keep = new Set(matched)
        for (const id of matched) {
          for (const anc of this.ancestorIds(id)) keep.add(anc)
        }
        displayItems = this.items.filter(i => keep.has(i.id))
      } else {
        displayItems = this.items.filter(i => !this.isHiddenByCollapse(i.id))
      }

      const displayIds = new Set(displayItems.map(i => i.id))

      // dagre layout
      const g = new dagre.graphlib.Graph()
      g.setDefaultEdgeLabel(() => ({}))
      g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 70, marginx: 20, marginy: 20 })
      displayItems.forEach(item => g.setNode(item.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
      displayItems.forEach(item => {
        if (item.parentId && displayIds.has(item.parentId)) g.setEdge(item.parentId, item.id)
      })
      dagre.layout(g)

      this.flowNodes = displayItems.map(item => {
        const pos = g.node(item.id) || { x: 0, y: 0 }
        return {
          id: item.id,
          type: 'statCard',
          position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
          data: {
            tone: item.tone,
            icon: item.icon,
            title: item.title,
            subtitle: item.subtitle,
            badge: item.badge,
            stats: item.stats,
            hasChildren: (this.childrenMap.get(item.id) || []).length > 0,
            collapsed: this.collapsedIds.includes(item.id),
            matched: searching && matched.has(item.id),
            dimmed: searching && !matched.has(item.id),
            selected: this.selectedId === item.id,
            onToggle: this.toggleCollapse,
            onSelect: this.selectNode
          }
        }
      })

      this.flowEdges = displayItems
        .filter(item => item.parentId && displayIds.has(item.parentId))
        .map(item => ({
          id: `e-${item.parentId}-${item.id}`,
          source: item.parentId,
          target: item.id,
          type: 'smoothstep'
        }))
    },
    toggleCollapse(id) {
      const next = [...this.collapsedIds]
      const idx = next.indexOf(id)
      if (idx >= 0) next.splice(idx, 1)
      else next.push(id)
      this.collapsedIds = next
      this.$nextTick(() => this.fitViewFlow({ padding: 0.15, duration: 200 }))
    },
    selectNode(id) {
      this.selectedId = this.selectedId === id ? null : id
      this.rebuildGraph()
    },
    onNodeClick({ node }) {
      this.selectNode(node.id)
    },
    expandAll() {
      this.collapsedIds = []
      this.$nextTick(() => this.fitViewFlow({ padding: 0.15, duration: 200 }))
    },
    collapseAll() {
      this.collapsedIds = [...this.childrenMap.keys()]
      this.$nextTick(() => this.fitViewFlow({ padding: 0.15, duration: 200 }))
    },
    async captureFlowPng() {
      const wrapper = this.$refs.flowWrapper
      if (!wrapper) return null
      const flowEl = wrapper.querySelector('.vue-flow')
      const target = flowEl || wrapper
      return toPng(target, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: node => {
          if (!node.classList) return true
          return !node.classList.contains('vue-flow__minimap') && !node.classList.contains('vue-flow__controls')
        }
      })
    },
    async downloadImage() {
      this.exporting = true
      try {
        const dataUrl = await this.captureFlowPng()
        if (!dataUrl) return
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        downloadBlobData(blob, `${this.fileName}.png`)
      } catch (e) {
        console.error('Export image failed', e)
      } finally {
        this.exporting = false
      }
    },
    async downloadPdf() {
      this.exporting = true
      try {
        const dataUrl = await this.captureFlowPng()
        if (!dataUrl) return
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 8
        const imgProps = pdf.getImageProperties(dataUrl)
        const availW = pageWidth - margin * 2
        const availH = pageHeight - margin * 2
        const ratio = Math.min(availW / imgProps.width, availH / imgProps.height)
        const w = imgProps.width * ratio
        const h = imgProps.height * ratio
        pdf.addImage(dataUrl, 'PNG', (pageWidth - w) / 2, (pageHeight - h) / 2, w, h)
        pdf.save(`${this.fileName}.pdf`)
      } catch (e) {
        console.error('Export PDF failed', e)
      } finally {
        this.exporting = false
      }
    }
  }
}
</script>
