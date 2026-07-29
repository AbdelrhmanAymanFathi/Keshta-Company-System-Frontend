# Dashboard Backend Architecture & Implementation Plan

---

## Phase 1 — System Analysis

### 1.1 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js + TypeScript | Express 5, compiled via `tsc` |
| ORM | Prisma 7 | Custom output path `src/generated/client` |
| Database | PostgreSQL | Via `@prisma/adapter-pg` |
| Validation | Zod 4 | Custom `optionalDatePreprocessor` helper |
| Auth | JWT + TOTP | Access tokens + refresh tokens (`rt` cookie) |
| File generation | ExcelJS + PDFKit + LibreOffice | Reports in xlsx/pdf |
| Testing | Vitest | Integration-style tests against real DB |
| Background jobs | In-process worker | Polling `reportJob` table every 1.5s |

### 1.2 Database Schema (44 Models)

#### Core Business Modules

| Module | Primary Table(s) | Foreign Keys to | Key Numeric Fields | Soft Delete |
|---|---|---|---|---|
| **Supplies** | `Supply` | contractor, crusher, location, area, vehicle, item | `total`, `unitPrice`, `discount`, `companyCapacity`, `crusherCapacity` | `deletedAt` |
| **Transports** | `Transport` | contractor, location, area, vehicle, item | `total`, `numTrips`, `distanceKm`, `firstKmPrice`, `perKmPrice`, `discount` | `deletedAt` |
| **Extracts** | `Extract`, `ExtractLine` | contractor, location, area | `total` (header), `price`, `quantity`, `discount`, `total` (line) | None |
| **Rentals** | `Rental`, `RentalJob`, `RentalPayment` | equipment (via lookup) | `hours`, `hourlyRate`, `total` | `deletedAt` |
| **Equipment** | `Equipment`, `EquipmentLog` | contractor, driver, location, area | `hours`, `hourlyRate`, `discount`, `total` | `deletedAt` (log) |
| **Expenses** | `Expense` | branch, location, treasury, category, subCategory | `amount`, flow (`IN`/`OUT`), kind (`EXPENSE`/`ADVANCE`) | None |
| **Payments** | `Payment` | contractor, site/location, treasury, supply, transport | `amount` | None |
| **Petroleum Supplies** | `PetroleumSupply` | warehouse/location, supplier/contractor, transportContractor/contractor | `loadTons`, `tonPrice`, `supplierDue`, `transportPricePerTon`, `transportTotal` | `deletedAt` |

#### Financial Structure Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `Treasury` | Cash boxes (MAIN/CUSTODY types) | `name`, `type`, `balance`, `order`, `pinned` |
| `TreasuryTransaction` | Audit log for treasury movements | `treasuryId`, `date`, `type`, `amount`, `refType`, `refId`, `transferId` |
| `TreasuryTransfer` | Transfers between treasuries | `fromTreasuryId`, `toTreasuryId`, `amount`, `date` |
| `WalletTransaction` | Company/branch wallet entries | `companyId`, `branchId`, `type`, `amount`, `refType`, `refId`, `transferId` |
| `WalletTransfer` | Transfers between company/branches | `fromBranchId`, `toBranchId`, `amount`, `date` |
| `ContractorAccount` | Per-contractor per-type wallet | `contractorId`, `accountType`, `balance` |
| `ContractorAccountTransaction` | Audit log for contractor wallets | `walletId`, `type`, `refId`, `date`, `amount`, `signedAmount` |

#### Supporting Tables

| Table | Purpose |
|---|---|
| `Branch` | Cost centers/offices with `order` and `pinned` |
| `Location` | Hierarchical (parent/child) geographic locations |
| `Crusher` | Crusher references for supply module |
| `Vehicle` | Vehicles with ownership history (`VehicleOwnership`) |
| `Item` | Materials/products with unit and module availability |
| `Unit` | Measurement units |
| `Contractor` | Suppliers, transporters, extractors (multi-role) |
| `Driver` | Equipment operators |
| `ExpenseCategory` / `ExpenseSubCategory` | Hierarchical expense categorization |
| `User` / `Role` / `UserRole` | RBAC authentication |
| `Approval` | Approval workflows with before/after snapshots |
| `ReportDefinition` / `ReportParameter` | Dynamic SQL-based report definitions |
| `ReportJob` | Async report generation queue |
| `Company` | Singleton company entity |

#### Audit Trail

Every business model includes `createdById` and `updatedById` foreign keys to `User`, plus `createdAt`/`updatedAt` timestamps. Soft-delete models have `deletedAt`.

### 1.3 Existing API Surface (200+ Endpoints)

#### Authentication (`/api/auth`)
- Login (with optional TOTP 2FA), refresh, logout
- Password reset/change flow
- TOTP device registration/management
- Admin user registration/reset

#### CRUD Modules (each follows standard pattern)

| Module | Prefix | List | Get | Create | Update | Delete | Restore | Changes | Reports |
|---|---|---|---|---|---|---|---|---|---|
| Branches | `/api/branches` | GET | GET/:id | POST | PATCH | DELETE | PATCH/:id/restore | GET/changes | - |
| Contractors | `/api/contractors` | GET | GET/:id | POST | PATCH | DELETE(soft) | POST/:id/restore | GET/changes | GET/:id/report |
| Crushers | `/api/crushers` | GET | - | POST | PUT | DELETE(soft) | POST/:id/restore | GET/changes | - |
| Locations | `/api/locations` | GET | GET/:id | POST | PATCH | DELETE | - | GET/changes | - |
| Vehicles | `/api/vehicles` | GET | - | POST | PATCH | POST/delete/:id | POST/:id/restore | GET/changes | - |
| Equipment | `/api/equipment` | GET | GET/:id | POST | PATCH | DELETE | - | - | - |
| Equipment Logs | `/api/equipment-logs` | GET | GET/:id | POST | PATCH(PENDING) | DELETE(PENDING) | - | GET/changes | - |
| Rentals | `/api/rentals` | GET | GET/:id | POST | PATCH | DELETE(soft) | POST/:id/restore | GET/changes | GET/report |
| Transports | `/api/transports` | GET | GET/:id | POST | PATCH(PENDING) | DELETE(PENDING) | POST/:id/restore | GET/changes | GET/report |
| Supplies/Exports | `/api/exports` | GET | GET/:id | POST | PATCH(PENDING) | DELETE(PENDING) | POST/:id/restore | GET/changes | GET/report |
| Extracts | `/api/extracts` | GET | GET/:id | POST | PUT(PENDING) | DELETE(PENDING) | - | GET/changes | - |
| Expenses | `/api/expenses` | GET | GET/:id | POST | PATCH(PENDING) | DELETE(PENDING) | - | GET/changes | GET/report |
| Payments | `/api/payments` | GET | GET/:id | POST | - | DELETE | - | GET/changes | - |
| Petroleum Supplies | `/api/petroleum-supplies` | GET | GET/:id | POST | PATCH | DELETE(soft) | POST/:id/restore | GET/changes | GET/report |

**Note:** PENDING = routes submit to the approval system (`createApprovalRequest`) rather than executing directly. Actual mutation happens when an admin approves.

#### Financial Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/company/summary` | Company wallet balance + last 30d IN/OUT |
| `GET /api/company/wallet/transactions` | Paginated wallet transactions |
| `POST /api/company/wallet/deposit` | Direct deposit to company |
| `POST /api/company/wallet/withdraw` | Direct withdrawal from company |
| `POST /api/company/wallet/transfer-to-branch` | Company -> Branch transfer |
| `GET /api/branches/:id/wallet/summary` | Branch wallet balance + last 30d |
| `GET /api/branches/:id/wallet/transactions` | Branch wallet transactions |
| `POST /api/branches/:id/wallet/deposit/withdraw/transfer-*` | Branch wallet operations |
| `GET /api/treasuries/active` | List active treasuries |
| `GET /api/treasuries/:id/summary` | Treasury summary with last 30d IN/OUT |
| `GET /api/treasuries/:id/transactions` | Paginated treasury transactions |
| `POST /api/treasuries/:id/deposit` | Top-up treasury |
| `POST /api/treasuries/transfer` | Transfer between treasuries |
| `GET /api/contractors/:id/wallet` | Contractor wallet balance |
| `GET /api/contractors/:id/wallet/history` | Contractor wallet transaction history |

#### Admin Audit Endpoints

Every module exposes `GET /api/{module}/changes?fromDate=&toDate=` that returns records whose `updatedAt` falls within the range, with actor information.

#### Aggregation Endpoints (Existing)

