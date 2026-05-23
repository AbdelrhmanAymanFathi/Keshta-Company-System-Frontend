<template>
  <div class="p-6 text-center text-red-600">
    <p class="text-lg font-semibold">{{ $t('labels.componentNotFound') || 'Component not found' }}</p>
    <p class="text-sm mt-2 theme-text-muted">{{ $t('labels.componentNotFoundDesc') || 'This component is not registered.' }}</p>
  </div>
</template>

<script>
export default {
  name: 'ComponentNotFound'
}
</script>
