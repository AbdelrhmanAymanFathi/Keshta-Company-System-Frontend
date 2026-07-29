# Comprehensive Dashboard Implementation Plan

## System Overview

**ERP Modules**: Supplies/Exports, Transports, Extracts, Equipment/Rentals, Expenses, Payments, Treasury, Company Finance, Branches, Contractors, Vehicles, Crushers, Locations, Items, Users, Petroleum Materials.

**Current State**: No centralized analytics dashboard exists. Each module has its own list/detail views with basic filtering. Several summary endpoints exist but are not unified. The Treasury Dashboard is the closest thing to a KPI view (balance, 30d in/out).

---

## 1. KPI Cards — What Can Be Displayed

| # | KPI | Module | Data Source | Current Endpoint | Notes |
|---|-----|--------|-------------|------------------|-------|
| 1 | **Treasury Balance** | Treasury | All treasuries combined | `GET /api/treasuries/active` + compute balances client-side OR each `GET /api/treasuries/:id/summary` | No all-treasury-combined endpoint exists |
| 2 | **Company Wallet Balance** | Company | Company summary | `GET /api/company/summary` | Returns `balance`, `last30dIn`, `last30dOut` |
| 3 | **Total Expenses (Period)** | Expenses | Expense summary | `GET /api/expenses/summary?startDate=&endDate=` | Already supports date filtering |
| 4 | **Total Expense Count (Period)** | Expenses | Expense summary | Same as above | Summary likely returns `count` |
| 5 | **Total Payments (Period)** | Payments | Payments list | `GET /api/payments?startDate=&endDate=` | No aggregate endpoint — must compute client-side |
| 6 | **Pending Approvals** | Admin | Approvals inbox | `GET /api/approvals?status=PENDING` | Returns count |
| 7 | **Active Treasuries Count** | Treasury | Treasuries list | `GET /api/treasuries/active` | Array length |
| 8 | **Total Branch Count** | Branches | Branches list | `GET /api/branches` | Array length |
| 9 | **Total Changes Today** | Admin | All changes endpoints | All 14 `*Changes` functions with today's date | Already implemented in ChangesByDate |
| 10 | **Total Supplies (Period)** | Supplies | Supplies report | `GET /api/supplies/report?format=json&startDate=&endDate=` | Summary object in response |
| 11 | **Total Transports (Period)** | Transport | Transport report | `GET /api/transports/report?format=json&startDate=&endDate=` | Summary object in response |
| 12 | **Total Extracts (Period)** | Extracts | Extracts list | `GET /api/extracts?startDate=&endDate=` | Paginated — no summary endpoint |
| 13 | **Equipment Log Costs (Period)** | Equipment | Equipment logs summary | `GET /api/equipment-logs/summary?startDate=&endDate=` | Returns `totalHours`, `totalCost`, `count` |
| 14 | **Active Contractors Count** | Contractors | Contractors list | `GET /api/contractors` | Paginated — array length from first page |
| 15 | **Total Contractor Balance** | Contractors | All contractor wallets | No single endpoint | Must aggregate per-contractor |
| 16 | **Petroleum Supplies Total (Period)** | Petroleum | No summary endpoint | Only `GET /api/petroleum-supplies/changes` | **Needs new endpoint** |
| 17 | **Cash Inflow (Period)** | Treasury | Treasury transactions | `GET /api/treasuries/:id/summary` | `last30dIn` exists but only for a single treasury |
| 18 | **Cash Outflow (Period)** | Treasury | Treasury transactions | `GET /api/treasuries/:id/summary` | `last30dOut` exists but only for a single treasury |
| 19 | **Total Users Count** | Admin | Users list | `GET /api/users?page=1&pageSize=1` | Paginated — check `total` field |
| 20 | **Income vs Expense Ratio** | Cross-module | Company + Expenses | `GET /api/company/summary` + `GET /api/expenses/summary` | Computed client-side |

---

## 2. Charts — Value, Data Source, Endpoint, Response Shape