| Endpoint | Aggregates | Queries |
|---|---|---|
| `GET /api/expenses/summary` | Total, by kind (EXPENSE/ADVANCE), by settlement status, by flow (IN/OUT), net | 7 parallel Prisma aggregates |
| `GET /api/expenses/items/grouped` | Grouped by branch/category/subcategory with totals | Prisma `findMany` + in-memory grouping |
| `GET /api/company/summary` | Wallet balance, 30d IN, 30d OUT | 3 parallel Prisma aggregates |
| `GET /api/branches/:id/wallet/summary` | Branch balance, 30d IN, 30d OUT | 3 parallel Prisma aggregates |
| `GET /api/treasuries/:id/summary` | Treasury balance, 30d IN, 30d OUT | Balance from record, aggregates on TreasuryTransaction |
| `GET /api/reports/contractors-activity` | Per-contractor debits/credits/outstanding | Prisma `findMany` + in-memory running balance |

### 1.4 Existing Repository Layer (Pattern Analysis)

**Pattern:** Every repository follows the same structure:
- Default `uow = prisma` parameter for dependency injection
- Methods return Prisma promises directly (no wrappers)
- `findPaged()` returns `[items, total]` tuple
- Soft-delete models have `findChangedInRange()` for admin audit

**Existing Aggregation Methods in Repositories:**

| Repository | Aggregate Methods |
|---|---|
| `expenseRepository` | `aggregateOverview(where)` — 6 parallel aggregates, `aggregateSummary(where)` — 7 parallel aggregates |
| `walletRepository` | `aggregateSummary(companyId, since?, branchId?)` — 3 parallel aggregates |
| `contractorWalletRepository` | `aggregateAmountByWalletAndType()`, `aggregateAmountByContractorAndType()`, `aggregateSignedBeforeDate()` |
| `rentalRepository` | `groupPayoutsByRentalIds()`, `aggregatePayouts()`, `aggregateJobHours()` |

**Missing Aggregations (Critical gap):** No aggregate methods exist in:
- `paymentRepository` — no `aggregateSummary`, no `groupBy`
- `supplyRepository` — no `aggregateSummary`
- `transportRepository` — no `aggregateSummary`
- `extractRepository` — no `aggregateSummary`
- `petroleumSupplyRepository` — no `aggregateSummary`
- `treasuryRepository` — no aggregate balance query
- `equipmentLogRepository` — no `aggregateSummary`

### 1.5 Existing Service Layer (Pattern Analysis)

**Pattern:**
1. Validate input via Zod schema
2. Parse/sanitize IDs
3. Build Prisma `where` clauses in internal helpers
4. Call repository methods (optionally within `prisma.$transaction`)
5. Map results (localization, Decimal conversion)

**Where business logic lives:**
- `expenseService` — expense creation with wallet + treasury side effects
- `paymentService` — payment creation with contractor wallet + treasury side effects
- `contractorService` — contractor creation with account setup, opening balances, duplicate detection
- `transportService` — fare calculation (`computeFarePerTrip` from `pricing.ts`)
- `supplyService` — total calculation based on unitPrice and capacity
- `equipmentLogService` — total resolution and contractor earning sync
- `rentalService` — total recomputation from jobs, payout tracking
- `walletService` — all company/branch wallet operations
- `treasuryService` — treasury transactions, transfers, summaries
- `contractorWalletService` — contractor wallet operations, history with running balance

### 1.6 Authentication & Authorization

**Two-tier auth:**
1. `requireAuth` — validates JWT bearer token, attaches `req.user` with `{ sub, roles, iat, exp }`
2. `requireAdmin` — checks `req.user.roles` for ADMIN role ID, or falls back to DB lookup if JWT doesn't contain roles

**Implication for dashboard:** Dashboard endpoints should use `requireAuth`. Some summary data may be admin-only. Sensitive financial aggregates should require admin.

### 1.7 Existing Report System

**Dynamic SQL-based reports** (`/api/report-defs`):
- Users define reports against 5 tables: Supply, Transport, EquipmentLog, Extract, Payment
- System auto-generates SQL with joins, filters, parameterized queries
- Supports Excel and PDF export via async worker

**Pre-built reports** (`/api/reports`):
- Exports, Transports, Rentals, Expenses, Expenses+AHD, Petroleum Supplies, Contractor Statement, Contractor Activity
- Generated as Excel workbooks via async `reportJob`

**Implication for dashboard:** Dynamic reports are too flexible for fixed dashboard widgets. Pre-built reports show the shape our aggregation logic should follow.

### 1.8 Performance Baseline

**Current bottlenecks:**
- No caching layer (every request hits DB)
- All list endpoints use Prisma `findMany` + `count` (full table scan when no filters)
- No materialized views
- `getContractorsActivityReportRows` is the most complex query (multiple `findMany` + in-memory filtering)
- No rate limiting

---

## Phase 2 — Dashboard Planning

### 2.1 Module-by-Module KPI & Chart Map

#### Expenses

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Expenses | Sum of all expenses | ✅ | `GET /api/expenses/summary` |
| Expenses by Kind | EXPENSE vs ADVANCE split | ✅ | Existing aggregate |
| Expenses by Flow | IN vs OUT totals | ✅ | Existing aggregate |
| Net Cash Flow | totalIn - totalOut | ✅ | Existing aggregate |
| Pending Settlement | Expenses with null settlementDate | ✅ | Existing aggregate |
| Settled Expenses | Expenses with non-null settlementDate | ✅ | Existing aggregate |
| Count Total | Number of expense records | ✅ | Existing aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Expenses by Category | Donut | ✅ | `GET /api/expenses/items/grouped?groupBy=category` |
| Expenses by Branch | Horizontal Bar | ✅ | `GET /api/expenses/items/grouped?groupBy=branch` |
| Expenses by Classification | Horizontal Bar | ❌ | New endpoint needed |
| Cash Flow Trend (IN vs OUT) | Area/Line | ✅ | New endpoint needed |
| Monthly Revenue vs Expenses | Stacked Bar | ✅ | New endpoint needed |
| Expenses by Subcategory | Donut | ✅ | Existing endpoint with `groupBy=subcategory` |

#### Payments

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Payments | Sum of all payments | ❌ | No aggregate endpoint |
| Payment Count | Number of payments | ❌ | No aggregate endpoint |
| By Account Type | SUM grouped by accountType | ❌ | No aggregate endpoint |
| By Payment Method | SUM grouped by paymentMethod | ❌ | No aggregate endpoint |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Payments by Account Type | Donut | ❌ | New endpoint needed |
| Payments by Payment Method | Horizontal Bar | ❌ | New endpoint needed |
| Payments Over Time | Line/Area | ❌ | New endpoint needed |

#### Treasury

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Balance | Sum of all treasury balances | ❌ | No aggregate — only per-treasury |
| By Type | MAIN vs CUSTODY split | ❌ | No aggregate |
| Total In (period) | Sum of DEPOSIT transactions | ❌ | No aggregate |
| Total Out (period) | Sum of WITHDRAW transactions | ❌ | No aggregate |
| Treasury Count | Number of active treasuries | ✅ | List endpoint |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Treasury Balances | Horizontal Bar | N/A (snapshot) | New endpoint needed |
| Treasury Transaction Trend | Line/Area | ✅ | New endpoint needed |

#### Company Wallet

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Current Balance | Company wallet balance | N/A | `GET /api/company/summary` |
| 30d In | Last 30 days deposits | Last 30d only | Existing (hardcoded 30d) |
| 30d Out | Last 30 days withdrawals | Last 30d only | Existing (hardcoded 30d) |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Wallet Balance Trend | Area | ✅ | New endpoint needed |
| Wallet In vs Out | Line | ✅ | New endpoint needed |

#### Contractor Wallet

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Outstanding | Sum of all contractor balances | ❌ | No aggregate |
| By Account Type | SUPPLY/TRANSPORT/etc totals | ❌ | No aggregate |
| Top Contractors | By work volume | ✅ | New endpoint needed |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Top Contractors by Volume | Horizontal Bar | ✅ | New endpoint needed |
| Contractor Activity Trend | Line | ✅ | New endpoint needed |

#### Supplies (Exports)

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Amount | Sum of all supply totals | ❌ | No aggregate |
| Total Capacity | Sum of company/crusher capacity | ❌ | No aggregate |
| Record Count | Number of supplies | ❌ | No aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Supplies Over Time | Line/Bar | ✅ | New endpoint needed |
| Supplies by Crusher | Horizontal Bar | ✅ | New endpoint needed |
| Supplies by Contractor | Horizontal Bar | ✅ | New endpoint needed |

#### Transports

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Amount | Sum of all transport totals | ❌ | No aggregate |
| Total Trips | Sum of numTrips | ❌ | No aggregate |
| Total Distance | Sum of distanceKm | ❌ | No aggregate |
| Record Count | Number of transports | ❌ | No aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Transports Over Time | Line/Bar | ✅ | New endpoint needed |
| Transports by Contractor | Horizontal Bar | ✅ | New endpoint needed |
| Trips vs Distance | Scatter/Bar | ✅ | New endpoint needed |

