
# Realtime SSE System

## Architecture

```
Repository / Service
    │  eventBus.publish(channel, event, data?)
    ▼
Event Bus (EventEmitter singleton)
    │  subscribeAll(handler)
    ▼
Realtime Manager
    │  broadcasts to subscribed clients
    ▼
SSE Clients (browser EventSource)
    │  receives event, calls existing REST API
    ▼
Frontend UI updates
```

### Key design decisions

- **No full data sent through SSE** — only lightweight event names
- **Frontend refreshes by calling existing REST endpoints** — no API duplication
- **No new dependencies** — uses Express 5 + native EventEmitter
- **No database changes** — events are in-memory only

---

## Files

| File | Purpose |
|---|---|
| `src/services/eventBus.ts` | Centralized pub/sub event bus (EventEmitter) |
| `src/services/realtimeManager.ts` | SSE connection manager, heartbeat, cleanup, channel broadcasting |
| `src/routes/realtime.ts` | `GET /api/realtime` SSE endpoint |

### Modified files

| File | Change |
|---|---|
| `src/app.ts` | Added `realtimeRouter`, `realtimeManager.init()` on startup |
| `src/repositories/expenseRepository.ts` | Events after create/update/delete |
| `src/repositories/paymentRepository.ts` | Events after create/delete |
| `src/repositories/supplyRepository.ts` | Events after create/update/softDelete/restore |
| `src/repositories/transportRepository.ts` | Events after create/update/softDelete/restore |
| `src/repositories/extractRepository.ts` | Events after create/update/delete |
| `src/repositories/equipmentLogRepository.ts` | Events after create/update/softDelete |
| `src/repositories/petroleumSupplyRepository.ts` | Events after create/update/softDelete/restore |
| `src/repositories/rentalRepository.ts` | Events after create/update, payout/job mutations |
| `src/repositories/treasuryRepository.ts` | Events after create/update/archive/restore, transaction/transfer |
| `src/repositories/walletRepository.ts` | Events after transfer operations |
| `src/services/approvalService.ts` | Events after create/reject/approve |

---

## Channels

| Channel | Description |
|---|---|
| `dashboard` | Dashboard-level events (statistics_updated) |
| `statistics` | Statistics updates |
| `treasury` | Treasury balance changes, transactions |
| `expenses` | Expense CRUD |
| `payments` | Payment CRUD |
| `supplies` | Supply CRUD |
| `transport` | Transport CRUD |
| `equipment-log` | Equipment log CRUD |
| `extracts` | Extract CRUD |
| `approvals` | Approval workflow events |
| `notifications` | User notifications |
| `rentals` | Rental CRUD |
| `petroleum-supply` | Petroleum supply CRUD |
| `wallet` | Wallet transfer events |

---

## Events

### Dashboard
- `statistics_updated` — emitted automatically when any module changes

### Treasury
- `treasury_balance_changed` — treasury created/updated/archived/restored, transfer created
- `treasury_transaction_created` — manual transaction recorded

### Expenses
- `expense_created`, `expense_updated`, `expense_deleted`

### Payments
- `payment_created`, `payment_deleted`

### Supplies
- `supply_created`, `supply_updated`, `supply_deleted`

### Transport
- `transport_created`, `transport_updated`, `transport_deleted`

### Equipment Log
- `equipment_created`, `equipment_updated`, `equipment_deleted`

### Extracts
- `extract_created`, `extract_updated`, `extract_deleted`

### Approvals
- `approval_created`, `approval_completed`, `approval_rejected`

### Notifications
- `notification_created` — emitted automatically when approval events occur

### Wallet
- `wallet_transfer_completed` — company↔branch transfers

---

## Derived events

When certain channels receive events, the system automatically emits additional events on related channels:

| Source Channel | Derived Events |
|---|---|
| expenses | `dashboard:statistics_updated`, `treasury:treasury_balance_changed` |
| payments | `dashboard:statistics_updated`, `treasury:treasury_balance_changed` |
| supplies | `dashboard:statistics_updated` |
| transport | `dashboard:statistics_updated` |
| extracts | `dashboard:statistics_updated`, `treasury:treasury_balance_changed` |
| treasury | `dashboard:statistics_updated` |
| approvals | `dashboard:statistics_updated` |
| equipment-log | `dashboard:statistics_updated` |
| rentals | `dashboard:statistics_updated` |
| petroleum-supply | `dashboard:statistics_updated` |
| wallet | `dashboard:statistics_updated`, `treasury:treasury_balance_changed` |

Approval events also emit `notifications:notification_created`.

---

## Frontend integration

### Connect

```js
const token = getAccessToken();
const channels = ['dashboard', 'expenses']; // subscribe only to relevant channels
const es = new EventSource(`/api/realtime?channels=${channels.join(',')}&token=${encodeURIComponent(token)}`);
```

### Receive events

```js
es.addEventListener('message', (event) => {
  const { channel, event: eventName, data } = JSON.parse(event.data);

  switch (eventName) {
    case 'statistics_updated':
      fetchDashboardSummary(); // call existing API
      break;
    case 'expense_created':
    case 'expense_updated':
    case 'expense_deleted':
      fetchExpenses(); // refresh expense list
      break;
    case 'approval_created':
    case 'approval_completed':
      fetchApprovals();
      fetchDashboardSummary();
      break;
  }
});
```

### Handle connection

```js
es.addEventListener('connected', (event) => {
  const { clientId, channels } = JSON.parse(event.data);
  console.log('SSE connected', clientId, channels);
});

es.addEventListener('error', (event) => {
  // automatic reconnect is built into EventSource
  console.warn('SSE error, will reconnect', event);
});
```

### Reconnection

The browser `EventSource` API automatically reconnects on connection loss. No additional code needed.

---

## Security

- Uses existing `requireAuth` middleware (JWT Bearer token)
- Unauthorized requests return 401
- The route also accepts `?token=` query param for browser `EventSource` (which cannot set custom headers)
- All events are broadcast to all connected clients; no data isolation between users (events contain only entity IDs, not sensitive data)

### Connection limits

- Max 500 total SSE connections
- Max 10 connections per user
- Stale connections (no activity for 120s) are cleaned up every 60s

---

## Adding a new module

### 1. Publish events from repository

In your repository's create/update/delete methods:

```typescript
import { eventBus } from '../services/eventBus';

export const myRepository = {
  async create(data: any) {
    const result = await prisma.myModel.create({ data });
    eventBus.publish('my-channel', 'my_created', { id: result.id });
    return result;
  },
};
```

### 2. (Optional) Add derived events

In `src/services/realtimeManager.ts`, add to `DERIVED_EVENTS`:

```typescript
const DERIVED_EVENTS: Record<string, { channel: string; event: string }[]> = {
  // ...
  'my-channel': [
    { channel: 'dashboard', event: 'statistics_updated' },
  ],
};
```

### 3. (Optional) Add to VALID_CHANNELS

In `src/routes/realtime.ts`, add your channel:

```typescript
const VALID_CHANNELS = new Set([
  // ...
  'my-channel',
]);
```

### 4. Frontend subscribes

```js
const channels = ['my-channel', /* ... */];
const es = new EventSource(`/api/realtime?channels=${channels.join(',')}&token=...`);
```

---

## Performance notes

- Events are lightweight (channel name + event name + optional data with entity ID)
- EventEmitter is synchronous and non-blocking
- SSE connections hold open HTTP connections (one per tab)
- Heartbeat sends a comment line every 30s to keep the connection alive
- Disconnected clients are garbage collected within 60s

## Testing

```bash
# Test SSE connection with curl
curl -N -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/realtime?channels=dashboard"

# After connecting, trigger an event (e.g., create an expense) and watch for SSE output
```
