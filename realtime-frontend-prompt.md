# Realtime Frontend Implementation Prompt

> Based on: `docs/realtime-sse.md` (SSE Backend Implementation)

---

## Prerequisites

The backend SSE system is fully implemented and deployed:

- `GET /api/realtime` accepts JWT via `Authorization: Bearer` header or `?token=` query param
- `?channels=` query param accepts comma-separated channel list
- Heartbeat every 30s (`:` comment lines)
- Server sends `event: message\ndata: {...}\n\n` for each event
- Server sends `event: connected\ndata: {clientId, channels}\n\n` on initial connect
- Server sends `event: error\ndata: {code}\n\n` on connection error

---

## Architecture

```
Frontend (Vue.js)
    │
    ├── RealtimeService (singleton)
    │     └── EventSource connection
    │           ├── heartbeat handling
    │           ├── auto reconnect
    │           └── channel subscription
    │
    ├── useRealtime (composable)
    │     └── per-component channel/event management
    │           ├── onMounted → subscribe
    │           ├── onUnmounted → unsubscribe
    │           └── event → dispatch → store action
    │
    └── Pinia Stores
          └── existing store actions
                └── call existing API services
                      └── update reactive state
                            └── UI re-renders
```

---

## 1. RealtimeService (`services/realtimeService.ts`)

### Responsibilities

- Open exactly one SSE connection
- Authenticate via JWT access token
- Auto-reconnect on connection loss
- Manage channel subscriptions (subscribe / unsubscribe)
- Parse incoming SSE events
- Emit Vue events for components to consume
- Prevent duplicate subscriptions
- Clean up on logout

### Implementation

