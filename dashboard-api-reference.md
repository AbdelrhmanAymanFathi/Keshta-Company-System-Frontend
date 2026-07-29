# Dashboard API Reference — Frontend Integration Guide

## Base Information

| Property | Value |
|---|---|
| Base URL | `/api` |
| Auth | JWT Bearer token in `Authorization` header |
| Content-Type | `application/json` |

All dashboard endpoints require `requireAuth` middleware. Send the token:

```
Authorization: Bearer <jwt_token>
```

---

## Date Filtering Convention

All dashboard endpoints share a consistent date filtering pattern:

| Param | Type | Required | Default |
|---|---|---|---|
| `fromDate` | ISO 8601 string | No | 30 days ago |
| `toDate` | ISO 8601 string | No | Today (end of day) |

Example: `?fromDate=2026-06-01&toDate=2026-07-01`

Common presets you can compute client-side and pass as query params:

| Preset | fromDate | toDate |
|---|---|---|
| Today | `2026-07-29` | `2026-07-29` |
| Yesterday | `2026-07-28` | `2026-07-28` |
| This Week | `2026-07-27` | `2026-07-29` |
| Last Week | `2026-07-20` | `2026-07-26` |
| This Month | `2026-07-01` | `2026-07-29` |
| Last Month | `2026-06-01` | `2026-06-30` |
| Last 7 Days | `2026-07-22` | `2026-07-29` |
| Last 30 Days | `2026-06-29` | `2026-07-29` |
| Last 90 Days | `2026-04-30` | `2026-07-29` |
| This Year | `2026-01-01` | `2026-07-29` |

---

## Endpoints

### 1. Dashboard Summary (Top-Level KPIs)

```
GET /api/dashboard/summary
```

**Query Params:** `fromDate`, `toDate`

**Response:**

```json
{
  "period": { "fromDate": "2026-06-29T00:00:00.000Z", "toDate": "2026-07-29T23:59:59.999Z" },
  "expenses": {
    "total": 1250000,
    "count": 340,
    "byKind": { "expense": 950000, "advance": 300000 },
    "byFlow": { "in": 200000, "out": 1050000 },
    "net": -850000,
    "pendingSettlement": 120000,
    "settled": 1130000
  },
  "payments": {
    "total": 800000,
    "count": 120,
    "byAccountType": { "SUPPLY": 400000, "TRANSPORT": 250000, "GENERAL": 150000 }
  },
  "treasury": {
    "totalBalance": 500000,
    "count": 5,
    "byType": { "main": 400000, "custody": 100000 },
    "periodIn": 300000,
    "periodOut": 200000
  },
  "companyWallet": {
    "balance": 1500000,
    "periodIn": 500000,
    "periodOut": 350000
  },
  "contractorWallets": {
    "totalOutstanding": 2500000,
    "byAccountType": { "SUPPLY": 1200000, "TRANSPORT": 800000, "EXTRACT": 300000, "RENTAL": 200000 }
  },
  "operations": {
    "supplies": { "total": 600000, "count": 45 },
    "transports": { "total": 450000, "count": 80, "trips": 320 },
    "extracts": { "total": 200000, "count": 15 },
    "rentals": { "total": 150000, "count": 12, "hours": 480 },
    "petroleumSupplies": { "totalDue": 300000, "totalTons": 150, "count": 8 },
    "equipmentLogs": { "total": 80000, "count": 60, "hours": 720 }
  },
  "system": {
    "activeBranches": 4,
    "activeUsers": 12,
    "activeContractors": 85,
    "pendingApprovals": 3
  }
}
```

**Suggested caching:** React Query with `staleTime: 30000` (30s).

---

### 2. Cash Flow Trend

```
GET /api/dashboard/cash-flow-trend
```

**Query Params:** `fromDate`, `toDate`, `groupBy` (`day` | `week` | `month`, default `day`)

**Response:**

```json
{
  "series": [
    { "date": "2026-07-01", "in": 15000, "out": 45000, "net": -30000 },
    { "date": "2026-07-02", "in": 12000, "out": 38000, "net": -26000 }
  ]
}
```

**Use case:** Area/line chart showing money in vs out over time.

---

### 3. Expenses by Classification

```
GET /api/dashboard/expenses-by-classification
```

**Query Params:** `fromDate`, `toDate`

**Response:**

```json
{
  "groups": [
    { "classification": "Operational", "total": 500000, "count": 150, "percentage": 40 },
    { "classification": "Administrative", "total": 300000, "count": 80, "percentage": 24 }
  ]
}
```

**Use case:** Horizontal bar chart.

---

### 4. Expenses by Category (Existing — Reused)