### 2.1 Treasury Balance Trend (Line/Area Chart)
- **Why**: Shows cash position over time — critical for financial health monitoring
- **Data Source**: Company wallet transactions + Treasury transactions
- **Endpoint**: `GET /api/company/wallet/transactions?startDate=&endDate=` (for company) + `GET /api/treasuries/:id/transactions?startDate=&endDate=` (per treasury)
- **Response Shape**: `{ items: [{ date, amount, type }], total, page, pageSize }`
- **Backend Change**: **New endpoint recommended**: `GET /api/dashboard/cash-flow?fromDate=&toDate=&interval=day|week|month` returning running balance over time. Avoids heavy client-side aggregation.
- **Expected Response**: `{ data: [{ date: "2026-07-01", balance: 150000, inflow: 50000, outflow: 30000 }, ...] }`

### 2.2 Expenses by Category (Pie/Donut Chart)
- **Why**: Visualize spending distribution across main categories — identifies where money goes
- **Data Source**: Expense categories + Expenses
- **Endpoint**: `GET /api/expenses/summary?startDate=&endDate=` (current) — but this likely returns only totals
- **Backend Change**: **Extend `GET /api/expenses/summary`** to accept `groupBy=categoryId` or create `GET /api/expenses/by-category?startDate=&endDate=`
- **Expected Response**: `{ data: [{ categoryId: 1, categoryName: "Travel", total: 45000, count: 12 }, ...] }`

### 2.3 Expenses vs Income Over Time (Stacked Bar/Area)
- **Why**: Compare money in vs money out over time — core profitability view
- **Data Source**: Company wallet transactions (type=DEPOSIT for inflow, PAYMENT/WITHDRAW for outflow) + Expenses
- **Endpoint**: `GET /api/company/wallet/transactions?startDate=&endDate=` filtered by type
- **Backend Change**: **New endpoint recommended**: `GET /api/dashboard/income-vs-expenses?fromDate=&toDate=&interval=month`
- **Expected Response**: `{ data: [{ month: "2026-07", income: 200000, expenses: 150000 }, ...] }`

### 2.4 Treasury Transaction Type Distribution (Pie/Donut)
- **Why**: Shows the mix of transaction types (DEPOSIT, PAYMENT, WITHDRAW, ADJUSTMENT)
- **Data Source**: Treasury transactions
- **Endpoint**: `GET /api/company/wallet/transactions?startDate=&endDate=&type=` (iterating over each type)
- **Backend Change**: **New endpoint recommended**: `GET /api/company/wallet/transactions/summary?startDate=&endDate=` returning type breakdown
- **Expected Response**: `{ data: { deposit: { count: 45, total: 500000 }, payment: { count: 120, total: 350000 }, withdraw: { count: 10, total: 50000 }, adjustment: { count: 3, total: 15000 } } }`

### 2.5 Monthly Supplies/Transport/Extract Volume (Grouped Bar)
- **Why**: Track operational volume trends (how much material moved)
- **Data Source**: Supplies report + Transport report
- **Endpoint**: `GET /api/supplies/report?format=json&startDate=&endDate=` + `GET /api/transports/report?format=json&startDate=&endDate=`
- **Backend Change**: **Extend report endpoints** to accept `groupBy=month` or create dedicated aggregation endpoints
- **Expected Response**: `{ data: [{ month: "2026-07", supplies: { quantity: 5000, amount: 750000 }, transports: { trips: 300, amount: 90000 } }, ...] }`

### 2.6 Top Contractors by Volume (Horizontal Bar)
- **Why**: Identify highest-value contractors for relationship management
- **Data Source**: Contractors Activity Report
- **Endpoint**: `GET /api/reports/contractors-activity?format=json&startDate=&endDate=`
- **Response Shape**: `{ items: [{ contractorName, suppliesSummary, transportsSummary, extractsSummary, rentalsSummary, total }], summary: { ... } }` — **already exists, reusable**
- **Backend Change**: None — can use existing endpoint with date filtering

### 2.7 Expense by Kind (EXPENSE vs ADVANCE) (Pie/Donut)
- **Why**: Understand the split between direct expenses and advances (custody)
- **Data Source**: Expenses with `kind` filter
- **Endpoint**: `GET /api/expenses/summary?startDate=&endDate=&kind=EXPENSE` + `&kind=ADVANCE`
- **Backend Change**: **Extend `GET /api/expenses/summary`** to accept `groupBy=kind`
- **Expected Response**: `{ data: { EXPENSE: { count: 200, total: 300000 }, ADVANCE: { count: 30, total: 75000 } } }`