```typescript
// services/realtimeService.ts
import { reactive, ref, shallowRef, type App } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

type RealtimeEventCallback = (event: string, data?: Record<string, unknown>) => void;

interface Subscription {
  channels: Set<string>;
  events: Map<string, Set<RealtimeEventCallback>>;
}

interface RealtimeEvent {
  channel: string;
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class RealtimeService {
  private es: EventSource | null = null;
  private subscriptions = new Map<string, Subscription>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private maxReconnectAttempts = 20;
  private reconnectAttempt = 0;
  private reconnectDelay = 1000;
  private baseUrl = '';
  private isConnecting = false;
  private destroyHandlers: (() => void)[] = [];

  readonly isConnected = ref(false);
  readonly connectionError = ref<string | null>(null);
  readonly clientId = ref<string | null>(null);
  readonly subscribedChannels = ref<string[]>([]);

  private getToken: (() => string | null) | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  init(getToken: () => string | null) {
    this.getToken = getToken;
    this.connect();
  }

  private get authToken(): string | null {
    return this.getToken ? this.getToken() : null;
  }

  private buildUrl(): string {
    const token = this.authToken;
    if (!token) return '';
    const activeChannels = Array.from(this.subscriptions.keys());
    const channels = activeChannels.join(',');
    return `${this.baseUrl}/api/realtime?token=${encodeURIComponent(token)}${channels ? `&channels=${encodeURIComponent(channels)}` : ''}`;
  }

  connect() {
    if (this.es || this.isConnecting) return;
    const url = this.buildUrl();
    if (!url) return;

    this.isConnecting = true;
    this.connectionError.value = null;

    this.es = new EventSource(url);

    this.es.addEventListener('connected', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.clientId.value = data.clientId;
        this.subscribedChannels.value = data.channels;
      } catch { /* ignore */ }
      this.isConnected.value = true;
      this.isConnecting = false;
      this.reconnectAttempt = 0;
      this.reconnectDelay = 1000;
      this.connectionError.value = null;
    });

    this.es.addEventListener('message', (event: MessageEvent) => {
      try {
        const payload: RealtimeEvent = JSON.parse(event.data);
        this.dispatch(payload.channel, payload.event, payload.data);
      } catch { /* ignore malformed messages */ }
    });

    this.es.addEventListener('error', (event: MessageEvent) => {
      this.isConnected.value = false;
      this.clientId.value = null;
      this.isConnecting = false;

      if (event.data) {
        try {
          const errData = JSON.parse(event.data);
          if (errData.code === 'maximum_connections_reached') {
            this.connectionError.value = 'maximum_connections_reached';
            this.destroy();
            return;
          }
          if (errData.code === 'maximum_user_connections_reached') {
            this.connectionError.value = 'maximum_user_connections_reached';
            this.destroy();
            return;
          }
        } catch { /* ignore */ }
      }

      this.scheduleReconnect();
    });

    this.es.onerror = () => {
      this.isConnected.value = false;
      this.clientId.value = null;
      this.isConnecting = false;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempt >= this.maxReconnectAttempts) {
      this.connectionError.value = 'max_reconnect_attempts_reached';
      this.destroy();
      return;
    }

    this.reconnectAttempt++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempt, 30000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.close();
      this.connect();
    }, delay);
  }

  private close() {
    if (this.es) {
      try { this.es.close(); } catch { /* ignore */ }
      this.es = null;
    }
    this.isConnected.value = false;
    this.clientId.value = null;
    this.isConnecting = false;
  }

  destroy() {
    this.close();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.subscriptions.clear();
    this.subscribedChannels.value = [];
    this.connectionError.value = null;
    this.getToken = null;
  }

  /**
   * Subscribe to a channel and listen for specific events.
   * Returns an unsubscribe function.
   */
  subscribe(
    channel: string,
    events: string[],
    callback: RealtimeEventCallback,
  ): () => void {
    let sub = this.subscriptions.get(channel);
    if (!sub) {
      sub = { channels: new Set(), events: new Map() };
      this.subscriptions.set(channel, sub);
    }

    for (const event of events) {
      let cbs = sub.events.get(event);
      if (!cbs) {
        cbs = new Set();
        sub.events.set(event, cbs);
      }
      cbs.add(callback);
    }

    this.reconnectWithNewChannels();

    return () => {
      for (const event of events) {
        const cbs = sub?.events.get(event);
        if (cbs) {
          cbs.delete(callback);
          if (cbs.size === 0) sub?.events.delete(event);
        }
      }
      if (sub && sub.events.size === 0) {
        this.subscriptions.delete(channel);
      }
      this.reconnectWithNewChannels();
    };
  }

  private reconnectWithNewChannels() {
    if (!this.isConnected.value) return;
    this.close();
    this.connect();
  }

  private dispatch(channel: string, event: string, data?: Record<string, unknown>) {
    this.subscribedChannels.value = Array.from(this.subscriptions.keys());

    const sub = this.subscriptions.get(channel);
    if (!sub) return;

    const wildcardCbs = sub.events.get('*');
    if (wildcardCbs) {
      for (const cb of wildcardCbs) {
        try { cb(event, data); } catch { /* handler error */ }
      }
    }

    const eventCbs = sub.events.get(event);
    if (eventCbs) {
      for (const cb of eventCbs) {
        try { cb(event, data); } catch { /* handler error */ }
      }
    }
  }

  hasSubscribers(channel: string): boolean {
    return this.subscriptions.has(channel);
  }

  getActiveChannels(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

export const realtimeService = new RealtimeService();
```

```typescript
// main.ts — initialize the realtime service after auth
import { realtimeService } from '@/services/realtimeService';
import { useAuthStore } from '@/stores/authStore';

const app = createApp(App);
// ... other setup

// After auth is initialized
const authStore = useAuthStore();
realtimeService.init(() => authStore.accessToken);

// On logout
watch(() => authStore.isAuthenticated, (val) => {
  if (!val) realtimeService.destroy();
});
```

---

## 2. Composable: `useRealtime` (`composables/useRealtime.ts`)

