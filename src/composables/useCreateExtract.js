// src/composables/useCreateExtract.js
// Mutation wrapper for creating extracts using @tanstack/vue-query
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import * as extractsService from '@/services/extracts'

export function useCreateExtract() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: extractsService.createExtract,
    retry: 0, // rely on idempotencyKey for safe retries
    onSuccess: (data, variables) => {
      try {
        const contractorId = variables?.contractorId
        if (contractorId) {
          qc.invalidateQueries(['extracts', contractorId])
          qc.invalidateQueries(['contractor', contractorId, 'wallet'])
        } else {
          qc.invalidateQueries(['extracts'])
        }
      } catch (e) {
        // swallow
        console.warn('Query invalidation error', e)
      }
    }
  })
}

export default useCreateExtract
