<template>
  <div>
    <div class="overflow-auto bg-white rounded shadow">
      <table class="min-w-full divide-y">
        <thead class="bg-gray-50">
          <tr><th class="p-3 text-left">#</th><th class="p-3 text-left">Name</th><th class="p-3">Qty</th></tr>
        </thead>
        <tbody>
          <tr v-for="i in 6" :key="i" class="hover:bg-gray-50">
            <td class="p-3">{{ i }}</td>
            <td class="p-3">Item {{ i }}</td>
            <td class="p-3">10</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>export default { name: 'SuppliesList' }</script>