```
GET /api/expenses/items/grouped?groupBy=category&fromDate=...&toDate=...
```

**Response:**

```json
{
  "groups": [
    {
      "key": 1,
      "label": "Fuel",
      "totalAmount": 200000,
      "items": [
        { "id": 1, "label": "Diesel", "amount": 150000, "percentage": 75 },
        { "id": 2, "label": "Gasoline", "amount": 50000, "percentage": 25 }
      ]
    }
  ]
}
```

Also available with `groupBy=branch` and `groupBy=subcategory`.

**Use case:** Donut/pie chart, horizontal bar chart.

---

### 5. Monthly Comparison

```
GET /api/dashboard/monthly-comparison
```

**Query Params:** `months` (number, 1-60, default 12)

**Response:**

```json
{
  "months": [
    { "month": "2026-07", "expenses": 450000, "revenue": 200000, "net": -250000, "count": 340 },
    { "month": "2026-06", "expenses": 420000, "revenue": 180000, "net": -240000, "count": 310 }
  ]
}
```

**Use case:** Stacked bar chart — expenses vs revenue per month.

---

### 6. Payments by Type

```
GET /api/dashboard/payments-by-type
```

**Query Params:** `fromDate`, `toDate`

**Response:**

```json
{
  "groups": [
    { "accountType": "SUPPLY", "total": 400000, "count": 50, "percentage": 50 },
    { "accountType": "TRANSPORT", "total": 250000, "count": 40, "percentage": 31.25 },
    { "accountType": "GENERAL", "total": 150000, "count": 30, "percentage": 18.75 }
  ]
}
```

**Use case:** Donut chart.

---

### 7. Treasury Overview

```
GET /api/dashboard/treasury-overview
```

**Auth:** `requireAdmin`

**Query Params:** None (snapshot data)

**Response:**

```json
{
  "treasuries": [
    { "id": 1, "name": "Main Cash", "type": "MAIN", "balance": 300000, "periodIn": 150000, "periodOut": 80000 },
    { "id": 2, "name": "Site Custody", "type": "CUSTODY", "balance": 50000, "periodIn": 20000, "periodOut": 15000 }
  ],
  "totalBalance": 500000
}
```

**Use case:** Horizontal bar chart showing each treasury's balance.

---

### 8. Top Contractors

```
GET /api/dashboard/top-contractors
```

**Query Params:** `fromDate`, `toDate`, `limit` (1-50, default 10)

**Response:**

```json
{
  "contractors": [
    {
      "id": 5,
      "name": "Contractor ABC",
      "supplies": 200000,
      "transports": 150000,
      "extracts": 50000,
      "rentals": 0,
      "total": 400000
    }
  ]
}
```

**Use case:** Horizontal bar chart listing top contractors by total work volume.

---

### 9. Module Activity

```
GET /api/dashboard/module-activity
```

**Query Params:** `fromDate`, `toDate`

**Response:**

```json
{
  "modules": [
    { "name": "SUPPLIES", "total": 600000, "count": 45, "percentage": 32.4 },
    { "name": "TRANSPORTS", "total": 450000, "count": 80, "percentage": 24.3 },
    { "name": "EXTRACTS", "total": 200000, "count": 15, "percentage": 10.8 },
    { "name": "RENTALS", "total": 150000, "count": 12, "percentage": 8.1 },
    { "name": "EQUIPMENT_LOGS", "total": 80000, "count": 60, "percentage": 4.3 },
    { "name": "PETROLEUM", "total": 300000, "count": 8, "percentage": 16.2 }
  ]
}
```

**Use case:** Pie/donut chart comparing activity across business modules.

---

### 10. Petroleum Trend

```
GET /api/dashboard/petroleum-trend
```

**Query Params:** `fromDate`, `toDate`, `groupBy` (`day` | `week` | `month`)

**Response:**

```json
{
  "series": [
    { "date": "2026-07-01", "totalDue": 45000, "totalTons": 22.5, "totalTransport": 5000 },
    { "date": "2026-07-08", "totalDue": 38000, "totalTons": 19, "totalTransport": 4200 }
  ]
}
```

**Use case:** Multi-line chart showing petroleum costs over time.

---

### 11. Wallet Trend

```
GET /api/dashboard/wallet-trend
```

**Query Params:** `fromDate`, `toDate`, `groupBy` (`day` | `week` | `month`)

**Response:**

```json
{
  "series": [
    { "date": "2026-07-01", "deposits": 50000, "withdrawals": 30000, "net": 20000 },
    { "date": "2026-07-02", "deposits": 0, "withdrawals": 45000, "net": -45000 }
  ]
}
```

**Use case:** Area chart showing company wallet activity.