#### Extracts

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Amount | Sum of all extract totals | ❌ | No aggregate |
| Record Count | Number of extracts | ❌ | No aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Extracts Over Time | Line/Bar | ✅ | New endpoint needed |
| Extracts by Contractor | Horizontal Bar | ✅ | New endpoint needed |
| Extracts by Location | Horizontal Bar | ✅ | New endpoint needed |

#### Rentals

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Amount | Sum of all rental totals | ❌ | No aggregate |
| Total Hours | Sum of all rental hours | ❌ | No aggregate |
| Total Paid | Sum of all rental payouts | ❌ | No aggregate |
| Record Count | Number of rentals | ❌ | No aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Rentals Over Time | Line/Bar | ✅ | New endpoint needed |
| Rentals by Equipment | Horizontal Bar | ✅ | New endpoint needed |

#### Equipment Logs

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Hours | Sum of all equipment log hours | ❌ | No aggregate |
| Total Amount | Sum of totals | ❌ | No aggregate |
| Record Count | Number of equipment logs | ❌ | No aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Equipment Usage Over Time | Line/Bar | ✅ | New endpoint needed |
| Equipment by Contractor | Horizontal Bar | ✅ | New endpoint needed |

#### Petroleum Supplies

| KPI | Description | Period Support | Current Support |
|---|---|---|---|
| Total Supplier Due | Sum of supplierDue | ❌ | No aggregate |
| Total Transport Cost | Sum of transportTotal | ❌ | No aggregate |
| Total Load Tons | Sum of loadTons | ❌ | No aggregate |
| Record Count | Number of records | ❌ | No aggregate |

| Chart | Type | Period Support | Current Support |
|---|---|---|---|
| Petroleum Cost Trend | Line | ✅ | New endpoint needed |
| Petroleum by Product | Donut/Bar | ✅ | New endpoint needed |
| Petroleum by Supplier | Horizontal Bar | ✅ | New endpoint needed |

#### Cross-Module Analytics

| Chart | Type | Description |
|---|---|---|
| Module Activity Comparison | Pie/Donut | Compare total value across all modules |
| Daily Change Activity | Heatmap | Show when data changes happen |
| Recent Activity Timeline | List | Unified feed of all module changes |
| Total System Value | KPI Card | Sum across all revenue-generating modules |

### 2.2 Date Filtering Strategy

| Preset | Range Calc | Notes |
|---|---|---|
| Today | `fromDate = startOfDay(now)` `toDate = endOfDay(now)` | |
| Yesterday | `fromDate = startOfDay(now - 1d)` `toDate = endOfDay(now - 1d)` | |
| This Week | `fromDate = startOfWeek(now)` `toDate = endOfWeek(now)` | Monday start |
| Last Week | `fromDate = startOfWeek(now - 7d)` `toDate = endOfWeek(now - 7d)` | |
| This Month | `fromDate = startOfMonth(now)` `toDate = endOfMonth(now)` | |
| Last Month | `fromDate = startOfMonth(now - 1m)` `toDate = endOfMonth(now - 1m)` | |
| Last 7 Days | `fromDate = now - 7d` `toDate = now` | Rolling |
| Last 30 Days | `fromDate = now - 30d` `toDate = now` | Rolling (default) |
| Last 90 Days | `fromDate = now - 90d` `toDate = now` | Rolling |
| This Year | `fromDate = Jan 1` `toDate = Dec 31` | |
| Custom | User picks both dates | |

**All dashboard endpoints accept:** `fromDate` (ISO string, optional, default = 30 days ago) and `toDate` (ISO string, optional, default = today).

### 2.3 Drill-Down Map

| Dashboard Element | Click Action | Target | Filters |
|---|---|---|---|
| Expenses KPI | Navigate to expenses | `/api/expenses?startDate=&endDate=` | Date range |
| Payments KPI | Navigate to payments | `/api/payments?startDate=&endDate=` | Date range |
| Expenses by Category slice | Filter expenses | `/api/expenses?category=<name>&startDate=&endDate=` | Category + date |
| Expenses by Branch bar | Filter expenses | `/api/expenses?branchId=<id>&startDate=&endDate=` | Branch + date |
| Payments by Type slice | Filter payments | `/api/payments?accountType=<type>&startDate=&endDate=` | Type + date |
| Treasury bar | Navigate to treasury | `/api/treasuries/<id>/transactions` | Treasury ID |
| Top Contractor bar | Navigate to contractor | `/api/contractors/<id>/wallet/history` | Contractor ID |
| Cash Flow data point | View transactions | `/api/transactions?fromDate=<day>&toDate=<day>` | Specific day |
| Monthly bar | View month expenses | `/api/expenses?startDate=<month_start>&endDate=<month_end>` | Month |
| Module Activity slice | View module list | Module-specific page with date filters | Module + date |
| Pending Approvals KPI | Navigate to approvals | `/api/approvals?status=PENDING` | Pending |
| Recent Activity row | Navigate to entity | Entity detail page | Entity ID |

---

## Phase 3 — Endpoint Design

### 3.1 New Routes File

**File:** `src/routes/dashboard.ts`
**Prefix:** `/api/dashboard`
**Auth:** All endpoints require `requireAuth`. Some require `requireAdmin`.

### 3.2 Endpoint Specifications

#### `GET /api/dashboard/summary` (New — Replaces multiple frontend calls)

**Purpose:** Return all top-level KPIs in a single request (6+ parallel DB aggregates).

**Auth:** `requireAuth` (admin-only fields hidden for non-admin)

**Query Parameters:**

| Param | Type | Required | Default |
|---|---|---|---|
| `fromDate` | ISO date string | No | 30 days ago |
| `toDate` | ISO date string | No | Today |

**Validation:** `optionalDatePreprocessor` on both dates.

**Response Model:** `DashboardSummaryResponse`

```typescript
interface DashboardSummaryResponse {
  period: { fromDate: string; toDate: string };
  expenses: {
    total: number;          // SUM(amount) where deletedAt is null
    count: number;          // COUNT(*)
    byKind: { expense: number; advance: number };
    byFlow: { in: number; out: number };
    net: number;            // in - out
    pendingSettlement: number;
    settled: number;
  };
  payments: {
    total: number;          // SUM(amount)
    count: number;
    byAccountType: Record<string, number>;
  };
  treasury: {
    totalBalance: number;   // SUM(balance)
    count: number;
    byType: { main: number; custody: number };
    periodIn: number;       // SUM of deposits in period
    periodOut: number;      // SUM of withdrawals in period
  };
  companyWallet: {
    balance: number;
    periodIn: number;
    periodOut: number;
  };
  contractorWallets: {
    totalOutstanding: number;  // SUM of all contractor balances
    byAccountType: Record<string, number>;
  };
  operations: {
    supplies: { total: number; count: number };
    transports: { total: number; count: number; trips: number };
    extracts: { total: number; count: number };
    rentals: { total: number; count: number; hours: number };
    petroleumSupplies: { totalDue: number; totalTons: number; count: number };
    equipmentLogs: { total: number; count: number; hours: number };
  };
  system: {
    activeBranches: number;
    activeUsers: number;
    activeContractors: number;
    pendingApprovals: number;
  };
}
```

**Performance:** 15+ Prisma `aggregate` queries in parallel via `Promise.all`. Expected total time: 50-200ms.

**Caching:** Server-side LRU cache, TTL 30s. Client-side React Query/SWR, TTL 30s stale-while-revalidate.

---

#### `GET /api/dashboard/cash-flow-trend` (New)

**Purpose:** Return daily/weekly/monthly IN, OUT, and NET for the cash flow area chart.

**Auth:** `requireAuth`

**Query Parameters:**

| Param | Type | Required | Default |
|---|---|---|---|
| `fromDate` | ISO date | No | 30 days ago |
| `toDate` | ISO date | No | Today |
| `groupBy` | `'day' \| 'week' \| 'month'` | No | `'day'` |

**Response Model:**

```typescript
interface CashFlowTrendResponse {
  series: Array<{
    date: string;        // ISO date string truncated to groupBy unit
    in: number;          // Sum of IN expenses
    out: number;         // Sum of OUT expenses
    net: number;         // in - out
  }>;
}
```

**Data Source:** `Expense` table — `groupBy({ by: ['flow'], _sum: { amount } })` per date period.

**Implementation:** Use `DATE_TRUNC(groupBy, date)` via Prisma `$queryRawUnsafe` or raw SQL for the date truncation, since Prisma `groupBy` doesn't support date truncation natively.

---

#### `GET /api/dashboard/expenses-by-classification` (New)

**Purpose:** Return expense totals grouped by classification for a horizontal bar chart.

**Auth:** `requireAuth`

**Query Parameters:** `fromDate`, `toDate`

**Response Model:**

```typescript
interface ExpensesByClassificationResponse {
  groups: Array<{
    classification: string | null;
    total: number;
    count: number;
    percentage: number;  // relative to grand total
  }>;
}
```

**Data Source:** `Expense` table — `groupBy({ by: ['classification'], _sum: { amount }, _count: true })`. Use `expenseRepository` with a new `aggregateByClassification` method.

