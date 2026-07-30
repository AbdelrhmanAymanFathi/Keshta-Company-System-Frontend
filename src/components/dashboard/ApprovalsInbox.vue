<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="p-0 sm:p-0.5 md:p-1 lg:p-0 space-y-6">
    <!-- Header -->
    <div class="app-page-header rounded-2xl theme-page-header-bar p-5 shadow-lg shadow-slate-200/50">
      <h1 class="mb-2 text-2xl font-semibold theme-text-primary">{{ t('title') }}</h1>
      <p class="theme-text-secondary">{{ t('subtitle') }}</p>
    </div>

    <!-- Status Tabs / Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="tab in tabs" :key="tab.value"
        @click="activeStatus = tab.value"
        class="cursor-pointer rounded-2xl border border-slate-200/80 theme-card p-5 shadow-lg shadow-slate-200/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        :class="{ 'theme-ring-active theme-border-accent ring-2 ring-offset-1': activeStatus === tab.value }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm theme-text-secondary font-medium">{{ tab.label }}</p>
            <p class="text-3xl font-bold mt-2 theme-accent-strong transition-colors duration-300">
              {{ getCount(tab.value) }}
            </p>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl theme-dashboard-bg-soft transition-all duration-300">
            <svg :class="['w-7 h-7 theme-text-primary transition-colors duration-300', tab.iconClass]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <!-- PENDING: Clock icon -->
              <path v-if="tab.value === 'PENDING'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <!-- APPROVED: Checkmark circle -->
              <path v-else-if="tab.value === 'APPROVED'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <!-- REJECTED: X circle -->
              <path v-else-if="tab.value === 'REJECTED'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9l6 6M15 9l-6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3" :class="isRTL ? 'flex-row-reverse' : ''">
      <span class="text-rose-500 text-xl shrink-0">⚠️</span>
      <span class="text-rose-800 font-medium" :class="isRTL ? 'text-right' : 'text-left'">{{ error }}</span>
    </div>

    <!-- Success Alert -->
    <div v-if="successMsg" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3" :class="isRTL ? 'flex-row-reverse' : ''">
      <span class="text-emerald-500 text-xl shrink-0">✅</span>
      <span class="text-emerald-800 font-medium" :class="isRTL ? 'text-right' : 'text-left'">{{ successMsg }}</span>
    </div>

    <!-- Main List/Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
      <div class="border-b border-slate-200 theme-table-thead-gradient px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-semibold theme-text-primary">
            {{ t('queueTitle') }} ({{ filteredApprovals.length }})
          </h2>
          <p class="text-sm theme-text-secondary">{{ t('queueSubtitle') }}</p>
        </div>
        <button @click="loadApprovals" :disabled="loading"
          class="rounded-xl theme-button px-5 py-2 theme-text-light shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
          <span v-if="loading" class="animate-spin text-sm">⏳</span>
          <span>{{ t('refresh') }}</span>
        </button>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading && approvals.length === 0" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredApprovals.length === 0" class="p-12 text-start">
        <div class="flex justify-center mb-4">
          <svg class="w-16 h-16 theme-text-muted transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Inbox icon (empty) -->
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-lg theme-text-secondary font-medium">{{ t('noItems') }}</p>
        <p class="text-sm theme-text-muted mt-1">{{ t('noItemsDesc') }}</p>
      </div>

      <!-- Approvals Table -->
      <div v-else class="overflow-x-auto">
        <table :dir="isRTL ? 'rtl' : 'ltr'" class="min-w-full divide-y divide-gray-200">
          <thead class="bg-slate-50" :class="isRTL ? 'text-right' : 'text-left'">
            <tr :class="isRTL ? 'text-right' : 'text-left'">
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colId') }}</th>
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colModule') }}</th>
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colAction') }}</th>
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colRequestedBy') }}</th>
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colDetails') }}</th>
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colDate') }}</th>
              <th v-if="activeStatus !== 'PENDING'" class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colResolvedBy') }}</th>
              <th class="px-6 py-4 text-xs font-semibold theme-text-muted uppercase tracking-wider text-start">{{ t('colActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="app in filteredApprovals" :key="app.id" class="hover:bg-slate-50/50 transition-colors cursor-pointer" @dblclick="openDetailModal(app)" @contextmenu.prevent="openRowContextMenu($event, app)">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium theme-text-primary text-start">
                <button @click.stop="openDetailModal(app)" class="text-indigo-600 hover:text-indigo-900 underline font-semibold transition-colors">
                  #{{ app.id }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-start">
                <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="getModuleClass(app.module)">
                  {{ getModuleLabel(app.module) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-start">
                <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="getActionClass(app.action)">
                  {{ getActionLabel(app.action) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-start text-sm theme-text-secondary">
                <div class="font-medium text-slate-800">{{ app.requestedBy?.name || 'User' }}</div>
                <div class="text-xs text-slate-400">{{ app.requestedBy?.email }}</div>
              </td>
              <td class="px-6 py-4 text-sm max-w-md" :dir="isRTL ? 'rtl' : 'ltr'">
                <!-- Change summary display -->
                <div class="space-y-1.5">
                  <div v-if="app.contractor" class="text-xs font-bold text-slate-600 mb-1" :class="isRTL ? 'text-right' : 'text-left'">
                    🏢 {{ t('contractor') }}: {{ app.contractor?.name }}
                  </div>
                  
                  <div class="text-xs text-slate-700 bg-slate-50 rounded-lg p-2.5 space-y-1 font-mono border border-slate-100 max-h-40 overflow-y-auto" :class="isRTL ? 'text-right' : 'text-left'">
                    <!-- Update state diff -->
                    <template v-if="app.action === 'UPDATE'">
                      <div v-for="(newVal, key) in getChangedFields(app)" :key="key" class="flex gap-4 py-0.5" :class="isRTL ? 'flex-row-reverse' : ''">
                        <span class="text-slate-500 font-sans">{{ getFieldLabel(key) }}:</span>
                        <span :class="isRTL ? 'text-left' : 'text-right'">
                          <span class="line-through text-red-500 text-xxs block sm:inline">{{ formatValue(app.beforeState[key], key) }}</span>
                          <span class="mx-1 text-slate-400 hidden sm:inline">➔</span>
                          <span class="text-emerald-600 font-bold block sm:inline">{{ formatValue(newVal, key) }}</span>
                        </span>
                      </div>
                    </template>
                    <!-- Delete state -->
                    <template v-else-if="app.action === 'DELETE'">
                      <div class="text-red-500 font-bold text-start font-sans py-1">
                        🗑️ {{ t('deletionNotice') }}
                      </div>
                      <div class="text-slate-500 text-xxs font-sans mt-1">
                        {{ t('originalValue') }}: <span class="font-bold text-slate-700">{{ formatValue(app.beforeState.total || app.beforeState.amount || app.beforeState.value, 'total') }}</span>
                      </div>
                    </template>
                    <!-- Restore state -->
                    <template v-else-if="app.action === 'RESTORE'">
                      <div class="text-indigo-500 font-bold text-start font-sans py-1">
                        🔄 {{ t('restoreNotice') }}
                      </div>
                      <div class="text-slate-500 text-xxs font-sans mt-1">
                        {{ t('originalValue') }}: <span class="font-bold text-slate-700">{{ formatValue(app.beforeState.total || app.beforeState.amount || app.beforeState.value, 'total') }}</span>
                      </div>
                    </template>
                  </div>

                  <!-- Rejection Notes or general notes -->
                  <div v-if="app.notes" class="text-xs bg-amber-50 text-amber-800 rounded-lg p-2 font-sans border border-amber-100 mt-1" :class="isRTL ? 'text-right' : 'text-left'">
                    <strong>💬 {{ t('notes') }}:</strong> {{ app.notes }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-start text-sm theme-text-secondary">
                {{ formatDateTime(app.createdAt) }}
              </td>
              <td v-if="activeStatus !== 'PENDING'" class="px-6 py-4 whitespace-nowrap text-start text-sm theme-text-secondary">
                <div class="font-medium text-slate-800">{{ app.approvedBy?.name || '-' }}</div>
                <div v-if="app.updatedAt" class="text-xxs text-slate-400">{{ formatDateTime(app.updatedAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-start text-sm font-medium">
                <div v-if="app.status === 'PENDING'" class="flex justify-center items-center gap-2" :class="isRTL ? 'flex-row-reverse' : ''">
                  <button @click="handleApprove(app)" :disabled="submitting"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50">
                    {{ t('btnApprove') }}
                  </button>
                  <button @click="openRejectModal(app)" :disabled="submitting"
                    class="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50">
                    {{ t('btnReject') }}
                  </button>
                </div>
                <div v-else class="text-xs font-bold" :class="app.status === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'">
                  {{ app.status === 'APPROVED' ? t('statusApproved') : t('statusRejected') }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rejection Dialog Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-800">
            {{ t('rejectModalTitle') }}
          </h3>
          <button @click="closeRejectModal" class="text-slate-400 hover:text-slate-600 text-2xl font-light">
            &times;
          </button>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-600" :class="isRTL ? 'text-right' : 'text-left'">
            {{ t('rejectModalPrompt') }}
          </p>
          <div>
            <textarea v-model="rejectNotes" rows="3"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              :placeholder="t('rejectModalPlaceholder')" :dir="isRTL ? 'rtl' : 'ltr'"></textarea>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
          <button @click="closeRejectModal" :disabled="submitting"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            {{ t('btnCancel') }}
          </button>
          <button @click="handleReject" :disabled="submitting"
            class="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50">
            <span v-if="submitting" class="animate-spin mr-1">⏳</span>
            {{ t('btnRejectConfirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Full Details Modal -->
    <div v-if="selectedApprovalForDetail" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto" style="margin-top:0;">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all border border-slate-100 max-h-[90vh] flex flex-col" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-800">
            🔍 {{ locale === 'ar' ? 'تفاصيل طلب الموافقة الكاملة' : 'Full Approval Request Details' }} (#{{ selectedApprovalForDetail.id }})
          </h3>
          <button @click="closeDetailModal" class="text-slate-400 hover:text-slate-600 text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="px-6 py-4 overflow-y-auto space-y-6 flex-grow" :dir="isRTL ? 'rtl' : 'ltr'">
          <!-- Metadata Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <span class="text-xxs uppercase tracking-wider text-slate-400 block font-semibold">{{ t('colModule') }}</span>
              <span class="text-sm font-bold text-slate-700">{{ getModuleLabel(selectedApprovalForDetail.module) }}</span>
            </div>
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <span class="text-xxs uppercase tracking-wider text-slate-400 block font-semibold">{{ t('colAction') }}</span>
              <span class="text-sm font-bold text-slate-700">{{ getActionLabel(selectedApprovalForDetail.action) }}</span>
            </div>
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <span class="text-xxs uppercase tracking-wider text-slate-400 block font-semibold">{{ t('colRequestedBy') }}</span>
              <span class="text-sm font-bold text-slate-700">{{ selectedApprovalForDetail.requestedBy?.name || 'User' }}</span>
            </div>
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <span class="text-xxs uppercase tracking-wider text-slate-400 block font-semibold">{{ t('colDate') }}</span>
              <span class="text-sm font-bold text-slate-700">{{ formatDateTime(selectedApprovalForDetail.createdAt) }}</span>
            </div>
          </div>

          <!-- Comparison Table -->
          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm" :dir="isRTL ? 'rtl' : 'ltr'">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">{{ locale === 'ar' ? 'الحقل' : 'Property' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">{{ locale === 'ar' ? 'الحالة السابقة' : 'Original State' }}</th>
                  <th class="px-4 py-3 text-start text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">{{ locale === 'ar' ? 'الحالة الجديدة' : 'New State' }}</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-100">
                <tr v-for="key in getDetailKeys(selectedApprovalForDetail)" :key="key" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-4 py-2.5 text-sm font-semibold text-slate-600" :class="isRTL ? 'text-right' : 'text-left'">
                    {{ getDetailKeyLabel(key) }}
                  </td>
                  <td class="px-4 py-2.5 text-sm text-slate-700 font-mono" :class="isRTL ? 'text-right' : 'text-left'">
                    {{ getDisplayValue(selectedApprovalForDetail.beforeState[key], key) }}
                  </td>
                  <td class="px-4 py-2.5 text-sm font-mono" :class="isRTL ? 'text-right' : 'text-left'">
                    <template v-if="selectedApprovalForDetail.action === 'UPDATE'">
                      <span v-if="hasFieldChanged(selectedApprovalForDetail, key)" class="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block w-max">
                        {{ getDisplayValue(selectedApprovalForDetail.afterState[key], key) }}
                      </span>
                      <span v-else class="text-slate-400">
                        {{ getDisplayValue(selectedApprovalForDetail.beforeState[key], key) }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="text-slate-400">-</span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3 font-sans">
          <button @click="closeDetailModal" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-all">
            {{ locale === 'ar' ? 'إغلاق' : 'Close' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Row Context Menu -->
    <div v-if="contextMenu.visible" class="fixed inset-0 z-40" @click="contextMenu.visible = false"></div>
    <div
      v-if="contextMenu.visible"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      class="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 min-w-[180px]"
      :dir="isRTL ? 'rtl' : 'ltr'"
      @click.stop
      @contextmenu.prevent
    >
      <button
        v-if="contextMenu.approval?.status === 'PENDING'"
        type="button"
        class="w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors duration-200"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="handleApprove(contextMenu.approval); contextMenu.visible = false"
      >
        <svg class="w-4 h-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ t('btnApprove') }}
      </button>
      <button
        v-if="contextMenu.approval?.status === 'PENDING'"
        type="button"
        class="w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors duration-200"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="openRejectModal(contextMenu.approval); contextMenu.visible = false"
      >
        <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l6 6M15 9l-6 6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ t('btnReject') }}
      </button>
      <button
        type="button"
        class="w-full px-4 py-2 text-sm theme-text-primary hover:theme-dashboard-bg-soft flex items-center gap-2 transition-colors duration-200 border-t border-slate-100"
        :class="isRTL ? 'flex-row-reverse text-right' : 'text-left'"
        @click="openDetailModal(contextMenu.approval); contextMenu.visible = false"
      >
        <svg class="w-4 h-4 shrink-0 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ locale === 'ar' ? 'عرض التفاصيل' : 'View Details' }}
      </button>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { getApprovals, approveRequest, rejectRequest } from '@/api';
import { useRealtime } from '@/composables/useRealtime';

export default {
  name: 'ApprovalsInbox',
  setup() {
    const { locale } = useI18n();
    const instance = getCurrentInstance()
    useRealtime({
      channel: 'approvals',
      events: ['approval_created', 'approval_completed', 'approval_rejected'],
      handler: () => { instance.proxy?.loadApprovals() },
    })
    return { locale };
  },
  data() {
    return {
      approvals: [],
      loading: false,
      submitting: false,
      error: null,
      successMsg: null,
      activeStatus: 'PENDING',
      showRejectModal: false,
      selectedApproval: null,
      selectedApprovalForDetail: null,
      rejectNotes: '',
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        approval: null
      },
      
      // Inline translations mapping
      translations: {
        en: {
          title: 'Admin Approvals Queue',
          subtitle: 'Review and authorize operations affecting contractor balances or treasury logs.',
          pendingTab: 'Pending Approvals',
          approvedTab: 'Approved Requests',
          rejectedTab: 'Rejected Requests',
          queueTitle: 'Authorization Tasks',
          queueSubtitle: 'Actions requiring four-eyes authorization to affect general ledger sync.',
          refresh: 'Refresh Queue',
          noItems: 'No approvals found',
          noItemsDesc: 'No entries match this status in the queue.',
          colId: 'ID',
          colModule: 'Module',
          colAction: 'Action',
          colRequestedBy: 'Requested By',
          colDetails: 'Operation Details',
          colDate: 'Submission Date',
          colResolvedBy: 'Resolved By',
          colActions: 'Authorization',
          btnApprove: 'Approve',
          btnReject: 'Reject',
          btnCancel: 'Cancel',
          btnRejectConfirm: 'Reject Action',
          rejectModalTitle: 'Reject Request Notes',
          rejectModalPrompt: 'Specify an optional explanation or feedback for the requester:',
          rejectModalPlaceholder: 'e.g., incorrect quantities, missing backup records...',
          statusApproved: 'APPROVED',
          statusRejected: 'REJECTED',
          contractor: 'Contractor',
          deletionNotice: 'RECORD DELETION REQUEST',
          restoreNotice: 'RECORD RESTORE REQUEST',
          originalValue: 'Original Value',
          notes: 'Reason/Notes',
          // Field mappings
          total: 'Total Value',
          amount: 'Amount',
          discount: 'Discount',
          unitPrice: 'Unit Price',
          companyCapacity: 'Company Qty',
          crusherCapacity: 'Crusher Qty',
          hours: 'Hours Worked',
          hourlyRate: 'Hourly Rate',
          isRental: 'Rental Status',
          notesField: 'Notes/Memo',
          date: 'Business Date'
        },
        ar: {
          title: 'دفتر الموافقات والتفويضات الإدارية',
          subtitle: 'مراجعة وتفويض العمليات المؤثرة على حسابات المقاولين والخزائن.',
          pendingTab: 'طلبات قيد المراجعة',
          approvedTab: 'طلبات تم قبولها',
          rejectedTab: 'طلبات مرفوضة',
          queueTitle: 'مهام التفويض والمراجعة',
          queueSubtitle: 'العمليات التي تتطلب موافقة إدارية لتحديث السجلات المالية.',
          refresh: 'تحديث القائمة',
          noItems: 'لا توجد طلبات موافقة',
          noItemsDesc: 'لا توجد سجلات تطابق هذه الحالة حالياً.',
          colId: 'المعرف',
          colModule: 'القسم',
          colAction: 'النوع',
          colRequestedBy: 'مقدم الطلب',
          colDetails: 'تفاصيل العملية',
          colDate: 'تاريخ التقديم',
          colResolvedBy: 'المفوض',
          colActions: 'الإجراء',
          btnApprove: 'قبول',
          btnReject: 'رفض',
          btnCancel: 'إلغاء',
          btnRejectConfirm: 'رفض وتأكيد',
          rejectModalTitle: 'ملاحظات رفض الطلب',
          rejectModalPrompt: 'اكتب سبب الرفض أو توجيهات لمقدم الطلب:',
          rejectModalPlaceholder: 'مثال: خطأ في الحسابات، نقص في المستندات المرفقة...',
          statusApproved: 'مقبول',
          statusRejected: 'مرفوض',
          contractor: 'المقاول',
          deletionNotice: 'طلب حذف السجل بالكامل',
          restoreNotice: 'طلب استعادة السجل المحذوف',
          originalValue: 'القيمة الأصلية',
          notes: 'السبب/الملاحظات',
          // Field mappings
          total: 'إجمالي القيمة',
          amount: 'المبلغ',
          discount: 'الخصم',
          unitPrice: 'سعر الوحدة',
          companyCapacity: 'كمية الشركة',
          crusherCapacity: 'كمية الكسارة',
          hours: 'عدد الساعات',
          hourlyRate: 'سعر الساعة',
          isRental: 'حالة الإيجار',
          notesField: 'ملاحظات السجل',
          date: 'تاريخ العمل'
        }
      }
    };
  },
  computed: {
    isRTL() {
      return this.locale === 'ar';
    },
    filteredApprovals() {
      return this.approvals.filter(a => a.status === this.activeStatus);
    },
    tabs() {
      return [
        { value: 'PENDING', label: this.t('pendingTab'), iconClass: 'text-amber-500' },
        { value: 'APPROVED', label: this.t('approvedTab'), iconClass: 'text-emerald-500' },
        { value: 'REJECTED', label: this.t('rejectedTab'), iconClass: 'text-rose-500' }
      ];
    }
  },
  mounted() {
    this.loadApprovals();
    this.closeContextMenuHandler = () => {
      this.contextMenu.visible = false;
    }
    document.addEventListener('click', this.closeContextMenuHandler);
  },
  beforeUnmount() {
    if (this.closeContextMenuHandler) {
      document.removeEventListener('click', this.closeContextMenuHandler);
    }
  },
  methods: {
    t(key) {
      const currentLang = this.locale === 'ar' ? 'ar' : 'en';
      return this.translations[currentLang][key] || key;
    },
    async loadApprovals() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getApprovals('');
        if (response.data?.success) {
          this.approvals = response.data.items || [];
        } else {
          this.error = 'Failed to load approvals queue.';
        }
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.message || 'Error loading approvals inbox';
      } finally {
        this.loading = false;
      }
    },
    getCount(status) {
      return this.approvals.filter(a => a.status === status).length;
    },
    getModuleLabel(mod) {
      const labels = {
        SUPPLY: this.locale === 'ar' ? 'توريدات' : 'Supply',
        TRANSPORT: this.locale === 'ar' ? 'نقليات' : 'Transport',
        RENTAL: this.locale === 'ar' ? 'سجلات معدات' : 'Equipment Rental',
        EXTRACT: this.locale === 'ar' ? 'مستخلصات' : 'Extract',
        EXPENSE: this.locale === 'ar' ? 'مصروفات' : 'Expense'
      };
      return labels[mod] || mod;
    },
    getModuleClass(mod) {
      const classes = {
        SUPPLY: 'bg-sky-50 text-sky-700 border border-sky-100',
        TRANSPORT: 'bg-purple-50 text-purple-700 border border-purple-100',
        RENTAL: 'bg-teal-50 text-teal-700 border border-teal-100',
        EXTRACT: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        EXPENSE: 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      };
      return classes[mod] || 'bg-slate-50 text-slate-700';
    },
    getActionLabel(act) {
      const labels = {
        UPDATE: this.locale === 'ar' ? 'تعديل' : 'Edit / Update',
        DELETE: this.locale === 'ar' ? 'حذف' : 'Delete',
        RESTORE: this.locale === 'ar' ? 'استعادة' : 'Restore'
      };
      return labels[act] || act;
    },
    getActionClass(act) {
      const classes = {
        UPDATE: 'bg-amber-50 text-amber-700 border border-amber-100',
        DELETE: 'bg-rose-50 text-rose-700 border border-rose-100',
        RESTORE: 'bg-indigo-50 text-indigo-700 border border-indigo-100'
      };
      return classes[act] || 'bg-slate-50 text-slate-700';
    },
    getFieldLabel(field) {
      return this.t(field) || field;
    },
    getChangedFields(app) {
      if (!app.afterState || !app.beforeState) return {};
      const changes = {};
      Object.keys(app.afterState).forEach(key => {
        const oldVal = app.beforeState[key];
        const newVal = app.afterState[key];
        // Compare values, ignore formatting differences
        if (oldVal !== newVal && String(oldVal) !== String(newVal)) {
          // Ignore fields like audit properties
          if (!['updatedAt', 'updatedById', 'createdById', 'createdAt', 'deletedAt'].includes(key)) {
            changes[key] = newVal;
          }
        }
      });
      return changes;
    },
    formatValue(val, key) {
      if (val === null || val === undefined) return '-';
      if (typeof val === 'boolean') {
        return val ? (this.locale === 'ar' ? 'نعم' : 'Yes') : (this.locale === 'ar' ? 'لا' : 'No');
      }
      if (['total', 'amount', 'unitPrice', 'discount', 'hourlyRate'].includes(key)) {
        const formatted = Number(val).toLocaleString('en-US', { style: 'currency', currency: 'SAR' }); return this.locale === 'ar' ? '\u200E' + formatted : formatted;
      }
      return val;
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    },
    async handleApprove(app) {
      this.submitting = true;
      this.error = null;
      this.successMsg = null;
      try {
        const response = await approveRequest(app.id);
        if (response.data?.success) {
          this.successMsg = this.locale === 'ar'
            ? `تمت الموافقة وتطبيق الإجراء بنجاح وتحديث كشف الحساب والعمليات المالية للطلب #${app.id}.`
            : `Request #${app.id} successfully approved and general ledger transactions synchronized.`;
          await this.loadApprovals();
        }
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.message || 'Error executing approval';
      } finally {
        this.submitting = false;
      }
    },
    openRejectModal(app) {
      this.selectedApproval = app;
      this.rejectNotes = '';
      this.showRejectModal = true;
    },
    closeRejectModal() {
      this.selectedApproval = null;
      this.rejectNotes = '';
      this.showRejectModal = false;
    },
    async handleReject() {
      if (!this.selectedApproval) return;
      this.submitting = true;
      this.error = null;
      this.successMsg = null;
      try {
        const response = await rejectRequest(this.selectedApproval.id, this.rejectNotes);
        if (response.data?.success) {
          this.successMsg = this.locale === 'ar'
            ? `تم رفض الطلب #${this.selectedApproval.id} بنجاح وحفظ ملاحظات الرفض.`
            : `Request #${this.selectedApproval.id} rejected. No account updates were performed.`;
          this.closeRejectModal();
          await this.loadApprovals();
        }
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.message || 'Error rejecting request';
      } finally {
        this.submitting = false;
      }
    },
    openDetailModal(app) {
      this.selectedApprovalForDetail = app;
    },
    closeDetailModal() {
      this.selectedApprovalForDetail = null;
    },
    openRowContextMenu(event, app) {
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.approval = app;
      this.contextMenu.visible = true;
    },
    closeRowContextMenu() {
      this.contextMenu.visible = false;
      this.contextMenu.approval = null;
    },
    getDetailKeys(app) {
      if (!app.beforeState) return [];
      const keys = new Set([
        ...Object.keys(app.beforeState),
        ...(app.afterState ? Object.keys(app.afterState) : [])
      ]);
      const excludeKeys = [
        'id', 'createdAt', 'updatedAt', 'createdById', 'updatedById', 'deletedAt',
        'contractorId', 'locationId', 'areaId', 'itemId', 'vehicleId', 'driverId', 'crusherId',
        'hasPendingApproval', 'availableForSupplies', 'availableForExports', 'availableForTransports'
      ];
      return Array.from(keys).filter(k => !excludeKeys.includes(k));
    },
    hasFieldChanged(app, key) {
      if (!app.afterState || !app.beforeState) return false;
      const oldVal = app.beforeState[key];
      const newVal = app.afterState[key];
      return oldVal !== newVal && String(oldVal) !== String(newVal);
    },
    getDetailKeyLabel(key) {
      const mappings = {
        date: this.locale === 'ar' ? 'التاريخ' : 'Date',
        contractorName: this.locale === 'ar' ? 'المقاول' : 'Contractor',
        contractor: this.locale === 'ar' ? 'المقاول' : 'Contractor',
        locationName: this.locale === 'ar' ? 'الموقع' : 'Location',
        location: this.locale === 'ar' ? 'الموقع' : 'Location',
        areaName: this.locale === 'ar' ? 'المنطقة' : 'Area',
        area: this.locale === 'ar' ? 'المنطقة' : 'Area',
        crusherName: this.locale === 'ar' ? 'الكسارة' : 'Crusher',
        itemName: this.locale === 'ar' ? 'البند' : 'Item',
        item: this.locale === 'ar' ? 'البند' : 'Item',
        vehicleName: this.locale === 'ar' ? 'السيارة' : 'Vehicle',
        vehicle: this.locale === 'ar' ? 'السيارة' : 'Vehicle',
        driverName: this.locale === 'ar' ? 'السائق' : 'Driver',
        driver: this.locale === 'ar' ? 'السائق' : 'Driver',
        crusherTicket: this.locale === 'ar' ? 'بون الكسارة' : 'Crusher Ticket',
        companyTicket: this.locale === 'ar' ? 'بون الشركة' : 'Company Ticket',
        companyCapacity: this.locale === 'ar' ? 'كمية الشركة' : 'Company Capacity',
        crusherCapacity: this.locale === 'ar' ? 'كمية الكسارة' : 'Crusher Capacity',
        numTrips: this.locale === 'ar' ? 'عدد النقلات' : 'Trips Count',
        distanceKm: this.locale === 'ar' ? 'المسافة (كم)' : 'Distance (Km)',
        hours: this.locale === 'ar' ? 'عدد الساعات' : 'Hours',
        hourlyRate: this.locale === 'ar' ? 'سعر الساعة' : 'Hourly Rate',
        isRental: this.locale === 'ar' ? 'مستأجر' : 'Is Rented',
        unitPrice: this.locale === 'ar' ? 'سعر الفئة' : 'Unit Price',
        discount: this.locale === 'ar' ? 'الخصم' : 'Discount',
        total: this.locale === 'ar' ? 'الإجمالي' : 'Total',
        notes: this.locale === 'ar' ? 'الملاحظات' : 'Notes',
        note: this.locale === 'ar' ? 'الملاحظات' : 'Notes',
      };
      return mappings[key] || key;
    },
    getDisplayValue(val, key) {
      if (val === null || val === undefined) return '-';
      if (typeof val === 'object') {
        return val.name || val.label || val.id || JSON.stringify(val);
      }
      if (typeof val === 'boolean') {
        return val ? (this.locale === 'ar' ? 'نعم' : 'Yes') : (this.locale === 'ar' ? 'لا' : 'No');
      }
      if (['total', 'amount', 'unitPrice', 'discount', 'hourlyRate', 'firstKmPrice', 'perKmPrice'].includes(key)) {
        const formatted = Number(val).toLocaleString('en-US', { style: 'currency', currency: 'EGP' }); return this.locale === 'ar' ? '\u200E' + formatted : formatted;
      }
      if (key === 'date' || key === 'createdAt' || key === 'updatedAt') {
        try {
          return new Intl.DateTimeFormat('en-US').format(new Date(val));
        } catch {
          return val;
        }
      }
      return val;
    }
  }
};
</script>

<style scoped>
.text-xxs {
  font-size: 0.65rem;
}
</style>