Simplifies per-component channel subscriptions with automatic lifecycle cleanup.

```typescript
// composables/useRealtime.ts
import { onMounted, onUnmounted, type ComputedRef } from 'vue';
import { realtimeService } from '@/services/realtimeService';

type RealtimeCallback = (event: string, data?: Record<string, unknown>) => void;

interface UseRealtimeOptions {
  channel: string | ComputedRef<string>;
  events: string[] | ComputedRef<string[]>;
  handler: RealtimeCallback;
  enabled?: boolean | ComputedRef<boolean>;
}

export function useRealtime(options: UseRealtimeOptions) {
  let unsub: (() => void) | null = null;

  function doSubscribe() {
    if (unsub) return;
    const enabled = typeof options.enabled === 'boolean' ? options.enabled : true;
    if (!enabled) return;

    const channel = typeof options.channel === 'string' ? options.channel : options.channel.value;
    const events = typeof options.events === 'object' && Array.isArray(options.events)
      ? options.events
      : (options.events as ComputedRef<string[]>).value;

    unsub = realtimeService.subscribe(channel, events, options.handler);
  }

  function doUnsubscribe() {
    if (unsub) {
      unsub();
      unsub = null;
    }
  }

  onMounted(() => doSubscribe());
  onUnmounted(() => doUnsubscribe());

  return {
    subscribe: doSubscribe,
    unsubscribe: doUnsubscribe,
  };
}
```

---

## 3. Composable: `useRealtimeDashboard` (`composables/useRealtimeDashboard.ts`)

Convenience composable for dashboard pages that need to refresh statistics.

```typescript
// composables/useRealtimeDashboard.ts
import { useRealtime } from './useRealtime';
import { useDashboardStore } from '@/stores/dashboardStore';

export function useRealtimeDashboard() {
  const store = useDashboardStore();

  useRealtime({
    channel: 'dashboard',
    events: ['statistics_updated'],
    handler: () => {
      store.fetchSummary();
    },
  });

  return {};
}
```

---

## 4. Page Integration Reference

### 4.1 Dashboard Summary Page

**File:** `pages/dashboard/index.vue` (or wherever the main dashboard lives)

| Field | Value |
|---|---|
| Channel | `dashboard` |
| Events | `statistics_updated` |
| API to call | `dashboardStore.fetchSummary()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useDashboardStore } from '@/stores/dashboardStore';

const store = useDashboardStore();

useRealtime({
  channel: 'dashboard',
  events: ['statistics_updated'],
  handler: () => {
    store.fetchSummary();
  },
});
</script>
```

### 4.2 Dashboard Cards (Expenses/Payments/Supplies widgets)

**File:** `pages/dashboard/index.vue` — same as above, use the dashboard channel.
The `statistics_updated` event triggers `store.fetchSummary()` which refreshes all cards.

If individual cards need separate refresh:

| Module | Channel | Events | API to call |
|---|---|---|---|
| Expenses Card | `dashboard` | `statistics_updated` | `dashboardStore.fetchSummary()` |
| Payments Card | `dashboard` | `statistics_updated` | `dashboardStore.fetchSummary()` |
| Treasury Card | `dashboard` | `statistics_updated` | `dashboardStore.fetchSummary()` |

No separate subscriptions needed — one `statistics_updated` listener refreshes the entire summary.

### 4.3 Treasury Page

**File:** `pages/treasury/index.vue`

| Field | Value |
|---|---|
| Channels | `treasury` |
| Events | `treasury_balance_changed`, `treasury_transaction_created` |
| API to call | `treasuryStore.fetchTreasuries()`, `treasuryStore.fetchTransactions()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useTreasuryStore } from '@/stores/treasuryStore';

const store = useTreasuryStore();

useRealtime({
  channel: 'treasury',
  events: ['treasury_balance_changed', 'treasury_transaction_created'],
  handler: (event) => {
    if (event === 'treasury_balance_changed') {
      store.fetchTreasuries();
    }
    if (event === 'treasury_transaction_created') {
      store.fetchTransactions();
    }
  },
});
</script>
```

