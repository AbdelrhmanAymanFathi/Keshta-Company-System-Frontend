<template>
  <teleport to="body">
    <transition name="gs-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[2000] flex items-start justify-center bg-slate-900/50 p-4 pt-[8vh] backdrop-blur-sm sm:pt-[12vh]"
        :dir="isRTL ? 'rtl' : 'ltr'"
        @mousedown.self="close"
      >
        <section class="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <!-- Search input -->
          <div class="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <MagnifyingGlassIcon class="h-5 w-5 shrink-0 text-slate-400" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              :placeholder="t('globalSearch.placeholder')"
              autocomplete="off"
              spellcheck="false"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="activateActive"
              @keydown.esc.prevent="close"
            />
            <span v-if="loading" class="shrink-0 text-xs text-slate-400">{{ t('globalSearch.searching') }}</span>
            <button
              v-else
              type="button"
              class="shrink-0 rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:bg-slate-50"
              @click="close"
            >Esc</button>
          </div>

          <!-- Results -->
          <div class="min-h-[80px] flex-1 overflow-y-auto overscroll-contain">
            <div v-if="query.trim().length < 2" class="px-4 py-10 text-center text-sm text-slate-400">
              {{ t('globalSearch.hintStart') }}
            </div>

            <div v-else-if="!loading && groups.length === 0" class="px-4 py-10 text-center text-sm text-slate-400">
              {{ t('globalSearch.noResults', { query }) }}
            </div>

            <div v-else class="py-2">
              <template v-for="group in groups" :key="group.type">
                <div class="flex items-center justify-between px-4 pb-1 pt-3">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {{ groupLabel(group.type) }}
                  </span>
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    {{ t('globalSearch.foundCount', { count: group.count }) }}
                  </span>
                </div>
                <button
                  v-for="hit in group.items"
                  :key="`${group.type}-${hit.id}`"
                  type="button"
                  class="flex w-full items-center gap-3 px-4 py-2.5 text-start transition"
                  :class="isActive(group.type, hit.id) ? 'bg-slate-100' : 'hover:bg-slate-50'"
                  :data-gs-active="isActive(group.type, hit.id) ? 'true' : 'false'"
                  @mousemove="setActive(group.type, hit.id)"
                  @click="openResult(group.type, hit)"
                >
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
                    <component :is="groupIcon(group.type)" class="h-4 w-4" />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-medium text-slate-800">{{ hit.title }}</span>
                    <span v-if="hit.subtitle" class="block truncate text-xs text-slate-400">{{ hit.subtitle }}</span>
                  </span>
                  <ArrowUpRightIcon class="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </template>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-400">
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-1"><kbd class="rounded border border-slate-300 bg-white px-1.5">↑</kbd><kbd class="rounded border border-slate-300 bg-white px-1.5">↓</kbd> {{ t('globalSearch.navigate') }}</span>
              <span class="flex items-center gap-1"><kbd class="rounded border border-slate-300 bg-white px-1.5">↵</kbd> {{ t('globalSearch.open') }}</span>
            </span>
            <span>{{ t('globalSearch.shortcutHint') }}</span>
          </div>
        </section>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon,
  ArrowUpRightIcon,
  BuildingOffice2Icon,
  TruckIcon,
  UserCircleIcon,
  CubeIcon,
  Cog6ToothIcon,
  MapPinIcon,
  UsersIcon,
  ArchiveBoxArrowDownIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'
import { globalSearch } from '@/api'
import { isAuthenticated } from '@/composables/authStore'

const { t, locale } = useI18n()
const router = useRouter()

const isOpen = ref(false)
const query = ref('')
const results = ref([])
const loading = ref(false)
const activeType = ref(null)
const activeId = ref(null)
const inputRef = ref(null)

let debounceTimer = null
let requestToken = 0

const isRTL = computed(() => locale.value === 'ar')
const groups = computed(() => (Array.isArray(results.value) ? results.value : []))

const flatHits = computed(() => {
  const out = []
  for (const g of groups.value) {
    for (const hit of g.items || []) out.push({ type: g.type, id: hit.id })
  }
  return out
})

function groupLabel(type) {
  const map = {
    contractor: 'contractors.title',
    vehicle: 'vehicles.title',
    driver: 'dashboard.driversList',
    item: 'dashboard.items',
    crusher: 'crushers.title',
    location: 'locations.title',
    user: 'users.title',
    supply: 'dashboard.suppliesList',
    transport: 'dashboard.transportList',
    extract: 'extracts.title',
    expense: 'expenses.title',
    equipment: 'equipment.title',
    equipmentLog: 'dashboard.equipmentLog',
    treasury: 'dashboard.treasury',
    payment: 'payments.listTitle'
  }
  return map[type] ? t(map[type]) : type
}

