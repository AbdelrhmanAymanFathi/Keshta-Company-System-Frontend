<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">{{ contractor?.name || $t('contractors.title') }}</h1>
        <div class="text-sm text-gray-500">{{ contractor?.phone || '' }}</div>
      </div>
      <div>
        <button @click="$router.back()" class="px-3 py-1 border rounded">{{ $t('labels.back') }}</button>
      </div>
    </div>

    <WalletPanel v-if="contractor" :contractorId="contractor.id" />
  </div>
</template>

<script>
import { getContractors, getContractor } from '@/api'
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
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
      try {
        // Try multiple times to fetch contractor directly by id (some backends may not return it instantly)
        let candidate = null
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const r = await getContractor(id)
            const payload = r?.data
            if (!payload) {
              candidate = null
            } else if (Array.isArray(payload) && payload.length > 0) candidate = payload[0]
            else if (payload.contractor) candidate = payload.contractor
            else if (payload.data && (payload.data.id || Array.isArray(payload.data))) candidate = payload.data
            else candidate = payload

            if (Array.isArray(candidate)) candidate = candidate[0] || null
            if (candidate && (candidate.id || candidate.contractorId)) {
              this.contractor = candidate
              break
            }
          } catch (err) {
            // ignore and retry
          }
          // small delay before retrying
          await sleep(250)
        }

        // If still not found, fallback to loading contractors list (optionally filtered by originating module)
        if (!this.contractor) {
          try {
            const mode = this.$route?.query?.from || undefined
            const params = { page: 1, pageSize: 1000 }
            if (mode) params.mode = mode
            const res = await getContractors(params)
            const list = res?.data?.items || res?.data?.data || res?.data || []
            this.contractor = Array.isArray(list) ? list.find(c => String(c.id) === String(id)) : null
          } catch (e2) {
            this.contractor = null
          }
        }
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