### 4.4 Expenses Page

**File:** `pages/expenses/index.vue`

| Field | Value |
|---|---|
| Channel | `expenses` |
| Events | `expense_created`, `expense_updated`, `expense_deleted` |
| API to call | `expenseStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useExpenseStore } from '@/stores/expenseStore';

const store = useExpenseStore();

useRealtime({
  channel: 'expenses',
  events: ['expense_created', 'expense_updated', 'expense_deleted'],
  handler: () => {
    store.fetchList();
  },
});
</script>
```

### 4.5 Payments Page

**File:** `pages/payments/index.vue`

| Field | Value |
|---|---|
| Channel | `payments` |
| Events | `payment_created`, `payment_deleted` |
| API to call | `paymentStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { usePaymentStore } from '@/stores/paymentStore';

const store = usePaymentStore();

useRealtime({
  channel: 'payments',
  events: ['payment_created', 'payment_deleted'],
  handler: () => {
    store.fetchList();
  },
});
</script>
```

### 4.6 Supplies Page

**File:** `pages/supplies/index.vue`

| Field | Value |
|---|---|
| Channel | `supplies` |
| Events | `supply_created`, `supply_updated`, `supply_deleted` |
| API to call | `supplyStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useSupplyStore } from '@/stores/supplyStore';

const store = useSupplyStore();

useRealtime({
  channel: 'supplies',
  events: ['supply_created', 'supply_updated', 'supply_deleted'],
  handler: () => {
    store.fetchList();
  },
});
</script>
```

### 4.7 Transport Page

**File:** `pages/transport/index.vue`

| Field | Value |
|---|---|
| Channel | `transport` |
| Events | `transport_created`, `transport_updated`, `transport_deleted` |
| API to call | `transportStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useTransportStore } from '@/stores/transportStore';

const store = useTransportStore();

useRealtime({
  channel: 'transport',
  events: ['transport_created', 'transport_updated', 'transport_deleted'],
  handler: () => {
    store.fetchList();
  },
});
</script>
```

### 4.8 Equipment Log Page

**File:** `pages/equipment-log/index.vue`

| Field | Value |
|---|---|
| Channel | `equipment-log` |
| Events | `equipment_created`, `equipment_updated`, `equipment_deleted` |
| API to call | `equipmentLogStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useEquipmentLogStore } from '@/stores/equipmentLogStore';

const store = useEquipmentLogStore();

useRealtime({
  channel: 'equipment-log',
  events: ['equipment_created', 'equipment_updated', 'equipment_deleted'],
  handler: () => {
    store.fetchList();
  },
});
</script>
```

### 4.9 Extracts Page

**File:** `pages/extracts/index.vue`

| Field | Value |
|---|---|
| Channel | `extracts` |
| Events | `extract_created`, `extract_updated`, `extract_deleted` |
| API to call | `extractStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useExtractStore } from '@/stores/extractStore';

const store = useExtractStore();

useRealtime({
  channel: 'extracts',
  events: ['extract_created', 'extract_updated', 'extract_deleted'],
  handler: () => {
    store.fetchList();
  },
});
</script>
```

### 4.10 Approvals Page

**File:** `pages/approvals/index.vue`

| Field | Value |
|---|---|
| Channel | `approvals` |
| Events | `approval_created`, `approval_completed`, `approval_rejected` |
| API to call | `approvalStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useApprovalStore } from '@/stores/approvalStore';

const store = useApprovalStore();

useRealtime({
  channel: 'approvals',
  events: ['approval_created', 'approval_completed', 'approval_rejected'],
  handler: (event, data) => {
    store.fetchList();
    if (event === 'approval_completed' || event === 'approval_created') {
      // Refresh dashboard summary when approvals change
      const { useDashboardStore } = await import('@/stores/dashboardStore');
      useDashboardStore().fetchSummary();
    }
  },
});
</script>
```

