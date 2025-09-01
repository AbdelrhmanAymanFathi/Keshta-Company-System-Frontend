<template>
  <div class="space-y-4">
    <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input placeholder="Item name" class="p-2 border rounded" />
      <input placeholder="Quantity" class="p-2 border rounded" />
      <input placeholder="Supplier" class="p-2 border rounded" />
      <button class="col-span-full py-2 rounded bg-teal-500 text-white">Create Supply</button>
    </form>
  </div>
</template>
<script>export default { name: 'NewSupply' }</script>