### 2.8 Branch Performance Comparison (Bar)
- **Why**: Compare expenses, wallet balance, and activity across branches
- **Data Source**: Branch expenses + Branch wallet summaries
- **Endpoint**: `GET /api/branches` (list) → then per-branch: `GET /api/branches/:id/wallet/summary` + `GET /api/branches/:branchId/expenses?startDate=&endDate=&includeSummary=true`
- **Backend Change**: **New endpoint recommended**: `GET /api/dashboard/branches-summary?startDate=&endDate=` aggregating all branches
- **Expected Response**: `{ data: [{ branchId: 1, branchName: "Cairo", walletBalance: 50000, totalExpenses: 120000, expenseCount: 45 }, ...] }`

### 2.9 Payment Method Distribution (Pie)
- **Why**: Understand payment method preferences (CASH vs BANK_TRANSFER vs CHEQUE vs CUSTODY_CASH)
- **Data Source**: Expenses with paymentMethod filter
- **Endpoint**: `GET /api/expenses/summary?startDate=&endDate=&groupBy=paymentMethod`
- **Backend Change**: **Extend expenses summary** to support `groupBy` parameter
- **Expected Response**: `{ data: { CASH: { count: 80, total: 50000 }, BANK_TRANSFER: { count: 150, total: 350000 }, CHEQUE: { count: 20, total: 100000 }, CUSTODY_CASH: { count: 10, total: 25000 } } }`

### 2.10 Weekly/Monthly Change Activity (Heatmap or Line)
- **Why**: Track system activity levels — which days have most changes
- **Data Source**: Changes by Date endpoints
- **Endpoint**: All `*Changes` endpoints with date range
- **Backend Change**: **New endpoint recommended**: `GET /api/dashboard/activity-heatmap?fromDate=&toDate=` returning change count per day per module
- **Expected Response**: `{ data: [{ date: "2026-07-01", exports: 5, transports: 3, expenses: 12, payments: 8, ... }, ...] }`

### 2.11 Treasury Balance by Treasury (Horizontal Bar)
- **Why**: See the balance distribution across all treasuries (main + custody accounts)
- **Data Source**: `GET /api/treasuries/active` → then per-treasury summary
- **Backend Change**: **New endpoint recommended**: `GET /api/dashboard/treasuries-summary` returning all treasuries with their balances
- **Expected Response**: `{ data: [{ id: 1, name: "Main Treasury", type: "MAIN", balance: 200000, last30dIn: 50000, last30dOut: 30000 }, ...] }`

### 2.12 Equipment Utilization (Bar/Line)
- **Why**: Track equipment usage hours and costs over time
- **Data Source**: Equipment logs summary
- **Endpoint**: `GET /api/equipment-logs/summary?startDate=&endDate=`
- **Backend Change**: Extend to support `groupBy=month` or create `GET /api/equipment-logs/by-month?startDate=&endDate=`
- **Expected Response**: `{ data: [{ month: "2026-07", totalHours: 1200, totalCost: 96000, count: 45 }, ...] }`

### 2.13 Payment Module Distribution (Pie)
- **Why**: See which modules consume the most payments (supplies vs transport vs equipment vs extracts)
- **Data Source**: Payments with `accountType` field
- **Endpoint**: `GET /api/payments?startDate=&endDate=` — no aggregate endpoint
- **Backend Change**: **New endpoint recommended**: `GET /api/payments/summary?startDate=&endDate=` with module breakdown
- **Expected Response**: `{ data: { supply: { count: 50, total: 500000 }, transport: { count: 30, total: 120000 }, rental: { count: 20, total: 60000 }, extract: { count: 15, total: 200000 } } }`

---

## 3. Backend Endpoint Reuse vs New Endpoints

