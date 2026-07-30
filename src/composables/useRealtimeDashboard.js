import { useRealtime } from './useRealtime'
import { useDashboardData } from './useDashboardData'

export function useRealtimeDashboard() {
  const dd = useDashboardData()

  useRealtime({
    channel: 'dashboard',
    events: ['statistics_updated'],
    handler: () => {
      dd.fetchAll()
    },
  })

  return {}
}
