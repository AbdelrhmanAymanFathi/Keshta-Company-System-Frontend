<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ contractor?.name || $t('contractors.title') }}</h1>
        <div class="text-sm theme-text-muted">{{ contractor?.phone || '' }}</div>
      </div>
      <div>
        <button @click="$router.back()" class="px-3 py-1 border rounded">{{ $t('labels.back') }}</button>
      </div>
    </div>

    <WalletPanel v-if="contractor" :contractorId="contractor.id" />
  </div>
</template>

<script>
import { getContractors } from '@/api'
import WalletPanel from '@/components/shared/WalletPanel.vue'

export default {
  name: 'ContractorDetail',
  setup(props, { attrs }) {
    const route = attrs?.route || null
    return { route }
  },
  data() {
    return {
      contractor: null,
    
    }
  },
  async created() {
    const id = this.$route.params.id
    if (!id) return
    await this.loadContractor(id)
  },
  components: { WalletPanel },
  methods: {
    
    async loadContractor(id) {
      try {
        const res = await getContractors({ page: 1, pageSize: 1000 })
        const list = res?.data?.items || res?.data?.data || res?.data || []
        this.contractor = Array.isArray(list) ? list.find(c => String(c.id) === String(id)) : null
      } catch (e) {
        console.error('Failed to load contractor', e)
      }
    },
    formatDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      return dt.toLocaleString()
    }
  }
}
</script>

<style scoped>
</style>
