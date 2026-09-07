<template>
  <span class="inline-flex flex-col items-center justify-center ms-1 gap-0" style="width:10px;height:16px;vertical-align:middle;">
    <!-- Up arrow -->
    <svg
      :class="active && dir === 'asc' ? 'text-indigo-500' : 'text-slate-300'"
      class="w-2 h-2 transition-colors duration-150"
      viewBox="0 0 8 5" fill="currentColor"
    >
      <path d="M4 0L8 5H0L4 0Z"/>
    </svg>
    <!-- Down arrow -->
    <svg
      :class="active && dir === 'desc' ? 'text-indigo-500' : 'text-slate-300'"
      class="w-2 h-2 transition-colors duration-150"
      viewBox="0 0 8 5" fill="currentColor"
    >
      <path d="M4 5L0 0H8L4 5Z"/>
    </svg>
  </span>
</template>

<script>
export default {
  name: 'SortIcon',
  props: {
    /** Whether this column is the currently active sort column */
    active: { type: Boolean, default: false },
    /** Current sort direction: 'asc' | 'desc' */
    dir:    { type: String,  default: 'desc' },
  },
}
</script>