### Can Be Reused As-Is:
| Endpoint | Purpose |
|----------|---------|
| `GET /api/company/summary` | Company wallet balance, 30d in/out |
| `GET /api/expenses/summary` | Total expenses matching filters |
| `GET /api/equipment-logs/summary` | Equipment hours/costs |
| `GET /api/reports/contractors-activity` | Top contractors by volume |
| `GET /api/treasuries/active` | List of active treasuries |
| `GET /api/branches` | List of branches |
| `GET /api/approvals?status=PENDING` | Pending approval count |
| `GET /api/company/wallet/transactions` | Company transaction feed |
| `GET /api/treasuries/:id/summary` | Per-treasury balance |

### Need Minor Extension:
| Endpoint | Required Change |
|----------|----------------|
| `GET /api/expenses/summary` | Add `groupBy=categoryId|kind|paymentMethod` parameter |
| `GET /api/equipment-logs/summary` | Add `groupBy=month` parameter |
| `GET /api/supplies/report` | Add `groupBy=month` parameter for trend data |
| `GET /api/transports/report` | Add `groupBy=month` parameter for trend data |

### New Backend Endpoints Required:
| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `GET /api/dashboard/summary` | Single endpoint returning all top-level KPIs (balances, counts, totals) for the selected period | **Critical** |
| `GET /api/dashboard/cash-flow?fromDate=&toDate=&interval=` | Running balance/inflow/outflow over time for cash flow chart | **High** |
| `GET /api/dashboard/income-vs-expenses?fromDate=&toDate=&interval=` | Income vs expense breakdown by period | **High** |
| `GET /api/dashboard/treasuries-summary` | All treasuries with balances in one call | **High** |
| `GET /api/dashboard/branches-summary?startDate=&endDate=` | All branches with wallet balance + expenses | **Medium** |
| `GET /api/dashboard/activity-heatmap?fromDate=&toDate=` | Change count per day per module | **Medium** |
| `GET /api/payments/summary?startDate=&endDate=&groupBy=` | Payment totals by module | **Medium** |
| `GET /api/petroleum-supplies/summary?startDate=&endDate=` | Petroleum supplies totals | **Low** |
| `GET /api/company/wallet/transactions/summary?startDate=&endDate=` | Treasury transaction type breakdown | **Low** |

---

## 4. SQL/Database Aggregations Needed for Performance

Instead of fetching all raw records and aggregating client-side, the backend should use SQL aggregations:

```sql
-- Dashboard summary (for GET /api/dashboard/summary)
SELECT
  (SELECT COALESCE(SUM(balance), 0) FROM treasuries WHERE deletedAt IS NULL) AS totalTreasuryBalance,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE date BETWEEN :startDate AND :endDate AND kind = 'EXPENSE') AS totalExpenses,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE date BETWEEN :startDate AND :endDate AND kind = 'ADVANCE') AS totalAdvances,
  (SELECT COUNT(*) FROM expenses WHERE date BETWEEN :startDate AND :endDate) AS expenseCount,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE date BETWEEN :startDate AND :endDate) AS totalPayments,
  (SELECT COUNT(*) FROM treasuries WHERE deletedAt IS NULL) AS activeTreasuriesCount,
  (SELECT COUNT(*) FROM branches) AS branchCount,
  (SELECT COUNT(*) FROM contractors) AS contractorCount,
  (SELECT COUNT(*) FROM users WHERE status = 'active') AS activeUserCount,
  (SELECT COUNT(*) FROM approvals WHERE status = 'PENDING') AS pendingApprovalsCount;

-- Cash flow over time (for GET /api/dashboard/cash-flow)
SELECT
  DATE_TRUNC(:interval, created_at) AS period,
  SUM(CASE WHEN type IN ('DEPOSIT') THEN amount ELSE 0 END) AS inflow,
  SUM(CASE WHEN type IN ('PAYMENT', 'WITHDRAW') THEN amount ELSE 0 END) AS outflow
FROM treasury_transactions
WHERE created_at BETWEEN :fromDate AND :toDate
GROUP BY DATE_TRUNC(:interval, created_at)
ORDER BY period;

-- Expenses by category (extended GET /api/expenses/summary with groupBy)
SELECT
  ec.id AS categoryId,
  ec.name AS categoryName,
  COUNT(e.id) AS count,
  COALESCE(SUM(e.amount), 0) AS total
FROM expenses e
JOIN expense_categories ec ON e.categoryId = ec.id
WHERE e.date BETWEEN :startDate AND :endDate
GROUP BY ec.id, ec.name
ORDER BY total DESC;
```