---

#### `GET /api/dashboard/payments-by-type` (New)

**Purpose:** Return payment totals grouped by accountType for a donut chart.

**Auth:** `requireAuth`

**Query Parameters:** `fromDate`, `toDate`

**Response Model:**

```typescript
interface PaymentsByTypeResponse {
  groups: Array<{
    accountType: string;
    total: number;
    count: number;
    percentage: number;
  }>;
}
```

**Data Source:** `Payment` table — `groupBy({ by: ['accountType'], _sum: { amount }, _count: true })`.

---

#### `GET /api/dashboard/treasury-overview` (New)

**Purpose:** Return all treasuries with their current balances and period activity for a horizontal bar chart.

**Auth:** `requireAdmin`

**Query Parameters:** None (snapshot data)

**Response Model:**

```typescript
interface TreasuryOverviewResponse {
  treasuries: Array<{
    id: number;
    name: string;
    type: 'MAIN' | 'CUSTODY';
    balance: number;
    periodIn: number;    // deposits in date range
    periodOut: number;   // withdrawals in date range
  }>;
  totalBalance: number;
}
```

**Data Source:** `Treasury` table + `TreasuryTransaction` table. List treasuries, then parallel aggregate transactions per treasury within the period.

---

#### `GET /api/dashboard/monthly-comparison` (New)

**Purpose:** Return 12 months of expense data split by IN/OUT for a stacked bar chart.

**Auth:** `requireAuth`

**Query Parameters:**

| Param | Type | Required | Default |
|---|---|---|---|
| `months` | number | No | 12 |

**Response Model:**

```typescript
interface MonthlyComparisonResponse {
  months: Array<{
    month: string;          // "YYYY-MM"
    expenses: number;       // Sum of OUT
    revenue: number;        // Sum of IN
    net: number;
    count: number;
  }>;
}
```

**Data Source:** `Expense` table — group by month and flow. Raw SQL needed for `DATE_TRUNC('month', date)`.

---

#### `GET /api/dashboard/top-contractors` (New)

**Purpose:** Return top N contractors by combined work volume across all modules.

**Auth:** `requireAuth`

**Query Parameters:**

| Param | Type | Required | Default |
|---|---|---|---|
| `fromDate` | ISO date | No | 30 days ago |
| `toDate` | ISO date | No | Today |
| `limit` | number (1-50) | No | 10 |

**Response Model:**

```typescript
interface TopContractorsResponse {
  contractors: Array<{
    id: number;
    name: string;
    supplies: number;       // Supply total in period
    transports: number;     // Transport total in period
    extracts: number;       // Extract total in period
    rentals: number;        // Rental total in period
    total: number;          // Combined total
  }>;
}
```

**Data Source:** Union of `Supply`, `Transport`, `Extract`, `Rental` tables — each grouped by contractorId with filtered date ranges. Combine in-memory or via raw SQL UNION.

---

#### `GET /api/dashboard/module-activity` (New)

**Purpose:** Compare total value across all operational modules for a pie chart.

**Auth:** `requireAuth`

**Query Parameters:** `fromDate`, `toDate`

**Response Model:**

```typescript
interface ModuleActivityResponse {
  modules: Array<{
    name: 'SUPPLIES' | 'TRANSPORTS' | 'EXTRACTS' | 'RENTALS' | 'EQUIPMENT_LOGS' | 'PETROLEUM';
    total: number;
    count: number;
    percentage: number;
  }>;
}
```

**Data Source:** 6 parallel `aggregate({ _sum })` queries across Supply, Transport, Extract, Rental, EquipmentLog, PetroleumSupply tables.

---

#### `GET /api/dashboard/petroleum-trend` (New)

**Purpose:** Return petroleum supply costs over time.

**Auth:** `requireAuth`

**Query Parameters:** `fromDate`, `toDate`, `groupBy` (`'month'` | `'week'` | `'day'`)

**Response Model:**

```typescript
interface PetroleumTrendResponse {
  series: Array<{
    date: string;
    totalDue: number;
    totalTons: number;
    totalTransport: number;
  }>;
}
```

**Data Source:** `PetroleumSupply` table — group by date period, `_sum: { supplierDue, loadTons, transportTotal }`.

---

#### `GET /api/dashboard/wallet-trend` (New)

**Purpose:** Return company wallet balance trend over time.

**Auth:** `requireAuth`

**Query Parameters:** `fromDate`, `toDate`, `groupBy`

**Response Model:**

```typescript
interface WalletTrendResponse {
  series: Array<{
    date: string;
    deposits: number;
    withdrawals: number;
    net: number;
  }>;
}
```

**Data Source:** `WalletTransaction` — group by date period, `_sum: { amount }` split by positive (deposit) / negative (withdrawal).

---

#### `GET /api/dashboard/recent-activity` (New)

**Purpose:** Return a unified feed of recent changes across all modules.

**Auth:** `requireAdmin`

**Query Parameters:**

| Param | Type | Required | Default |
|---|---|---|---|
| `page` | number | No | 1 |
| `pageSize` | number (1-20) | No | 10 |
| `module` | string | No | all |

**Response Model:**

```typescript
interface RecentActivityResponse {
  items: Array<{
    id: number;
    module: string;        // 'expense' | 'payment' | 'supply' | ...
    action: 'created' | 'updated' | 'deleted' | 'restored';
    entityId: number;
    date: string;          // ISO datetime
    user: { id: number; name: string } | null;
    description: string;
    amount: number | null;
  }>;
  page: number;
  pageSize: number;
  total: number;
}
```

**Data Source:** Query all `changes` endpoints in parallel, union, sort, paginate. Or use a combined approach: query `updatedAt` across all tables with audit includes, merge in memory.

---

#### `GET /api/dashboard/expenses-trend` (New)

**Purpose:** Daily/weekly expense amounts for a trend line.

**Auth:** `requireAuth`

**Query Parameters:** `fromDate`, `toDate`, `groupBy`

**Response Model:**

```typescript
interface ExpensesTrendResponse {
  series: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}
```

**Data Source:** `Expense` — `groupBy` with `DATE_TRUNC`.

---

#### `GET /api/dashboard/approval-stats` (New)

**Purpose:** Summary of approval workflow activity.

**Auth:** `requireAdmin`

**Response Model:**

```typescript
interface ApprovalStatsResponse {
  pending: number;
  approved: number;
  rejected: number;
  byModule: {
    SUPPLY: { pending: number; approved: number; rejected: number };
    TRANSPORT: { pending: number; approved: number; rejected: number };
    RENTAL: { pending: number; approved: number; rejected: number };
    EXTRACT: { pending: number; approved: number; rejected: number };
    EXPENSE: { pending: number; approved: number; rejected: number };
  };
}
```

**Data Source:** `Approval` — `groupBy({ by: ['status', 'module'], _count: true })`.

---

## Phase 4 — Repository Layer

### 4.1 New Repository Methods

#### `paymentRepository` — Add to `src/repositories/paymentRepository.ts`

```typescript
// Aggregate summary for a date range
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { amount: number | null };
  _count: number;
}>

// Group by accountType
async groupByAccountType(where: any, uow = prisma): Promise<Array<{
  accountType: string;
  _sum: { amount: number | null };
  _count: number;
}>>

// Group by date period
async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>
```

#### `supplyRepository` — Add to `src/repositories/supplyRepository.ts`

```typescript
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { total: number | null; companyCapacity: number | null; crusherCapacity: number | null };
  _count: number;
}>

async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>

async groupByContractor(where: any, limit: number, uow = prisma): Promise<any[]>
```

#### `transportRepository` — Add to `src/repositories/transportRepository.ts`

```typescript
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { total: number | null; numTrips: number | null; distanceKm: number | null };
  _count: number;
}>

async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>

async groupByContractor(where: any, limit: number, uow = prisma): Promise<any[]>
```

#### `extractRepository` — Add to `src/repositories/extractRepository.ts`

```typescript
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { total: number | null };
  _count: number;
}>

async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>
```

#### `rentalRepository` — Add to `src/repositories/rentalRepository.ts`

```typescript
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { total: number | null; hours: number | null };
  _count: number;
}>

async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>
```

#### `petroleumSupplyRepository` — Add to `src/repositories/petroleumSupplyRepository.ts`

```typescript
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { supplierDue: number | null; loadTons: number | null; transportTotal: number | null };
  _count: number;
}>

async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>
```

#### `equipmentLogRepository` — Add to `src/repositories/equipmentLogRepository.ts`

```typescript
async aggregateSummary(where: any, uow = prisma): Promise<{
  _sum: { total: number | null; hours: number | null };
  _count: number;
}>

async groupByDatePeriod(where: any, groupBy: string, uow = prisma): Promise<any[]>
```

#### `treasuryRepository` — Add to `src/repositories/treasuryRepository.ts`

