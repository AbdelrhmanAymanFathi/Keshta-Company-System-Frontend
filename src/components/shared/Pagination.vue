<template>
  <div
    v-if="total > 0 && totalPages > 1"
    class="shadcn-ui mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
  >
    <div class="hidden items-center gap-4 sm:flex">
      <p class="text-sm theme-text-secondary">
        Showing
        <span class="font-medium">{{ startItem }}</span>
        to
        <span class="font-medium">{{ endItem }}</span>
        of
        <span class="font-medium">{{ total }}</span>
        results
      </p>
      <div class="flex items-center gap-2">
        <label class="text-sm theme-text-secondary">Page size:</label>
        <NativeSelect
          v-model.number="localPageSize"
          class="h-8 w-20 rounded border border-gray-300 bg-white px-2 text-sm focus:outline-none theme-input-focus"
          aria-label="Page size"
          @change="onPageSizeChange"
        >
          <NativeSelectOption v-for="option in pageSizeOptions" :key="option" :value="option">
            {{ option }}
          </NativeSelectOption>
        </NativeSelect>
      </div>
    </div>

    <Pagination
      :page="currentPage"
      :items-per-page="pageSize"
      :total="totalPages * pageSize"
      :sibling-count="3"
      show-edges
      class="mx-0 w-auto justify-end"
      @update:page="changePage"
    >
      <PaginationContent class="gap-1">
        <PaginationFirst class="hidden sm:inline-flex" aria-label="First page" />
        <PaginationPrevious aria-label="Previous page">
          Previous
        </PaginationPrevious>
        <span class="px-2 text-sm theme-text-secondary sm:hidden">{{ currentPage }} / {{ totalPages }}</span>
        <template v-for="page in pageList" :key="page.key">
          <PaginationEllipsis v-if="page.isEllipsis" class="hidden sm:inline-flex" />
          <PaginationItem
            v-else
            :value="page.number"
            :is-active="page.number === currentPage"
            class="hidden sm:inline-flex"
          >
            {{ page.number }}
          </PaginationItem>
        </template>
        <PaginationNext aria-label="Next page">
          Next
        </PaginationNext>
        <PaginationLast class="hidden sm:inline-flex" aria-label="Last page" />
      </PaginationContent>
    </Pagination>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

export default {
  name: 'AppPagination',
  components: {
    NativeSelect,
    NativeSelectOption,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationNext,
    PaginationPrevious
  },
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
      (value) => {
        localPageSize.value = value
      }
    )

    const startItem = computed(() => {
      if (props.total === 0) return 0
      return (props.currentPage - 1) * props.pageSize + 1
    })

    const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.total))

    const pageList = computed(() => {
      const pages = []
      const total = props.totalPages
      const current = props.currentPage
      const maxVisible = 7

      if (total <= maxVisible) {
        for (let page = 1; page <= total; page++) {
          pages.push({ key: `p-${page}`, number: page, isEllipsis: false })
        }
        return pages
      }

      const addPage = (number) => pages.push({ key: `p-${number}`, number, isEllipsis: false })
      const addEllipsis = (key) => pages.push({ key, number: null, isEllipsis: true })

      addPage(1)

      const windowSize = 3
      const start = Math.max(2, current - windowSize)
      const end = Math.min(total - 1, current + windowSize)

      if (start > 2) addEllipsis('ellipsis-start')
      for (let page = start; page <= end; page++) addPage(page)
      if (end < total - 1) addEllipsis('ellipsis-end')

      addPage(total)
      return pages
    })

    function changePage(page) {
      if (page < 1 || page > props.totalPages || page === props.currentPage) return
      emit('update:page', page)
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