**Recommended indices:**
- `expenses(date, kind, categoryId, paymentMethod)` — covers most expense aggregations
- `treasury_transactions(created_at, type)` — covers cash flow queries
- `payments(date)` — covers payment summaries
- `equipment_logs(date)` — covers equipment log summaries

---

## 5. Date Filtering Strategy

| Preset | Range | Behavior |
|--------|-------|----------|
| **Today** | `fromDate = today, toDate = today` | Quick snapshot of current activity |
| **This Week** | `fromDate = start of week (Mon), toDate = today` | Weekly operational view |
| **This Month** | `fromDate = 1st of month, toDate = today` | Monthly financial view |
| **Last 30 Days** | `fromDate = today-30, toDate = today` | Rolling 30-day view (matches existing treasury summary) |
| **This Quarter** | `fromDate = start of quarter, toDate = today` | Quarterly performance |
| **This Year** | `fromDate = Jan 1, toDate = today` | Year-to-date |
| **Custom Range** | User picks `fromDate` and `toDate` | Full flexibility |

**Implementation**: A `DateRangeSelector` shared component with preset buttons + custom date pickers. All dashboard API calls include `fromDate` and `toDate` params. Default to "Last 30 Days".

---

## 6. Recommended Dashboard Layout

### Row 1: KPI Cards (Summary Bar)
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Treasury │ │  Total  │ │  Total  │ │Pending  │ │   Cash  │ │ Changes │
│ Balance  │ │Expenses │ │Payments │ │Approvals│ │  Inflow │ │  Today  │
│  EGP X   │ │  EGP X  │ │  EGP X  │ │    N    │ │  EGP X  │ │    N    │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### Row 2: Financial Charts (2-column grid)
```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│   Cash Flow / Balance Trend     │ │   Income vs Expenses Over Time  │
│    (Line/Area Chart)            │ │    (Stacked Bar/Area Chart)     │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

### Row 3: Expense & Payment Analysis (2-column grid)
```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│   Expenses by Category          │ │   Treasury Transactions by Type │
│    (Pie/Donut Chart)            │ │    (Pie/Donut Chart)            │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

