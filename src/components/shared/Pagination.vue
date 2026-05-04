<template>
  <div
    v-if="total > 0 && totalPages > 1"
    class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4"
  >
    <!-- Mobile: simple previous / next + page indicator -->
    <div class="flex-1 flex justify-between sm:hidden">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span class="text-sm text-gray-700 self-center">
        {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>

    <!-- Desktop: summary + page size + page numbers -->
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <p class="text-sm text-gray-700">
          Showing
          <span class="font-medium">{{ startItem }}</span>
          to
          <span class="font-medium">{{ endItem }}</span>
          of
          <span class="font-medium">{{ total }}</span>
          results
        </p>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-700">
            Page size:
          </label>
          <select
            v-model.number="localPageSize"
            @change="onPageSizeChange"
            class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>
      </div>

      <!-- Page numbers -->
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            @click="changePage(1)"
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            v-for="p in pageList"
            :key="p.key"
            @click="!p.isEllipsis && changePage(p.number)"
            :disabled="p.isEllipsis"
            :class="[
              'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
              p.isEllipsis
                ? 'bg-white border-gray-300 text-gray-400 cursor-default'
                : p.number === currentPage
                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            ]"
          >
            <span v-if="p.isEllipsis">…</span>
            <span v-else>{{ p.number }}</span>
          </button>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <button
            @click="changePage(totalPages)"
            :disabled="currentPage >= totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10l-4.293-4.293a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {
  name: 'AppPagination',
  props: {
    currentPage: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    pageSizeOptions: {
      type: Array,
      default: () => [10, 20, 50]
    }
  },
  emits: ['update:page', 'update:pageSize'],
  setup(props, { emit }) {
    const localPageSize = ref(props.pageSize)

    watch(
      () => props.pageSize,
      (v) => {
        localPageSize.value = v
      }
    )

    const startItem = computed(() => {
      if (props.total === 0) return 0
      return (props.currentPage - 1) * props.pageSize + 1
    })

    const endItem = computed(() => {
      return Math.min(props.currentPage * props.pageSize, props.total)
    })

    const pageList = computed(() => {
      const pages = []
      const total = props.totalPages
      const current = props.currentPage
      const maxVisible = 7

      if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
          pages.push({ key: `p-${i}`, number: i, isEllipsis: false })
        }
        return pages
      }

      const addPage = (n) => pages.push({ key: `p-${n}`, number: n, isEllipsis: false })
      const addEllipsis = (key) => pages.push({ key, number: null, isEllipsis: true })

      addPage(1)

      const windowSize = 3
      let start = Math.max(2, current - windowSize)
      let end = Math.min(total - 1, current + windowSize)

      if (start > 2) {
        addEllipsis('ellipsis-start')
      }

      for (let i = start; i <= end; i++) {
        addPage(i)
      }

      if (end < total - 1) {
        addEllipsis('ellipsis-end')
      }

      addPage(total)

      return pages
    })

    function changePage(p) {
      if (p < 1 || p > props.totalPages || p === props.currentPage) return
      emit('update:page', p)
    }

    function onPageSizeChange() {
      emit('update:pageSize', localPageSize.value)
    }

    return {
      localPageSize,
      startItem,
      endItem,
      pageList,
      changePage,
      onPageSizeChange
    }
  }
}
</script>


