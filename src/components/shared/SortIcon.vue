<template>
  <span class="inline-flex flex-col items-center justify-center ms-1 gap-0" style="width:10px;height:16px;vertical-align:middle;">
    <svg
      :class="active && dir === 'asc' ? 'text-primary' : 'text-muted-foreground/40'"
      class="h-2 w-2 transition-colors duration-150"
      viewBox="0 0 8 5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 0L8 5H0L4 0Z"/>
    </svg>
    <svg
      :class="active && dir === 'desc' ? 'text-primary' : 'text-muted-foreground/40'"
      class="h-2 w-2 transition-colors duration-150"
      viewBox="0 0 8 5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 5L0 0H8L4 5Z"/>
    </svg>
  </span>
</template>

<script>
export default {
  name: 'SortIcon',
  props: {
    active: { type: Boolean, default: false },
    dir: { type: String, default: 'desc' }
  }
}
</script>