### 4.11 Notifications

**File:** `components/notifications/NotificationBell.vue` (or wherever notifications are rendered)

| Field | Value |
|---|---|
| Channel | `notifications` |
| Events | `notification_created` |
| API to call | `notificationStore.fetchUnreadCount()`, `notificationStore.fetchList()` |
| Subscribe | `onMounted` |
| Unsubscribe | `onUnmounted` |

```vue
<script setup lang="ts">
import { useRealtime } from '@/composables/useRealtime';
import { useNotificationStore } from '@/stores/notificationStore';

const store = useNotificationStore();

useRealtime({
  channel: 'notifications',
  events: ['notification_created'],
  handler: () => {
    store.fetchUnreadCount();
  },
});
</script>
```

---

## 5. Global Connection Status (Optional)

Add a small indicator component to show SSE connection status.

```vue
<!-- components/RealtimeStatus.vue -->
<template>
  <div v-if="!service.isConnected.value" class="realtime-status disconnected">
    <span class="dot" /> Reconnecting...
  </div>
</template>

<script setup lang="ts">
import { realtimeService } from '@/services/realtimeService';
</script>

<style scoped>
.realtime-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.realtime-status.disconnected {
  background: #fff3cd;
  color: #856404;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffc107;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
```

---

## 6. Folder Structure

```
src/
├── services/
│   └── realtimeService.ts          [CREATE] — Singleton SSE client
│
├── composables/
│   ├── useRealtime.ts              [CREATE] — Generic realtime composable
│   └── useRealtimeDashboard.ts     [CREATE] — Dashboard-specific composable
│
├── components/
│   └── RealtimeStatus.vue          [CREATE, optional] — Connection indicator
│
├── stores/
│   (no new stores — existing stores are reused)
│
├── pages/
│   ├── dashboard/index.vue         [MODIFY] — add useRealtime
│   ├── treasury/index.vue          [MODIFY] — add useRealtime
│   ├── expenses/index.vue          [MODIFY] — add useRealtime
│   ├── payments/index.vue          [MODIFY] — add useRealtime
│   ├── supplies/index.vue          [MODIFY] — add useRealtime
│   ├── transport/index.vue         [MODIFY] — add useRealtime
│   ├── equipment-log/index.vue     [MODIFY] — add useRealtime
│   ├── extracts/index.vue          [MODIFY] — add useRealtime
│   └── approvals/index.vue         [MODIFY] — add useRealtime
│
└── main.ts                         [MODIFY] — initialize realtimeService after auth
```

---

## 7. Files to Create

| # | File | Purpose |
|---|---|---|
| 1 | `src/services/realtimeService.ts` | Singleton SSE client, auth, reconnect, channel management |
| 2 | `src/composables/useRealtime.ts` | Generic composable for per-component subscriptions |
| 3 | `src/composables/useRealtimeDashboard.ts` | Dashboard convenience composable |
| 4 | `src/components/RealtimeStatus.vue` | Optional connection status indicator |

## 8. Files to Modify

| # | File | Change |
|---|---|---|
| 1 | `src/main.ts` | Import `realtimeService`, call `init()` after auth is ready, `destroy()` on logout |
| 2 | `src/pages/dashboard/index.vue` | Add `useRealtime({ channel: 'dashboard', ... })` |
| 3 | `src/pages/treasury/index.vue` | Add `useRealtime({ channel: 'treasury', ... })` |
| 4 | `src/pages/expenses/index.vue` | Add `useRealtime({ channel: 'expenses', ... })` |
| 5 | `src/pages/payments/index.vue` | Add `useRealtime({ channel: 'payments', ... })` |
| 6 | `src/pages/supplies/index.vue` | Add `useRealtime({ channel: 'supplies', ... })` |
| 7 | `src/pages/transport/index.vue` | Add `useRealtime({ channel: 'transport', ... })` |
| 8 | `src/pages/equipment-log/index.vue` | Add `useRealtime({ channel: 'equipment-log', ... })` |
| 9 | `src/pages/extracts/index.vue` | Add `useRealtime({ channel: 'extracts', ... })` |
| 10 | `src/pages/approvals/index.vue` | Add `useRealtime({ channel: 'approvals', ... })` |
| 11 | (Notification component) | Add `useRealtime({ channel: 'notifications', ... })` |