```typescript
async aggregateBalance(uow = prisma): Promise<{
  _sum: { balance: number | null };
  _count: number;
}>
```

#### `expenseRepository` — Add to `src/repositories/expenseRepository.ts`

```typescript
async aggregateByClassification(where: any, uow = prisma): Promise<Array<{
  classification: string | null;
  _sum: { amount: number | null };
  _count: number;
}>>
```

### 4.2 Refactoring Opportunities

| Current Pattern | Issue | Recommendation |
|---|---|---|
| Duplicate `dateRegex` + UTC date handling in 15+ services | Code duplication | Already done — use `parseDateRange` from `datePreprocessor.ts` |
| `buildWhere` helpers duplicated across repositories | Repetition | Consider a shared `buildDateRangeWhere(field, from, to)` utility |
| Decimal conversions `.toNumber()` scattered everywhere | Consistency risk | Create a `decimalToNumber(obj, fields)` utility |
| `findChangedInRange` identical pattern in 15 repos | Code duplication | Create a generic `createChangeTracker(repo)` mixin |
| `findPaged` returns `[items, total]` tuple | Inconsistent naming | Keep as-is for internal consistency |
| `perPage` vs `pageSize` naming | Inconsistency | Standardize to `pageSize` everywhere |

### 4.3 Where Business Logic Belongs

| Responsibility | Layer | Reason |
|---|---|---|
| Building date-ranged `where` clauses | Repository | Close to data, avoids leaking Prisma types |
| Parallel aggregate orchestration | Service | Business logic: which aggregates to combine |
| Running balance calculations | Service | In-memory computation, not DB concern |
| Percentage calculations | Service (or frontend) | Simple math, keep backend lean |
| Response shaping / localization | Service | Consistent with existing patterns |
| Auth enforcement | Middleware | Separation of concerns |
| Validation | Route (Zod schema) | Prevents malformed data from entering services |

---

## Phase 5 — Database Performance

### 5.1 Query Strategy Classification

| Strategy | Used When | Example | Complexity |
|---|---|---|---|
| **Prisma `aggregate`** | Simple SUM/COUNT/AVG with filters | `aggregate({ _sum: { amount }, where: { date: { gte, lte } } })` | O(n) scan with index |
| **Prisma `groupBy`** | SUM/COUNT grouped by a column | `groupBy({ by: ['accountType'], _sum: { amount } })` | O(n) scan with index |
| **Raw SQL with `DATE_TRUNC`** | Grouping by date period | `SELECT DATE_TRUNC('month', date) AS period, SUM(amount) FROM "Expense" GROUP BY period` | O(n) scan with date index |
| **Multiple parallel aggregates** | Dashboard summary (15+ queries) | `Promise.all([...aggregates])` | Parallel O(n) each |
| **In-memory merge** | Top contractors (cross-table UNION) | Fetch per-table aggregates, merge in Node | Multiple O(n) + O(m) merge |

### 5.2 Required Indexes

For optimal dashboard performance, ensure these composite indexes exist:

```sql
-- Already exists or should be verified:
CREATE INDEX IF NOT EXISTS idx_expense_date_flow ON "Expense" (date, flow) INCLUDE (amount);
CREATE INDEX IF NOT EXISTS idx_expense_category ON "Expense" (category, date) INCLUDE (amount);
CREATE INDEX IF NOT EXISTS idx_expense_classification ON "Expense" (classification, date) INCLUDE (amount);
CREATE INDEX IF NOT EXISTS idx_expense_branch ON "Expense" (branchId, date) INCLUDE (amount);
CREATE INDEX IF NOT EXISTS idx_payment_paidat_accounttype ON "Payment" (paidAt, accountType) INCLUDE (amount);
CREATE INDEX IF NOT EXISTS idx_supply_date ON "Supply" (date) INCLUDE (total);
CREATE INDEX IF NOT EXISTS idx_transport_date ON "Transport" (date) INCLUDE (total, "numTrips", "distanceKm");
CREATE INDEX IF NOT EXISTS idx_extract_date ON "Extract" ("dateFrom", "dateTo") INCLUDE (total);
CREATE INDEX IF NOT EXISTS idx_rental_date ON "Rental" (date) INCLUDE (total, hours);
CREATE INDEX IF NOT EXISTS idx_petroleum_date ON "PetroleumSupply" (date) INCLUDE ("supplierDue", "loadTons", "transportTotal");
CREATE INDEX IF NOT EXISTS idx_equipmentlog_date ON "EquipmentLog" (date) INCLUDE (total, hours);
CREATE INDEX IF NOT EXISTS idx_treasurytransaction_date ON "TreasuryTransaction" ("treasuryId", date) INCLUDE (amount, type);
CREATE INDEX IF NOT EXISTS idx_wallettransaction_date ON "WalletTransaction" (date) INCLUDE (amount, type);
CREATE INDEX IF NOT EXISTS idx_approval_status ON "Approval" (status) INCLUDE (module);
CREATE INDEX IF NOT EXISTS idx_contractoraccount_contractor ON "ContractorAccount" (contractorId) INCLUDE (balance, accountType);
```

### 5.3 Query Plan Analysis

#### `GET /api/dashboard/summary` — Expected Query Plan

```sql
-- 1. Expenses aggregate
EXPLAIN ANALYZE
SELECT COUNT(*), SUM(amount),
       SUM(amount) FILTER (WHERE kind = 'EXPENSE'),
       SUM(amount) FILTER (WHERE kind = 'ADVANCE'),
       SUM(amount) FILTER (WHERE flow = 'IN'),
       SUM(amount) FILTER (WHERE flow = 'OUT'),
       SUM(amount) FILTER (WHERE "settlementDate" IS NULL)
FROM "Expense" WHERE date BETWEEN $1 AND $2 AND "deletedAt" IS NULL;
-- Expected: Index Scan on idx_expense_date_flow, ~1-5ms for 10K rows

-- 2. Payments aggregate
SELECT COUNT(*), SUM(amount) FROM "Payment" WHERE "paidAt" BETWEEN $1 AND $2;
-- Expected: Index Scan on idx_payment_paidat_accounttype, ~1-3ms

-- 3. Treasury balance
SELECT SUM(balance), COUNT(*) FROM "Treasury" WHERE "deletedAt" IS NULL;
-- Expected: Seq Scan (tiny table), <1ms

-- 4-15: Similar parallel queries
-- Total expected: 20-80ms on moderate dataset (50K-100K records)
```

#### `GET /api/dashboard/cash-flow-trend` — Expected Query Plan

```sql
-- Raw SQL needed for DATE_TRUNC
SELECT DATE_TRUNC('day', date) AS day, flow, SUM(amount) AS total
FROM "Expense"
WHERE date BETWEEN $1 AND $2 AND "deletedAt" IS NULL
GROUP BY day, flow
ORDER BY day;
-- Expected: Index Only Scan on idx_expense_date_flow, ~2-10ms
```

#### `GET /api/dashboard/top-contractors` — Expected Query Plan

```sql
-- Per-module subqueries
SELECT contractorId, SUM(total) AS total FROM "Supply"
WHERE date BETWEEN $1 AND $2 AND "deletedAt" IS NULL
GROUP BY contractorId ORDER BY total DESC LIMIT 10;

-- Merge in Node.js, then fetch contractor names
```

### 5.4 Materialized View Recommendations

Only implement if query times exceed 500ms on production data:

```sql
-- Daily expense snapshot
CREATE MATERIALIZED VIEW mv_dashboard_daily_expenses AS
SELECT DATE_TRUNC('day', date) AS day,
       flow, kind, category, classification,
       branchId, locationId, treasuryId,
       COUNT(*) AS count, SUM(amount) AS total
FROM "Expense" WHERE "deletedAt" IS NULL
GROUP BY 1,2,3,4,5,6,7,8;

-- Refresh schedule: every 15 minutes via pg_cron or application scheduler
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_daily_expenses;

-- Monthly contractor activity
CREATE MATERIALIZED VIEW mv_dashboard_monthly_contractors AS
SELECT DATE_TRUNC('month', date) AS month,
       "wallet"."contractorId",
       type,
       COUNT(*) AS count, SUM(amount) AS total
FROM "ContractorAccountTransaction"
JOIN "ContractorAccount" wallet ON wallet.id = "walletId"
WHERE wallet.deletedAt IS NULL
GROUP BY 1,2,3;
```

### 5.5 Query Complexity Summary

