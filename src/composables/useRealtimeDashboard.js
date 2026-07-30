import { useRealtime } from './useRealtime'
import { useDashboardData } from './useDashboardData'
import { debounce } from '@/utils/debounce'

export function useRealtimeDashboard() {
  const dd = useDashboardData()

  useRealtime({
    channel: 'dashboard',
    events: ['statistics_updated'],
    handler: debounce(() => {
      dd.fetchAll()
    }, 300),
  })

  return {}
}
