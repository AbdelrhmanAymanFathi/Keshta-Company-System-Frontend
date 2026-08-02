import { ref, shallowRef } from 'vue'
import {
  getDashboardSummary,
  getCashFlowTrend,
  getExpensesByClassification,
  getExpensesGrouped,
  getMonthlyComparison,
  getPaymentsByType,
  getTreasuryOverview,
  getTopContractors,
  getModuleActivity,
  getPetroleumTrend,
  getWalletTrend,
  getExpensesTrend,
  getApprovalStats,
  getRecentActivity
} from '@/api'

export function useDashboardData() {
  const loading = ref(false)
  const error = ref('')
  const cache = shallowRef({})

  const summary = ref(null)
  const cashFlow = ref([])
  const expenseClassifications = ref([])
  const expensesByCategory = ref([])
  const expensesByBranch = ref([])
  const monthlyComparison = ref([])
  const paymentsByType = ref([])
  const treasuryOverview = ref(null)
  const topContractors = ref([])
  const moduleActivity = ref([])
  const petroleumTrend = ref([])
  const walletTrend = ref([])
  const expensesTrend = ref([])
  const approvalStats = ref(null)
  const recentActivity = ref([])

  function cacheKey(fromDate, toDate) {
    return `${fromDate || ''}_${toDate || ''}`
  }

  function extractData(resp) {
    if (!resp || resp.status !== 'fulfilled') return null
    const val = resp.value
    if (val?.data?.data !== undefined) return val.data.data
    if (val?.data !== undefined) return val.data
    return val
  }

  async function fetchAll(fromDate, toDate) {
    const key = cacheKey(fromDate, toDate)
    if (cache.value[key]) {
      const c = cache.value[key]
      Object.assign(summary, c.summary)
      cashFlow.value = c.cashFlow
      expenseClassifications.value = c.expenseClassifications
      expensesByCategory.value = c.expensesByCategory
      expensesByBranch.value = c.expensesByBranch
      monthlyComparison.value = c.monthlyComparison
      paymentsByType.value = c.paymentsByType
      treasuryOverview.value = c.treasuryOverview
      topContractors.value = c.topContractors
      moduleActivity.value = c.moduleActivity
      petroleumTrend.value = c.petroleumTrend
      walletTrend.value = c.walletTrend
      expensesTrend.value = c.expensesTrend
      approvalStats.value = c.approvalStats
      recentActivity.value = c.recentActivity
      return
    }

    loading.value = true
    error.value = ''

    try {
      const p = {}
      if (fromDate) p.fromDate = fromDate
      if (toDate) p.toDate = toDate

      const [
        summaryResp,
        cashFlowResp,
        classificationResp,
        catResp,
        branchResp,
        monthlyResp,
        paymentsTypeResp,
        treasuryResp,
        contractorsResp,
        moduleResp,
        petroleumResp,
        walletResp,
        expTrendResp,
        approvalResp,
        recentResp
      ] = await Promise.allSettled([
        getDashboardSummary(p),
        getCashFlowTrend(p),
        getExpensesByClassification(p),
        getExpensesGrouped({ ...p, groupBy: 'category' }),
        getExpensesGrouped({ ...p, groupBy: 'branch' }),
        getMonthlyComparison({ months: 12 }),
        getPaymentsByType(p),
        getTreasuryOverview(),
        getTopContractors(p),
        getModuleActivity(p),
        getPetroleumTrend(p),
        getWalletTrend(p),
        getExpensesTrend({ ...p, groupBy: 'day' }),
        getApprovalStats(),
        getRecentActivity({ page: 1, pageSize: 10 })
      ])

      summary.value = extractData(summaryResp)
      cashFlow.value = extractData(cashFlowResp)?.series || []
      expenseClassifications.value = extractData(classificationResp)?.groups || []
      expensesByCategory.value = extractData(catResp)?.groups || []
      expensesByBranch.value = extractData(branchResp)?.groups || []
      monthlyComparison.value = extractData(monthlyResp)?.months || []
      paymentsByType.value = extractData(paymentsTypeResp)?.groups || []
      treasuryOverview.value = extractData(treasuryResp) || null
      topContractors.value = extractData(contractorsResp)?.contractors || []
      moduleActivity.value = extractData(moduleResp)?.modules || []
      petroleumTrend.value = extractData(petroleumResp)?.series || []
      walletTrend.value = extractData(walletResp)?.series || []
      expensesTrend.value = extractData(expTrendResp)?.series || []
      approvalStats.value = extractData(approvalResp) || null
      recentActivity.value = extractData(recentResp)?.items || []

      cache.value[key] = {
        summary: summary.value ? { ...summary.value } : null,
        cashFlow: [...cashFlow.value],
        expenseClassifications: [...expenseClassifications.value],
        expensesByCategory: [...expensesByCategory.value],
        expensesByBranch: [...expensesByBranch.value],
        monthlyComparison: [...monthlyComparison.value],
        paymentsByType: [...paymentsByType.value],
        treasuryOverview: treasuryOverview.value ? { ...treasuryOverview.value } : null,
        topContractors: [...topContractors.value],
        moduleActivity: [...moduleActivity.value],
        petroleumTrend: [...petroleumTrend.value],
        walletTrend: [...walletTrend.value],
        expensesTrend: [...expensesTrend.value],
        approvalStats: approvalStats.value ? { ...approvalStats.value } : null,
        recentActivity: [...recentActivity.value]
      }
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    summary,
    cashFlow,
    expenseClassifications,
    expensesByCategory,
    expensesByBranch,
    monthlyComparison,
    paymentsByType,
    treasuryOverview,
    topContractors,
    moduleActivity,
    petroleumTrend,
    walletTrend,
    expensesTrend,
    approvalStats,
    recentActivity,
    fetchAll
  }
}