| Endpoint | Query Type | Parallel Queries | Indexes Used | Expected Time (10K rows) |
|---|---|---|---|---|
| `/dashboard/summary` | Prisma aggregate | 15+ | All date indexes | 50-200ms |
| `/dashboard/cash-flow-trend` | Raw SQL | 1 | `idx_expense_date_flow` | 10-50ms |
| `/dashboard/expenses-by-classification` | Prisma groupBy | 1 | `idx_expense_classification` | 5-20ms |
| `/dashboard/payments-by-type` | Prisma groupBy | 1 | `idx_payment_paidat_accounttype` | 5-20ms |
| `/dashboard/treasury-overview` | Prisma findMany + aggregate per treasury | N+1 | `idx_treasurytransaction_date` | 10-50ms |
| `/dashboard/monthly-comparison` | Raw SQL | 1 | `idx_expense_date_flow` | 10-50ms |
| `/dashboard/top-contractors` | Parallel Prisma aggregates | 4-5 | Module date indexes | 20-100ms |
| `/dashboard/module-activity` | Parallel Prisma aggregates | 6 | Module date indexes | 30-150ms |
| `/dashboard/petroleum-trend` | Raw SQL | 1 | `idx_petroleum_date` | 5-20ms |
| `/dashboard/wallet-trend` | Raw SQL | 1 | `idx_wallettransaction_date` | 5-20ms |
| `/dashboard/recent-activity` | Parallel findMany + merge | 15+ | All `updatedAt` indexes | 50-200ms |
| `/dashboard/expenses-trend` | Raw SQL | 1 | `idx_expense_date_flow` | 5-20ms |
| `/dashboard/approval-stats` | Prisma groupBy | 1 | `idx_approval_status` | 5-10ms |

---

## Phase 6 — Dashboard Summary Endpoint

### `GET /api/dashboard/summary` — Detailed Design

#### Orchestration Flow

```
Request: GET /api/dashboard/summary?fromDate=2026-06-29&toDate=2026-07-29
  │
  ├─► requireAuth middleware (JWT validation)
  │
  └─► dashboardService.getDashboardSummary(fromDate, toDate)
       │
       ├─► Build where clauses
       │    expenseWhere = { date: { gte, lte }, deletedAt: null }
       │    paymentWhere = { paidAt: { gte, lte } }
       │    supplyWhere  = { date: { gte, lte }, deletedAt: null }
       │    ... (same pattern for all modules)
       │
       ├─► Promise.all([
       │     expenseRepository.aggregateSummary(expenseWhere),
       │     expenseRepository.aggregateByClassification(expenseWhere),  // for top classification
       │     paymentRepository.aggregateSummary(paymentWhere),
       │     paymentRepository.groupByAccountType(paymentWhere),
       │     treasuryRepository.aggregateBalance(),
       │     walletRepository.aggregateSummary(companyId, fromDate, null),  // company wallet
       │     contractorWalletRepository.aggregateTotalOutstanding(),  // new method
       │     supplyRepository.aggregateSummary(supplyWhere),
       │     transportRepository.aggregateSummary(transportWhere),
       │     extractRepository.aggregateSummary(extractWhere),
       │     rentalRepository.aggregateSummary(rentalWhere),
       │     petroleumSupplyRepository.aggregateSummary(petroleumWhere),
       │     equipmentLogRepository.aggregateSummary(equipWhere),
       │     branchRepository.countActive(),  // new method
       │     userRepository.countActive(),  // new method
       │     approvalRepository.countByStatus('PENDING'),  // new method
       │   ])
       │
       └─► Compose response object
            └─► Return JSON
```

#### Code Structure

```typescript
// src/services/dashboardService.ts
export async function getDashboardSummary(
  fromDate?: string,
  toDate?: string
): Promise<DashboardSummaryResponse> {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const from = fromDate ? new Date(fromDate) : defaultFrom;
  const to = toDate ? new Date(toDate + 'T23:59:59.999Z') : new Date(now.toISOString().split('T')[0] + 'T23:59:59.999Z');

  const expenseWhere = { date: { gte: from, lte: to }, deletedAt: null };
  const paymentWhere = { paidAt: { gte: from, lte: to } };
  // ... similar for each module

  const [
    expenseSummary,
    paymentSummary,
    treasuryBalance,
    walletSummary,
    contractorOutstanding,
    supplySummary,
    transportSummary,
    extractSummary,
    rentalSummary,
    petroleumSummary,
    equipSummary,
    branchCount,
    userCount,
    pendingApprovals,
  ] = await Promise.all([
    expenseRepository.aggregateSummary(expenseWhere),
    paymentRepository.aggregateSummary(paymentWhere),
    treasuryRepository.aggregateBalance(),
    walletRepository.aggregateSummary(companyId, from, null),
    contractorWalletRepository.aggregateTotalOutstanding(),
    supplyRepository.aggregateSummary(supplyWhere),
    transportRepository.aggregateSummary(transportWhere),
    extractRepository.aggregateSummary(extractWhere),
    rentalRepository.aggregateSummary(rentalWhere),
    petroleumSupplyRepository.aggregateSummary(petroleumWhere),
    equipmentLogRepository.aggregateSummary(equipWhere),
    branchRepository.countActive(),
    userRepository.countActive(),
    approvalRepository.countByStatus('PENDING'),
  ]);

  return {
    period: { fromDate: from.toISOString(), toDate: to.toISOString() },
    expenses: {
      total: Number(expenseSummary._sum?.amount ?? 0),
      count: expenseSummary._count ?? 0,
      // ... map remaining fields
    },
    // ... map each module
  };
}
```

#### Error Handling

```typescript
// Wrap entire function in try/catch
try {
  // ... parallel queries
} catch (err) {
  logger.error('Dashboard summary failed', err);
  throw Object.assign(new Error('Failed to load dashboard data'), { status: 500 });
}
```

#### Caching Layer

```typescript
// Simple in-memory cache (src/utils/cache.ts)
const cache = new Map<string, { data: any; expiresAt: number }>();

export function getCached(key: string, ttlMs: number, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const data = await fetcher();
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  // Evict old entries if cache grows too large
  if (cache.size > 100) {
    const keys = [...cache.keys()];
    for (const oldKey of keys.slice(0, 20)) cache.delete(oldKey);
  }
  return data;
}
```

---

## Phase 7 — Chart Endpoints (Complete Specifications)

### 7.1 Cash Flow Trend

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/cash-flow-trend` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate`, `groupBy` (day\|week\|month) |
| **Validation** | Zod: `z.object({ fromDate: optionalDatePreprocessor, toDate: optionalDatePreprocessor, groupBy: z.enum(['day','week','month']).default('day') })` |
| **Method** | `dashboardService.getCashFlowTrend(from, to, groupBy)` |
| **DB Access** | Raw SQL with `DATE_TRUNC` + `GROUP BY flow` |
| **Cache TTL** | 60s |
| **Response** | `{ series: [{ date: string, in: number, out: number, net: number }] }` |

### 7.2 Monthly Comparison

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/monthly-comparison` |
| **Auth** | `requireAuth` |
| **Params** | `months` (number, 1-60, default 12) |
| **Validation** | Zod: `z.object({ months: z.coerce.number().int().min(1).max(60).default(12) })` |
| **Method** | `dashboardService.getMonthlyComparison(months)` |
| **DB Access** | Raw SQL with `DATE_TRUNC('month', date)` + `GROUP BY flow` |
| **Cache TTL** | 120s |
| **Response** | `{ months: [{ month: string, expenses: number, revenue: number, net: number, count: number }] }` |

### 7.3 Expenses by Classification

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/expenses-by-classification` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate` |
| **Validation** | Zod: date range schema |
| **Method** | `dashboardService.getExpensesByClassification(from, to)` |
| **DB Access** | `expenseRepository.aggregateByClassification(where)` — Prisma `groupBy` |
| **Cache TTL** | 60s |
| **Response** | `{ groups: [{ classification, total, count, percentage }] }` |

### 7.4 Expenses by Category

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/expenses/items/grouped?groupBy=category&fromDate=&toDate=` |
| **Auth** | `requireAuth` |
| **Reuse** | Existing endpoint — no changes needed |
| **Response** | `{ groups: [{ key, label, totalAmount, items }] }` — frontend adds percentage |

### 7.5 Expenses by Branch

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/expenses/items/grouped?groupBy=branch&fromDate=&toDate=` |
| **Auth** | `requireAuth` |
| **Reuse** | Existing endpoint — no changes needed |

### 7.6 Payments by Type

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/payments-by-type` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate` |
| **Method** | `dashboardService.getPaymentDistribution(from, to)` |
| **DB Access** | `paymentRepository.groupByAccountType(where)` — Prisma `groupBy` |
| **Cache TTL** | 60s |
| **Response** | `{ groups: [{ accountType, total, count, percentage }] }` |

### 7.7 Treasury Overview

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/treasury-overview` |
| **Auth** | `requireAdmin` |
| **Params** | None (snapshot) |
| **Method** | `dashboardService.getTreasuryOverview()` |
| **DB Access** | `treasuryRepository.listActiveOrdered()` + per-treasury transaction aggregates |
| **Cache TTL** | 30s |
| **Response** | `{ treasuries: [{ id, name, type, balance, periodIn, periodOut }], totalBalance }` |