---

## 9. Implementation Order

| Step | What | Files |
|---|---|---|
| 1 | Create `RealtimeService` singleton | `services/realtimeService.ts` |
| 2 | Initialize in `main.ts` | `main.ts` |
| 3 | Create `useRealtime` composable | `composables/useRealtime.ts` |
| 4 | Create `useRealtimeDashboard` composable | `composables/useRealtimeDashboard.ts` |
| 5 | Integrate Dashboard page | `pages/dashboard/index.vue` |
| 6 | Integrate Treasury page | `pages/treasury/index.vue` |
| 7 | Integrate Expenses page | `pages/expenses/index.vue` |
| 8 | Integrate Payments page | `pages/payments/index.vue` |
| 9 | Integrate Supplies page | `pages/supplies/index.vue` |
| 10 | Integrate Transport page | `pages/transport/index.vue` |
| 11 | Integrate Equipment Log page | `pages/equipment-log/index.vue` |
| 12 | Integrate Extracts page | `pages/extracts/index.vue` |
| 13 | Integrate Approvals page | `pages/approvals/index.vue` |
| 14 | Integrate Notifications component | Notification component |
| 15 | (Optional) Create status indicator | `components/RealtimeStatus.vue` |
| 16 | Test all modules | End-to-end testing |

---

## 10. Testing Checklist

- [ ] SSE connects on app load (after auth)
- [ ] `connected` event received with `clientId` and `channels`
- [ ] Heartbeat received every 30s without errors
- [ ] Creating an expense triggers `expense_created` event
- [ ] Dashboard refreshes automatically after an expense is created
- [ ] Treasury balance refreshes after a payment is created
- [ ] Approvals page refreshes after approval is created/completed/rejected
- [ ] Notification bell updates after new approval
- [ ] Disconnecting backend stops SSE (server restart)
- [ ] Frontend reconnects automatically within 30s
- [ ] Leaving a page stops channel subscription (no unnecessary events)
- [ ] Navigating back re-subscribes to the channel
- [ ] Logging out destroys SSE connection
- [ ] Logging back in creates new SSE connection
- [ ] Multiple tabs open — each has its own SSE connection
- [ ] No memory leaks after rapid page navigation
- [ ] No duplicate API calls when multiple events arrive at once

---

## 11. Performance Considerations

1. **Single connection**: One `EventSource` per tab, regardless of how many channels are subscribed. The server handles channel filtering.

2. **Debounce rapid events**: If multiple events arrive in quick succession (e.g., bulk operations), debounce the API call:

```typescript
import { debounce } from 'lodash';

const refreshList = debounce(() => {
  store.fetchList();
}, 500);

useRealtime({
  channel: 'expenses',
  events: ['expense_created', 'expense_updated', 'expense_deleted'],
  handler: () => refreshList(),
});
```

3. **No duplicate subscriptions**: The `RealtimeService.subscribe()` method uses `Set` to prevent duplicate callbacks on the same `(channel, event)` tuple.

4. **Cleanup on unmount**: The `useRealtime` composable calls `unsubscribe()` in `onUnmounted`, which removes callbacks from the `Set` and reconnects SSE without that channel.

5. **Memory**: If the user visits many pages, old channels accumulate in the subscriptions map. The reconnect mechanism only includes channels with active subscribers, so this is self-cleaning.

