<template>
  <div class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">

    <PageHeader :title="title" />

    <div v-if="store.error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
      <span class="text-rose-500 text-xl shrink-0">⚠️</span>
      <span class="text-rose-800 font-medium">{{ store.error }}</span>
    </div>

    <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">

      <div class="border-b border-slate-200 px-4 py-4 sm:px-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <select v-model="filterType" @change="onFilterChange"
              class="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none theme-input-focus">
              <option value="">كل الأنواع</option>
              <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <label class="flex items-center gap-2 text-sm theme-text-secondary cursor-pointer select-none">
              <input type="checkbox" v-model="store.filterUnreadOnly" @change="onFilterChange"
                class="rounded border-slate-300 theme-input-focus" />
              غير مقروء فقط
            </label>
          </div>
          <div class="flex items-center gap-2">
            <button @click="store.markAllRead()" :disabled="store.unreadCount === 0"
              class="rounded-xl px-4 py-2 text-sm font-medium border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50">
              تحديد الكل كمقروء
            </button>
            <button @click="onReset"
              class="rounded-xl px-4 py-2 text-sm font-medium border border-slate-300 hover:bg-slate-50 transition-colors">
              إعادة تعيين
            </button>
          </div>
        </div>
      </div>

      <div v-if="store.loading && store.items.length === 0" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
      </div>

      <div v-else-if="store.items.length === 0" class="p-12 text-center">
        <svg class="mx-auto h-16 w-16 theme-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-lg theme-text-secondary font-medium">لا توجد إشعارات</p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="item in store.items" :key="item.id"
          @click="onClick(item)"
          class="flex items-start gap-4 px-4 py-4 sm:px-6 hover:bg-slate-50/50 transition-colors cursor-pointer"
          :class="{ 'bg-blue-50/30': !item.isRead }">

          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold"
            :class="typeColor(item.type)">
            {{ typeAbbr(item.type) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium" :class="item.isRead ? 'theme-text-primary' : 'text-slate-900'">
                {{ item.title }}
              </p>
              <span v-if="!item.isRead"
                class="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
            </div>
            <p v-if="item.message" class="mt-0.5 text-sm theme-text-secondary line-clamp-2">
              {{ item.message }}
            </p>
            <div class="mt-1 flex items-center gap-3 text-xs theme-text-muted">
              <span>{{ formatDate(item.createdAt) }}</span>
              <span :class="['inline-flex rounded-full px-2 py-0.5 text-xs font-medium', typeBadge(item.type)]">
                {{ typeLabel(item.type) }}
              </span>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <button @click.stop="onMarkRead(item)"
              v-if="!item.isRead"
              title="تحديد كمقروء"
              class="rounded-lg p-2 hover:bg-blue-100 text-blue-600 transition-colors">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Pagination
        v-if="store.total > 0"
        :currentPage="store.page"
        :pageSize="store.pageSize"
        :total="store.total"
        :totalPages="store.totalPages"
        @update:page="store.setPage($event)"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { resolveNotificationRoute } from '@/utils/notificationRouting'
import PageHeader from '@/components/shared/PageHeader.vue'
import Pagination from '@/components/shared/Pagination.vue'

export default {
  name: 'NotificationCenter',
  components: { PageHeader, Pagination },
  setup() {
    const store = useNotificationStore()
    const router = useRouter()
    const filterType = ref(store.filterType || '')

    const title = computed(() => {
      const count = store.unreadCount
      return count > 0 ? `الإشعارات (${count} غير مقروء)` : 'الإشعارات'
    })

    const typeOptions = [
      { value: 'expense', label: 'مصروف' },
      { value: 'payment', label: 'دفعة' },
      { value: 'treasury', label: 'خزينة' },
      { value: 'approval', label: 'موافقة' },
      { value: 'supply', label: 'توريدة' },
      { value: 'transport', label: 'نقل' },
      { value: 'equipment', label: 'معدات' },
      { value: 'extract', label: 'مستخلص' },
      { value: 'rental', label: 'تأجير' },
      { value: 'petroleum-supply', label: 'توريدة بترول' },
      { value: 'wallet', label: 'محفظة' },
    ]

    function onFilterChange() {
      store.filterType = filterType.value
      store.page = 1
      store.fetchList()
    }

    function onReset() {
      filterType.value = ''
      store.filterUnreadOnly = false
      store.page = 1
      store.fetchList()
    }

    function onClick(item) {
      const route = resolveNotificationRoute(item)
      if (route) router.push(route)
      if (!item.isRead) {
        store.markRead(item.id)
      }
    }

    function onMarkRead(item) {
      store.markRead(item.id)
    }

    function formatDate(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }

    function typeColor(type) {
      const map = {
        expense: 'bg-orange-500', payment: 'bg-green-500', treasury: 'bg-yellow-600',
        approval: 'bg-purple-500', supply: 'bg-blue-500', transport: 'bg-cyan-500',
        equipment: 'bg-indigo-500', extract: 'bg-pink-500', rental: 'bg-teal-500',
        'petroleum-supply': 'bg-slate-600', wallet: 'bg-emerald-500',
      }
      return map[type] || 'bg-gray-500'
    }

    function typeAbbr(type) {
      const map = {
        expense: 'م', payment: 'د', treasury: 'خ', approval: 'و',
        supply: 'ت', transport: 'ن', equipment: 'ع', extract: 'س',
        rental: 'أ', 'petroleum-supply': 'ب', wallet: 'ح',
      }
      return map[type] || '?'
    }

    function typeBadge(type) {
      const map = {
        expense: 'bg-orange-100 text-orange-700', payment: 'bg-green-100 text-green-700',
        treasury: 'bg-yellow-100 text-yellow-700', approval: 'bg-purple-100 text-purple-700',
        supply: 'bg-blue-100 text-blue-700', transport: 'bg-cyan-100 text-cyan-700',
        equipment: 'bg-indigo-100 text-indigo-700', extract: 'bg-pink-100 text-pink-700',
        rental: 'bg-teal-100 text-teal-700', 'petroleum-supply': 'bg-slate-100 text-slate-700',
        wallet: 'bg-emerald-100 text-emerald-700',
      }
      return map[type] || 'bg-gray-100 text-gray-700'
    }

    function typeLabel(type) {
      const map = {
        expense: 'مصروف', payment: 'دفعة', treasury: 'خزينة', approval: 'موافقة',
        supply: 'توريدة', transport: 'نقل', equipment: 'معدات', extract: 'مستخلص',
        rental: 'تأجير', 'petroleum-supply': 'توريدة بترول', wallet: 'محفظة',
      }
      return map[type] || type
    }

    onMounted(() => {
      store.fetchList()
      store.fetchUnreadCount()
    })

    return {
      store, filterType, typeOptions, title,
      onFilterChange, onReset, onClick, onMarkRead,
      formatDate, typeColor, typeAbbr, typeBadge, typeLabel,
    }
  }
}
</script>