### 7.8 Top Contractors

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/top-contractors` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate`, `limit` (1-50, default 10) |
| **Method** | `dashboardService.getTopContractors(limit, from, to)` |
| **DB Access** | Parallel Prisma queries per module (supply, transport, extract, rental) + in-memory merge |
| **Cache TTL** | 120s |
| **Response** | `{ contractors: [{ id, name, supplies, transports, extracts, rentals, total }] }` |

### 7.9 Module Activity

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/module-activity` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate` |
| **Method** | `dashboardService.getModuleActivity(from, to)` |
| **DB Access** | 6 parallel Prisma `aggregate` queries |
| **Cache TTL** | 60s |
| **Response** | `{ modules: [{ name, total, count, percentage }] }` |

### 7.10 Petroleum Trend

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/petroleum-trend` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate`, `groupBy` |
| **Method** | `dashboardService.getPetroleumTrend(from, to, groupBy)` |
| **DB Access** | Raw SQL with `DATE_TRUNC` |
| **Cache TTL** | 120s |
| **Response** | `{ series: [{ date, totalDue, totalTons, totalTransport }] }` |

### 7.11 Wallet Trend

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/wallet-trend` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate`, `groupBy` |
| **Method** | `dashboardService.getWalletTrend(from, to, groupBy)` |
| **DB Access** | Raw SQL with `DATE_TRUNC` on `WalletTransaction` |
| **Cache TTL** | 60s |
| **Response** | `{ series: [{ date, deposits, withdrawals, net }] }` |

### 7.12 Recent Activity

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/recent-activity` |
| **Auth** | `requireAdmin` |
| **Params** | `page`, `pageSize` (1-20), `module` (optional filter) |
| **Method** | `dashboardService.getRecentActivity(page, pageSize, module)` |
| **DB Access** | Parallel `findChangedInRange` across all 15 modules + in-memory merge + sort + paginate |
| **Cache TTL** | 15s (short — shows real-time changes) |
| **Response** | `{ items: [{ id, module, action, entityId, date, user, description, amount }], page, pageSize, total }` |

### 7.13 Approval Stats

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/approval-stats` |
| **Auth** | `requireAdmin` |
| **Params** | None |
| **Method** | `dashboardService.getApprovalStats()` |
| **DB Access** | `approvalRepository.groupByStatusAndModule()` — Prisma `groupBy` |
| **Cache TTL** | 30s |
| **Response** | `{ pending, approved, rejected, byModule: { ... } }` |

### 7.14 Expenses Trend

| Property | Detail |
|---|---|
| **Endpoint** | `GET /api/dashboard/expenses-trend` |
| **Auth** | `requireAuth` |
| **Params** | `fromDate`, `toDate`, `groupBy` |
| **Method** | `dashboardService.getExpensesTrend(from, to, groupBy)` |
| **DB Access** | Raw SQL with `DATE_TRUNC` |
| **Cache TTL** | 60s |
| **Response** | `{ series: [{ date, total, count }] }` |

---

## Phase 8 — Missing Functionality

### 8.1 Critical (Blocking — Must Implement Before Dashboard)

| # | Item | Reason | Effort | Files Affected |
|---|---|---|---|---|
| C1 | **Payment repository aggregate methods** | No way to get payment totals | 1h | `src/repositories/paymentRepository.ts` |
| C2 | **Supply repository aggregate methods** | No way to get supply totals | 1h | `src/repositories/supplyRepository.ts` |
| C3 | **Transport repository aggregate methods** | No way to get transport totals | 1h | `src/repositories/transportRepository.ts` |
| C4 | **Extract repository aggregate methods** | No way to get extract totals | 1h | `src/repositories/extractRepository.ts` |
| C5 | **Rental repository aggregate methods** | No way to get rental totals | 1h | `src/repositories/rentalRepository.ts` |
| C6 | **Petroleum supply repository aggregate methods** | No way to get petroleum totals | 1h | `src/repositories/petroleumSupplyRepository.ts` |
| C7 | **Equipment log repository aggregate methods** | No way to get equipment totals | 1h | `src/repositories/equipmentLogRepository.ts` |
| C8 | **Treasury repository aggregate balance** | No combined treasury balance | 0.5h | `src/repositories/treasuryRepository.ts` |
| C9 | **Contractor wallet total outstanding** | Cannot compute total contractor debt | 1h | `src/repositories/contractorWalletRepository.ts` + service |
| C10 | **Expense classification aggregate** | Cannot group expenses by classification | 0.5h | `src/repositories/expenseRepository.ts` |
| C11 | **Approval groupBy stats** | Cannot get approval counts by status+module | 0.5h | New `approvalRepository.ts` |

### 8.2 High (Dashboard Core Features)

| # | Item | Reason | Effort | Files Affected |
|---|---|---|---|---|
| H1 | **`dashboardService.ts`** | Orchestrates all dashboard logic | 4h | New file |
| H2 | **`dashboard.ts` route file** | All `/api/dashboard/*` endpoints | 2h | New file |
| H3 | **Raw SQL date truncation helper** | Needed for cash flow, monthly, trend queries | 1h | `src/utils/dateTrunc.ts` or inline |
| H4 | **In-memory cache utility** | Server-side caching for dashboard responses | 1h | `src/utils/cache.ts` |
| H5 | **Recent activity query** | Complex multi-table union query | 3h | `dashboardService.ts` |

### 8.3 Medium (Additional Charts)

| # | Item | Reason | Effort |
|---|---|---|---|
| M1 | **Petroleum by product/supplier** | Additional petroleum breakdowns | 1h |
| M2 | **Equipment usage by equipment** | Per-equipment breakdown | 1h |
| M3 | **Supplies by crusher** | Per-crusher breakdown | 1h |
| M4 | **Transports by vehicle** | Per-vehicle breakdown | 1h |
| M5 | **Branch wallet comparison** | Compare wallet balances across branches | 1h |

### 8.4 Low (Nice-to-Have)

| # | Item | Reason | Effort |
|---|---|---|---|
| L1 | **Activity heatmap** | Hourly/day-of-week change density | 3h |
| L2 | **Materialized views** | Performance optimization for large datasets | 2h |
| L3 | **Export dashboard to PDF** | Dashboard snapshot as report | 4h |
| L4 | **Percentage change vs previous period** | Trend indicators on KPI cards | 2h |
| L5 | **WebSocket real-time updates** | Push new data to dashboard without polling | 8h |

### 8.5 Refactoring Opportunities (Non-Blocking)

| # | Item | Benefit | Effort |
|---|---|---|---|
| R1 | Extract shared `buildDateRangeWhere` utility | Reduces duplication across 15 repos | 1h |
| R2 | Standardize `perPage` to `pageSize` | API consistency | 0.5h |
| R3 | Create `decimalToNumber` utility | Consistent Decimal handling | 0.5h |
| R4 | Extract `findChangedInRange` into mixin | Eliminates 15 identical methods | 2h |

---

## Phase 9 — Development Roadmap

### Milestone 1: Repository Aggregates (Critical)

**Goal:** Add all missing aggregate methods to existing repositories.

**Estimated complexity:** Low (each method is 5-15 lines)

**Dependencies:** None

**Files affected:**

| File | Changes |
|---|---|
| `src/repositories/paymentRepository.ts` | Add `aggregateSummary`, `groupByAccountType`, `groupByDatePeriod` |
| `src/repositories/supplyRepository.ts` | Add `aggregateSummary`, `groupByDatePeriod`, `groupByContractor` |
| `src/repositories/transportRepository.ts` | Add `aggregateSummary`, `groupByDatePeriod`, `groupByContractor` |
| `src/repositories/extractRepository.ts` | Add `aggregateSummary`, `groupByDatePeriod` |
| `src/repositories/rentalRepository.ts` | Add `aggregateSummary`, `groupByDatePeriod` |
| `src/repositories/petroleumSupplyRepository.ts` | Add `aggregateSummary`, `groupByDatePeriod` |
| `src/repositories/equipmentLogRepository.ts` | Add `aggregateSummary`, `groupByDatePeriod` |
| `src/repositories/treasuryRepository.ts` | Add `aggregateBalance` |
| `src/repositories/expenseRepository.ts` | Add `aggregateByClassification` |
| `src/repositories/branchRepository.ts` | Add `countActive` |
| `src/repositories/userRepository.ts` | Add `countActive` |
| `src/repositories/contractorWalletRepository.ts` | Add `aggregateTotalOutstanding` |
| New: `src/repositories/approvalRepository.ts` | Add `countByStatus`, `groupByStatusAndModule` |

**Testing:** Add unit tests for each new aggregate method. Verify against known data.

**Estimated time:** 4-6 hours

---

### Milestone 2: Dashboard Service & Summary Endpoint

**Goal:** Create `dashboardService.ts` and `GET /api/dashboard/summary`.

**Estimated complexity:** Medium (orchestrating 15+ parallel queries, error handling)

**Dependencies:** Milestone 1

**Files affected:**