### Row 4: Operational & Activity Charts (2-column grid)
```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│   Monthly Volume Trend          │ │   Top Contractors by Volume     │
│  (Grouped Bar: Supplies+Trans)  │ │    (Horizontal Bar Chart)       │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

### Optional Row 5: Drill-down Details (when a card/chart is clicked)
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Selected Module] - Recent Transactions / Details Table             │
│  (Appears when user clicks a KPI or chart segment)                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Responsive behavior**: On mobile (< 768px), the 2-column grids collapse to single column, and KPI cards wrap to 2 per row.

---

## 7. Drill-Down Capabilities

| Click Target | Navigation | Filters Applied |
|---|---|---|
| "Treasury Balance" KPI | `/dashboard/treasury` | None |
| "Total Expenses" KPI | `/dashboard/expenses` | `startDate`, `endDate` (from dashboard filter) |
| "Total Payments" KPI | `/dashboard/payments` | `startDate`, `endDate` (from dashboard filter) |
| "Pending Approvals" KPI | `/dashboard/admin/approvals` | None |
| "Cash Inflow" KPI | `/dashboard/company-transactions` | `startDate`, `endDate`, `type=DEPOSIT` |
| "Changes Today" KPI | `/dashboard/admin/changes` | `fromDate=today, toDate=today` |
| Expenses Pie Slice (category) | `/dashboard/expenses` | `startDate`, `endDate`, `categoryId` |
| Treasury Type Pie Slice | `/dashboard/company-transactions` | `startDate`, `endDate`, `type=DEPOSIT|PAYMENT|WITHDRAW` |
| Cash Flow Chart data point | `/dashboard/company-transactions` | `startDate`, `endDate` for that period |
| Contractor Bar (Top Contractors) | `/dashboard/supplies/contractor-supply-statement/:id` | `contractorId` |
| Branch Bar | Navigate to branch detail (no dedicated route exists) | — |
| Monthly Volume Bar | `/dashboard/supplies/report` or `/dashboard/transport/report` | `startDate`, `endDate` for that month |

**Implementation**: Pass filter parameters via route query params (e.g., `/dashboard/expenses?startDate=2026-07-01&endDate=2026-07-31&categoryId=3`). Each target module should read query params and auto-apply filters on mount.

---

## 8. Performance Considerations

| Concern | Solution |
|---------|----------|
| **Multiple API calls on dashboard load** | Create a single `GET /api/dashboard/summary` endpoint that returns all KPIs in one response |
| **Chart data fetching** | Fetch chart data in parallel using `Promise.allSettled` |
| **Re-fetch on date change** | Debounce period changes by 300ms; cancel in-flight requests |
| **Caching** | Cache dashboard data for 60 seconds in a Pinia store. Invalidate on any mutation across the app (expense created, payment made, etc.) |
| **Large date ranges** | Backend should enforce max range (e.g., 1 year) for chart endpoints to prevent excessive aggregation |
| **Chart rendering** | Use lightweight library (Chart.js or ApexCharts) with lazy loading for chart components |
| **Pagination** | Dashboard details tables use existing server-side pagination |
| **WebSocket / Polling** | Optional: poll `GET /api/dashboard/summary` every 60s for real-time feel |
| **Redis/Memcache** | For high-traffic deployments, cache aggregation results with a TTL |

---

## 9. Mobile Responsiveness

| Component | Mobile Behavior (< 768px) |
|-----------|--------------------------|
| **KPI Cards** | 2 columns (vs 4-6 on desktop) |
| **Charts** | Full width, stacked vertically |
| **Date Range Selector** | Horizontal scroll or dropdown preset buttons only |
| **Drill-down Table** | Horizontal scroll with sticky first column |
| **Filter/Search** | Collapsible panel (toggle button) |
| **Sidebar** | Hidden by default, hamburger menu |
| **Chart Height** | Reduced to 250px (vs 350px on desktop) |

**Implementation**: Use Tailwind responsive classes (`grid-cols-2 md:grid-cols-3 lg:grid-cols-6` for KPIs, `flex-col lg:flex-row` for chart rows).

---

## 10. Missing Backend Functionality to Build First

### Critical (blocker for dashboard MVP):

| # | Missing Feature | Why Needed | Implementation |
|---|----------------|------------|----------------|
| 1 | `GET /api/dashboard/summary?fromDate=&toDate=` | Avoids 10+ parallel API calls on dashboard load | New endpoint returning all KPI values in a single response |
| 2 | `GET /api/dashboard/cash-flow?fromDate=&toDate=&interval=` | Cash flow chart requires aggregated time-series data | SQL aggregation query with DATE_TRUNC |
| 3 | `GET /api/treasuries/summary` (all treasuries) | Treasury balance KPI needs combined balance | Aggregate over all non-deleted treasuries |
| 4 | Extend `GET /api/expenses/summary` with `groupBy` parameter | Supports category/kind/paymentMethod breakdown charts | Add `groupBy` query param to existing endpoint |
| 5 | `GET /api/payments/summary?startDate=&endDate=` | Payment totals and module distribution | New aggregation endpoint |

### Medium Priority:

| # | Missing Feature | Why Needed |
|---|----------------|------------|
| 6 | `GET /api/dashboard/branches-summary?startDate=&endDate=` | Branch comparison chart |
| 7 | `GET /api/dashboard/activity-heatmap?fromDate=&toDate=` | Activity/heatmap visualization |
| 8 | Extend `GET /api/supplies/report` with `groupBy=month` | Monthly volume trend chart |
| 9 | Extend `GET /api/transports/report` with `groupBy=month` | Monthly volume trend chart |
| 10 | Extend `GET /api/equipment-logs/summary` with `groupBy=month` | Equipment utilization chart |

### Low Priority:

| # | Missing Feature | Why Needed |
|---|----------------|------------|
| 11 | `GET /api/petroleum-supplies/summary?startDate=&endDate=` | Petroleum materials KPI |
| 12 | `GET /api/company/wallet/transactions/summary?startDate=&endDate=` | Treasury type breakdown chart |
| 13 | `GET /api/dashboard/income-vs-expenses?fromDate=&toDate=&interval=` | Income vs expense chart (can be derived from cash-flow endpoint) |