---

### 12. Expenses Trend

```
GET /api/dashboard/expenses-trend
```

**Query Params:** `fromDate`, `toDate`, `groupBy` (`day` | `week` | `month`)

**Response:**

```json
{
  "series": [
    { "date": "2026-07-01", "total": 45000, "count": 12 },
    { "date": "2026-07-02", "total": 38000, "count": 10 }
  ]
}
```

**Use case:** Line chart for daily/weekly expense tracking.

---

### 13. Approval Stats

```
GET /api/dashboard/approval-stats
```

**Auth:** `requireAdmin`

**Query Params:** None

**Response:**

```json
{
  "pending": 3,
  "approved": 25,
  "rejected": 2,
  "byModule": {
    "SUPPLY": { "pending": 1, "approved": 8, "rejected": 0 },
    "TRANSPORT": { "pending": 2, "approved": 10, "rejected": 1 },
    "RENTAL": { "pending": 0, "approved": 3, "rejected": 0 },
    "EXTRACT": { "pending": 0, "approved": 2, "rejected": 1 },
    "EXPENSE": { "pending": 0, "approved": 2, "rejected": 0 }
  }
}
```

---

### 14. Recent Activity

```
GET /api/dashboard/recent-activity
```

**Auth:** `requireAdmin`

**Query Params:** `page` (default 1), `pageSize` (1-20, default 10), `module` (optional filter)

**Response:**

```json
{
  "items": [
    {
      "id": 1234,
      "module": "supply",
      "action": "created",
      "entityId": 567,
      "date": "2026-07-29T10:30:00.000Z",
      "user": { "id": 1, "name": "Admin User" },
      "description": "Supply #567 created — 100,000 EGP",
      "amount": 100000
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 45
}
```

---

## Reusable Existing Endpoints (No Changes Needed)

| Endpoint | Purpose |
|---|---|
| `GET /api/expenses/summary?fromDate=&toDate=` | Expense KPIs (already exists) |
| `GET /api/expenses/items/grouped?groupBy=category&fromDate=&toDate=` | Expenses by category |
| `GET /api/expenses/items/grouped?groupBy=branch&fromDate=&toDate=` | Expenses by branch |
| `GET /api/expenses/items/grouped?groupBy=subcategory&fromDate=&toDate=` | Expenses by subcategory |
| `GET /api/company/summary` | Company wallet balance + 30d IN/OUT |
| `GET /api/treasuries/active` | List active treasuries |
| `GET /api/treasuries/:id/summary` | Single treasury summary |
| `GET /api/contractors/:id/wallet` | Single contractor wallet balance |
| `GET /api/approvals?status=PENDING` | List pending approvals |

---

## Caching Strategy

| Endpoint | TTL | Notes |
|---|---|---|
| `/dashboard/summary` | 30s | Most critical — refresh often |
| `/dashboard/cash-flow-trend` | 60s | |
| `/dashboard/monthly-comparison` | 120s | Changes less frequently |
| `/dashboard/top-contractors` | 120s | |
| `/dashboard/module-activity` | 60s | |
| `/dashboard/recent-activity` | 15s | Near real-time |
| `/dashboard/approval-stats` | 30s | |

Implement with React Query's `staleTime`:

```ts
const { data } = useQuery({
  queryKey: ['dashboard', 'summary', fromDate, toDate],
  queryFn: () => fetch(`/api/dashboard/summary?fromDate=${fromDate}&toDate=${toDate}`).then(r => r.json()),
  staleTime: 30_000,
});
```

---

## Date Handling

- The backend stores all dates in UTC.
- Send ISO 8601 date strings (e.g., `2026-07-29` or `2026-07-29T00:00:00.000Z`).
- The backend normalizes `toDate` to end-of-day (`23:59:59.999`).
- Render dates on the frontend in the user's local timezone.

---

## Error Handling

All dashboard endpoints return standard error format:

```json
{
  "error": "Failed to load dashboard data",
  "status": 500
}
```

Implement per-widget error boundaries — one failing query should not break the entire dashboard. Example with React Query:

```tsx
function DashboardWidget({ title, error, children }) {
  if (error) return <ErrorCard title={title} />;
  if (isLoading) return <Skeleton />;
  return children;
}
```

---

## Suggested Frontend Library Stack

| Concern | Recommendation |
|---|---|
| HTTP client | `fetch` or `axios` |
| Data fetching | TanStack React Query (stale-while-revalidate) |
| Charts | Recharts or Chart.js (responsive) |
| Layout | CSS Grid with responsive breakpoints |
| Date picker | react-datepicker or custom with presets |
| State management | URL search params for date range (shareable URLs) |