---

## 12. Common Pitfalls to Avoid

### ❌ Polling still active
Remove any existing `setInterval` polling after SSE is implemented, otherwise the API will receive duplicate requests.

### ❌ Calling full data API on every event
Example: `expense_created` → call `GET /api/expenses?page=1&pageSize=10` is fine. Calling `GET /api/expenses/123` to get the single item is unnecessary unless the detail view is open.

### ❌ Events before store hydration
Ensure the Pinia store is initialized before the SSE event triggers an API call. Use optional chaining: `store.fetchList?.()` or check `store.$state`.

### ❌ Memory leaks from closures
Always use `onUnmounted` cleanup. The `useRealtime` composable handles this automatically, but if manually calling `realtimeService.subscribe()`, store the returned unsubscribe function and call it.

### ❌ Connection limit exceeded
The backend limits: 500 total, 10 per user. If testing with multiple tabs, close unused tabs. The `connectionError` ref will report `maximum_user_connections_reached` if this occurs.

### ❌ Token expiration
Access tokens expire (default: 15m). When the token expires, the SSE connection will fail. The component should listen for `onerror` and reconnect with a fresh token. The `RealtimeService` uses `getToken` callback, so it always has the latest token on reconnect.

### ❌ Reconnect storm
If the backend is down, the exponential backoff (`1s, 2s, 3s, ..., max 30s`) prevents a reconnect storm. Max 20 attempts before giving up.

### ❌ SSR / build-time errors
`EventSource` is a browser API. Ensure the `RealtimeService` is only instantiated on the client side (`if (typeof window !== 'undefined')`). In Nuxt, use `client-only` or check `process.client`.

---

## 13. Backend Event Reference

For reference, here is the complete list of events emitted by the backend:

| Channel | Event | Triggered By |
|---|---|---|
| `dashboard` | `statistics_updated` | Derived (any module change) |
| `treasury` | `treasury_balance_changed` | Treasury create/update/archive/restore, transfer, derived from expenses/payments/extracts/wallet |
| `treasury` | `treasury_transaction_created` | Manual treasury transaction |
| `expenses` | `expense_created` | Expense created |
| `expenses` | `expense_updated` | Expense updated |
| `expenses` | `expense_deleted` | Expense deleted |
| `payments` | `payment_created` | Payment created |
| `payments` | `payment_deleted` | Payment deleted |
| `supplies` | `supply_created` | Supply created |
| `supplies` | `supply_updated` | Supply updated/restored |
| `supplies` | `supply_deleted` | Supply soft-deleted |
| `transport` | `transport_created` | Transport created |
| `transport` | `transport_updated` | Transport updated/restored |
| `transport` | `transport_deleted` | Transport soft-deleted |
| `equipment-log` | `equipment_created` | Equipment log created |
| `equipment-log` | `equipment_updated` | Equipment log updated |
| `equipment-log` | `equipment_deleted` | Equipment log soft-deleted |
| `extracts` | `extract_created` | Extract created |
| `extracts` | `extract_updated` | Extract updated |
| `extracts` | `extract_deleted` | Extract deleted |
| `approvals` | `approval_created` | New approval request |
| `approvals` | `approval_completed` | Approval approved |
| `approvals` | `approval_rejected` | Approval rejected |
| `notifications` | `notification_created` | Derived (approval events) |
| `rentals` | `rental_created` | Rental created |
| `rentals` | `rental_updated` | Rental updated/payout/job change |
| `petroleum-supply` | `supply_created` | Petroleum supply created |
| `petroleum-supply` | `supply_updated` | Petroleum supply updated/restored |
| `petroleum-supply` | `supply_deleted` | Petroleum supply soft-deleted |
| `wallet` | `wallet_transfer_completed` | Company↔branch transfer |

---

*End of frontend implementation prompt.*

*Backend SSE reference: `docs/realtime-sse.md`*