function groupIcon(type) {
  const map = {
    contractor: BuildingOffice2Icon,
    vehicle: TruckIcon,
    driver: UserCircleIcon,
    item: CubeIcon,
    crusher: Cog6ToothIcon,
    location: MapPinIcon,
    user: UsersIcon,
    supply: ArchiveBoxArrowDownIcon,
    transport: ArrowsRightLeftIcon,
    extract: DocumentTextIcon,
    expense: BanknotesIcon,
    equipment: WrenchScrewdriverIcon,
    equipmentLog: ClipboardDocumentListIcon,
    treasury: BanknotesIcon,
    payment: CreditCardIcon
  }
  return map[type] || MagnifyingGlassIcon
}

function isActive(type, id) {
  return activeType.value === type && activeId.value === id
}

function setActive(type, id) {
  activeType.value = type
  activeId.value = id
}

function move(delta) {
  const list = flatHits.value
  if (!list.length) return
  const current = list.findIndex((item) => item.type === activeType.value && item.id === activeId.value)
  const next = current === -1 ? (delta > 0 ? 0 : list.length - 1) : (current + delta + list.length) % list.length
  const target = list[next]
  setActive(target.type, target.id)
  nextTick(() => {
    const el = document.querySelector(`[data-gs-active="true"]`)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function targetRoute(type, hit) {
  const term = query.value.trim()
  switch (type) {
    case 'contractor':
      return { name: 'contractor-detail', params: { id: hit.id } }
    case 'vehicle':
      return { name: 'vehicles-list', query: { q: term } }
    case 'driver':
      return { name: 'equipment-drivers-list', query: { q: term } }
    case 'item':
      return { name: 'supplies-items-list', query: { q: term } }
    case 'crusher':
      return { name: 'crushers-list', query: { q: term } }
    case 'location':
      return { name: 'locations', query: { q: term } }
    case 'user':
      return { name: 'users-list', query: { q: term } }
    case 'supply':
      return { name: 'supplies-list', query: { focus: String(hit.id) } }
    case 'transport':
      return { name: 'transport-list', query: { focus: String(hit.id) } }
    case 'extract':
      return { name: 'extracts-detail', params: { id: hit.id } }
    case 'expense':
      return { name: 'expenses-list', query: { focus: String(hit.id) } }
    case 'equipment':
      return { name: 'equipment-list', query: { q: term } }
    case 'equipmentLog':
      return { name: 'equipment-log-list', query: { focus: String(hit.id) } }
    case 'treasury':
      return { name: 'treasury', query: { treasury: String(hit.id) } }
    case 'payment':
      return { name: 'payments', query: { focus: String(hit.id) } }
    default:
      return null
  }
}

function openResult(type, hit) {
  const target = targetRoute(type, hit)
  close()
  if (target) router.push(target).catch(() => {})
}

function activateActive() {
  const list = flatHits.value
  if (!list.length) return
  const current = list.find((item) => item.type === activeType.value && item.id === activeId.value) || list[0]
  const group = groups.value.find((g) => g.type === current.type)
  const hit = group?.items?.find((item) => item.id === current.id)
  if (hit) openResult(current.type, hit)
}

function open() {
  isOpen.value = true
  nextTick(() => inputRef.value?.focus())
}

function close() {
  isOpen.value = false
  query.value = ''
  results.value = []
  activeType.value = null
  activeId.value = null
  if (debounceTimer) clearTimeout(debounceTimer)
}

function toggle() {
  isOpen.value ? close() : open()
}

function handleGlobalKeydown(event) {
  const isH = event.key === 'h' || event.key === 'H' || event.code === 'KeyH'
  if (isH && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
    if (!isAuthenticated.value) return
    event.preventDefault()
    toggle()
  }
}

async function runSearch(term) {
  const token = ++requestToken
  loading.value = true
  try {
    const { data } = await globalSearch(term, { limit: 5 })
    if (token !== requestToken) return
    results.value = data?.groups || []
    const first = flatHits.value[0]
    if (first) setActive(first.type, first.id)
  } catch (error) {
    if (token === requestToken) results.value = []
  } finally {
    if (token === requestToken) loading.value = false
  }
}

watch(query, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  const term = String(value || '').trim()
  if (term.length < 2) {
    results.value = []
    loading.value = false
    return
  }
  debounceTimer = setTimeout(() => runSearch(term), 250)
})

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.gs-modal-enter-active,
.gs-modal-leave-active {
  transition: opacity 0.15s ease;
}
.gs-modal-enter-active section,
.gs-modal-leave-active section {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.gs-modal-enter-from,
.gs-modal-leave-to {
  opacity: 0;
}
.gs-modal-enter-from section,
.gs-modal-leave-to section {
  transform: translateY(-12px) scale(0.98);
  opacity: 0;
}
</style>