| File | Changes |
|---|---|
| New: `src/services/dashboardService.ts` | `getDashboardSummary()`, all chart service functions |
| New: `src/routes/dashboard.ts` | All `/api/dashboard/*` routes |
| New: `src/utils/cache.ts` | Simple in-memory cache |
| `src/app.ts` | Register `transactionsRouter` |

**Testing:**
- Integration test: call `GET /api/dashboard/summary` with date range, verify all fields present and numeric
- Test with empty date range (should return 0s, not errors)
- Test authorization (non-admin should see limited data)
- Test cache invalidation

**Estimated time:** 6-8 hours

---

### Milestone 3: Core Chart Endpoints

**Goal:** Implement all core chart endpoints.

**Estimated complexity:** Medium-High

**Dependencies:** Milestone 1, Milestone 2 (service structure)

**Files affected:**

| Endpoint | Service Function | DB Approach |
|---|---|---|
| `GET /api/dashboard/cash-flow-trend` | `getCashFlowTrend` | Raw SQL `DATE_TRUNC` |
| `GET /api/dashboard/monthly-comparison` | `getMonthlyComparison` | Raw SQL `DATE_TRUNC` |
| `GET /api/dashboard/payments-by-type` | `getPaymentDistribution` | Prisma `groupBy` |
| `GET /api/dashboard/expenses-by-classification` | `getExpensesByClassification` | Prisma `groupBy` |
| `GET /api/dashboard/treasury-overview` | `getTreasuryOverview` | Prisma `findMany` + aggregate |
| `GET /api/dashboard/top-contractors` | `getTopContractors` | Parallel Prisma + merge |
| `GET /api/dashboard/module-activity` | `getModuleActivity` | Parallel Prisma `aggregate` |

**Testing:**
- Each endpoint: verify response shape matches spec
- Verify date range filtering works
- Verify groupBy parameter works (day/week/month)
- Test edge cases: empty date range, single day, cross-year

**Estimated time:** 8-10 hours

---

### Milestone 4: Trend & Activity Endpoints

**Goal:** Implement remaining chart endpoints.

**Estimated complexity:** Medium

**Dependencies:** Milestone 2

**Files affected:**

| Endpoint | Service Function | DB Approach |
|---|---|---|
| `GET /api/dashboard/petroleum-trend` | `getPetroleumTrend` | Raw SQL `DATE_TRUNC` |
| `GET /api/dashboard/wallet-trend` | `getWalletTrend` | Raw SQL `DATE_TRUNC` |
| `GET /api/dashboard/expenses-trend` | `getExpensesTrend` | Raw SQL `DATE_TRUNC` |
| `GET /api/dashboard/recent-activity` | `getRecentActivity` | Multi-table union |
| `GET /api/dashboard/approval-stats` | `getApprovalStats` | Prisma `groupBy` |

**Testing:**
- Verify trend data points match manual calculation
- Test recent activity pagination
- Verify approval stats accuracy

**Estimated time:** 6-8 hours

---

### Milestone 5: Frontend Integration (Optional — Backend Complete)

**Goal:** Build React dashboard frontend.

**Estimated complexity:** High

**Dependencies:** All backend milestones

**Approach:**
- Use React with TypeScript
- Chart library: Recharts or Chart.js (responsive, well-documented)
- Data fetching: React Query (TanStack Query) for caching, stale-while-revalidate
- Layout: CSS Grid with responsive breakpoints
- State management: URL search params for date range (shareable URLs)

**Component tree:**
```
DashboardPage
├── DateRangeSelector (presets + custom picker)
├── KPIGrid
│   ├── KPICard (expenses)
│   ├── KPICard (payments)
│   ├── KPICard (cash flow)
│   ├── KPICard (treasury)
│   ├── KPICard (supplies)
│   ├── KPICard (transports)
│   ├── KPICard (extracts)
│   └── KPICard (rentals)
├── ChartGrid
│   ├── CashFlowTrendChart (area)
│   ├── ExpensesByCategoryChart (donut)
│   ├── MonthlyComparisonChart (bar)
│   ├── TreasuryOverviewChart (bar)
│   ├── TopContractorsChart (horizontal bar)
│   └── ModuleActivityChart (pie)
└── RecentActivityTable
    └── ActivityRow (with drill-down links)
```

**Estimated time:** 16-24 hours

---

### Milestone 6: Performance Optimization

**Goal:** Add caching, verify indexes, optimize slow queries.

**Estimated complexity:** Medium

**Dependencies:** Milestones 1-4

**Tasks:**
1. Run `EXPLAIN ANALYZE` on every dashboard query against production-size data
2. Add missing indexes identified in Phase 5
3. Implement materialized views if any query exceeds 500ms
4. Add Redis cache layer (optional, replace in-memory cache)
5. Add query timeouts (all dashboard queries should have 5s max)
6. Add rate limiting for dashboard endpoints
7. Implement response compression for large trend datasets

**Estimated time:** 4-6 hours

---

### Milestone 7: Polish & Edge Cases

**Goal:** Handle all edge cases, add error boundaries, ensure zero downtime.

**Estimated complexity:** Low

**Tasks:**
1. Empty state handling (no data in date range — show zeros, not errors)
2. Large date range handling (cap at 2 years to prevent massive queries)
3. Timezone handling (all dates in UTC, display in user timezone on frontend)
4. Numeric overflow protection (use string for very large numbers on frontend)
5. Accessibility (ARIA labels on all chart elements)
6. Loading states (skeleton loaders for every widget)
7. Error states (per-widget error boundaries — one failing query doesn't break the whole dashboard)
8. Logging (log slow dashboard queries, track widget load times)

**Estimated time:** 3-4 hours

---

## Complete File Manifest

### New Files

| # | File | Purpose |
|---|---|---|
| 1 | `src/services/dashboardService.ts` | All dashboard aggregation and business logic |
| 2 | `src/routes/dashboard.ts` | All `/api/dashboard/*` route handlers |
| 3 | `src/utils/cache.ts` | Simple in-memory LRU cache |
| 4 | `src/repositories/approvalRepository.ts` | Approval-specific queries (or add to existing if preferred) |

### Modified Files

| # | File | Changes |
|---|---|---|
| 1 | `src/repositories/paymentRepository.ts` | Add 3 aggregate methods |
| 2 | `src/repositories/supplyRepository.ts` | Add 3 aggregate methods |
| 3 | `src/repositories/transportRepository.ts` | Add 3 aggregate methods |
| 4 | `src/repositories/extractRepository.ts` | Add 2 aggregate methods |
| 5 | `src/repositories/rentalRepository.ts` | Add 2 aggregate methods |
| 6 | `src/repositories/petroleumSupplyRepository.ts` | Add 2 aggregate methods |
| 7 | `src/repositories/equipmentLogRepository.ts` | Add 2 aggregate methods |
| 8 | `src/repositories/treasuryRepository.ts` | Add `aggregateBalance` |
| 9 | `src/repositories/expenseRepository.ts` | Add `aggregateByClassification` |
| 10 | `src/repositories/branchRepository.ts` | Add `countActive` |
| 11 | `src/repositories/userRepository.ts` | Add `countActive` |
| 12 | `src/repositories/contractorWalletRepository.ts` | Add `aggregateTotalOutstanding` |
| 13 | `src/app.ts` | Register dashboard route |

---

## Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Dashboard │  │  React   │  │    Chart Library     │  │
│  │  Layout   │  │  Query   │  │  (Recharts/Chart.js) │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Express Routes (src/routes/)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │          /api/dashboard/* (NEW)                   │   │
│  │  /summary  /cash-flow-trend  /payments-by-type   │   │
│  │  /treasury-overview  /monthly-comparison         │   │
│  │  /top-contractors  /module-activity              │   │
│  │  /petroleum-trend  /wallet-trend                │   │
│  │  /recent-activity  /approval-stats              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Existing Routes (Reused)                   │   │
│  │  /api/expenses/summary  /api/expenses/grouped    │   │
│  │  /api/company/summary   /api/approvals           │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Services (src/services/)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │    dashboardService.ts (NEW)                     │   │
│  │  Orchestrates parallel aggregate queries,        │   │
│  │  builds response objects, applies caching        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ expense  │ │ treasury │ │ wallet  │ │  all     │   │
│  │ Service  │ │ Service  │ │ Service  │ │ Services  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Repositories (src/repositories/)            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  aggregateSummary()  groupBy*()  countActive()   │   │
│  │  aggregateByClassification()  aggregateBalance() │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Payment  │ │ Supply  │ │Transport │ │ Expense  │   │
│  │  Repo    │ │  Repo   │ │  Repo    │ │  Repo    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Extract  │ │ Rental  │ │Treasury  │ │Petroleum │   │
│  │  Repo    │ │  Repo   │ │  Repo    │ │  Repo    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL + Prisma                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 44 Tables with composite indexes                  │   │
│  │ Optional: Materialized Views for large datasets   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```
