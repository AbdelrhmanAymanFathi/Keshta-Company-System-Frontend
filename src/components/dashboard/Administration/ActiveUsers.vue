<template>
  <div :dir="isRTL ? 'rtl' : 'ltr'" class="space-y-6">
    <PageHeader :title="$t('activeUsers.title')" :subtitle="$t('activeUsers.description')" />

    <div class="rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <h3 class="text-base font-semibold theme-text-primary">{{ $t('activeUsers.connectedUsers') }}</h3>
          <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium" :class="onlineCount > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 theme-text-muted'">
            <span class="w-2 h-2 rounded-full" :class="onlineCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'"></span>
            {{ onlineCount }}
          </span>
        </div>
        <button @click="refresh" :disabled="loading" class="flex items-center gap-2 text-sm theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50">
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('activeUsers.refresh') }}
        </button>
      </div>

      <div v-if="loading && !users.length" class="p-6">
        <div v-for="n in 5" :key="n" class="animate-pulse h-4 rounded bg-slate-200 mb-3" :style="{ width: (100 - n * 10) + '%' }"></div>
      </div>

      <div v-else-if="!users.length" class="p-6 text-sm theme-text-muted text-center">
        {{ $t('activeUsers.empty') }}
      </div>

      <div v-else>
        <table v-app-table class="app-table divide-y divide-slate-200">
          <thead class="theme-table-thead-gradient">
            <tr>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('activeUsers.colName') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('activeUsers.colPage') }}</th>
              <th class="px-5 py-3 text-xs font-medium theme-text-muted uppercase tracking-wider" :class="isRTL ? 'text-right' : 'text-left'">{{ $t('activeUsers.colActivity') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="u in users" :key="u.userId" class="theme-table-row-hover">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <div class="relative shrink-0">
                    <div
                      class="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold text-white"
                      :style="{ backgroundColor: colorFor(u.userId) }"
                      :title="formatActivity(u, isRTL)"
                      :aria-label="formatActivity(u, isRTL)"
                    >
                      {{ initials(u.name) }}
                    </div>
                    <span
                      class="absolute -bottom-0.5 w-3 h-3 rounded-full ring-2 ring-white"
                      :class="[isRTL ? '-left-0.5' : '-right-0.5', u.online !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500']"
                    ></span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-sm font-medium theme-text-primary">{{ u.name || '?' }}</span>
                    <button
                      type="button"
                      class="block text-xs theme-accent-strong hover:underline disabled:opacity-50"
                      :disabled="activityReportLoading"
                      @click="loadActivityReport(u)"
                    >{{ $t('activeUsers.activityReport') }}</button>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3 text-sm theme-text-secondary">
                <div v-if="u.page" class="flex flex-wrap items-center gap-1.5">
                  <span v-if="pageSection(u.page)" class="text-xs theme-text-muted">{{ pageSection(u.page) }}</span>
                  <span v-if="pageSection(u.page)" class="text-xs theme-text-muted" aria-hidden="true">›</span>
                  <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium theme-text-secondary">{{ pageLabel(u.page) }}</span>
                  <span v-if="u.recordId" class="text-xs theme-text-muted">{{ $t('activeUsers.recordNumber', { id: u.recordId }) }}</span>
                </div>
                <span v-else class="text-xs theme-text-muted">{{ $t('activeUsers.noPage') }}</span>
              </td>
              <td class="px-5 py-3 whitespace-nowrap text-sm theme-text-secondary">{{ formatActivity(u, isRTL) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <section v-if="activityReportUser" class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/40">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold theme-text-primary">
            {{ $t('activeUsers.activityReportTitle', { name: activityReportUser.name }) }}
          </h3>
          <p class="text-xs theme-text-muted">{{ $t('activeUsers.activityReportRange') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="activityReport"
            type="button"
            class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="activityReportPdfLoading"
            @click="downloadActivityReportPdf"
          >{{ $t(activityReportPdfLoading ? 'activeUsers.downloadingPdf' : 'activeUsers.downloadPdf') }}</button>
          <button type="button" class="text-sm theme-text-secondary hover:theme-text-primary" @click="clearActivityReport">
            {{ $t('activeUsers.closeReport') }}
          </button>
        </div>
      </div>

      <div v-if="activityReportLoading" class="animate-pulse h-5 w-40 rounded bg-slate-200"></div>
      <p v-else-if="activityReportError" class="text-sm text-red-600">{{ activityReportError }}</p>
      <template v-else-if="activityReport">
        <p v-if="activityReportPdfError" class="mb-3 text-sm text-red-600">{{ activityReportPdfError }}</p>
        <p v-if="activityReport.truncated" class="mb-3 text-xs text-amber-700">{{ $t('activeUsers.activityReportTruncated') }}</p>
        <div class="mb-5">
          <h4 class="mb-2 text-sm font-semibold theme-text-primary">{{ $t('activeUsers.sessions') }}</h4>
          <p v-if="!activityReport.sessions.length" class="text-sm theme-text-muted">{{ $t('activeUsers.noSessions') }}</p>
          <ul v-else class="space-y-2">
            <li v-for="(session, index) in activityReport.sessions" :key="session.id" class="rounded-lg bg-slate-50 px-3 py-2 text-sm theme-text-secondary">
              <span>{{ $t('activeUsers.onlinePeriod', { from: formatDate(session.startedAt, isRTL), to: formatDate(session.endedAt, isRTL) }) }}</span>
              <span v-if="offlinePeriod(session, index, activityReport.sessions)" class="ms-2 text-xs theme-text-muted">
                {{ $t('activeUsers.offlinePeriod', offlinePeriod(session, index, activityReport.sessions)) }}
              </span>
              <span v-if="session.lastPage" class="block text-xs theme-text-muted">
                {{ pageSection(session.lastPage) }}<span v-if="pageSection(session.lastPage)"> › </span>{{ pageLabel(session.lastPage) }}
                <span v-if="session.lastRecordId">{{ $t('activeUsers.recordNumber', { id: session.lastRecordId }) }}</span>
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-2 text-sm font-semibold theme-text-primary">{{ $t('activeUsers.actions') }}</h4>
          <p v-if="!activityReport.events.length" class="text-sm theme-text-muted">{{ $t('activeUsers.noActions') }}</p>
          <ul v-else class="space-y-2">
            <li v-for="event in activityReport.events" :key="event.id" class="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <time class="text-xs theme-text-muted">{{ formatDate(event.occurredAt, isRTL) }}</time>
              <span class="font-medium theme-text-primary">{{ $t(`activeUsers.actionsMap.${event.action}`, event.action) }}</span>
              <span class="theme-text-secondary">{{ resourceLabel(event.resource) }}</span>
              <span v-if="event.resourceId" class="text-xs theme-text-muted">#{{ event.resourceId }}</span>
              <span v-if="event.fileFormat" class="rounded bg-white px-2 py-0.5 text-xs theme-text-muted">{{ event.fileFormat.toUpperCase() }}</span>
              <span v-if="event.changedFields?.length" class="w-full text-xs theme-text-muted">
                {{ $t('activeUsers.changedFields') }}: {{ event.changedFields.map(fieldLabel).join(', ') }}
              </span>
            </li>
          </ul>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useActiveUsers } from '@/composables/useActiveUsers'
import { downloadUserActivityReportPdf, getUserActivityReport } from '@/api'
import { downloadBlobData, getFilenameFromResponse } from '@/utils/downloadFile'

const PALETTE = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6']

export default {
  name: 'ActiveUsers',
  components: { PageHeader },
  setup() {
    const { locale, t } = useI18n()
    const { users, loading, refresh } = useActiveUsers()
    const activityReportUser = ref(null)
    const activityReport = ref(null)
    const activityReportLoading = ref(false)
    const activityReportError = ref('')
    const activityReportPdfLoading = ref(false)
    const activityReportPdfError = ref('')
    return {
      locale, t, users, loading, refresh,
      activityReportUser, activityReport, activityReportLoading, activityReportError,
      activityReportPdfLoading, activityReportPdfError
    }
  },
  computed: {
    isRTL() { return this.locale === 'ar' },
    onlineCount() { return this.users.filter(user => user.online !== false).length }
  },
  methods: {
    pageLabel(page) {
      const key = 'activeUsers.pageLabels.' + page
      const label = this.t(key)
      if (label && label !== key) return label

      const route = router.getRoutes().find(candidate => candidate.name === page)
      const titleKey = route?.meta?.title
      if (typeof titleKey === 'string') {
        const routeLabel = this.t(titleKey)
        if (routeLabel && routeLabel !== titleKey) return routeLabel
      }

      return this.t('activeUsers.unknownPage')
    },
    pageSection(page) {
      const route = router.getRoutes().find(candidate => candidate.name === page)
      const routePath = typeof route?.path === 'string' ? route.path : ''
      const moduleName = routePath.split('/').filter(Boolean)[1]
      const key = `activeUsers.sectionLabels.${moduleName}`
      const label = moduleName ? this.t(key) : ''
      return label && label !== key ? label : ''
    },
    async loadActivityReport(user) {
      this.activityReportUser = user
      this.activityReport = null
      this.activityReportError = ''
      this.activityReportPdfError = ''
      this.activityReportLoading = true
      try {
        const { data } = await getUserActivityReport(user.userId)
        this.activityReport = data
      } catch (error) {
        this.activityReportError = this.t('activeUsers.activityReportError')
      } finally {
        this.activityReportLoading = false
      }
    },
    async downloadActivityReportPdf() {
      if (!this.activityReportUser || this.activityReportPdfLoading) return
      this.activityReportPdfLoading = true
      this.activityReportPdfError = ''
      try {
        const { data, headers } = await downloadUserActivityReportPdf(
          this.activityReportUser.userId,
          this.isRTL ? 'ar' : 'en'
        )
        const filename = getFilenameFromResponse(
          headers,
          `user-activity-${this.activityReportUser.userId}.pdf`
        )
        downloadBlobData(data, filename, 'application/pdf')
      } catch (error) {
        this.activityReportPdfError = this.t('activeUsers.pdfDownloadError')
      } finally {
        this.activityReportPdfLoading = false
      }
    },
    clearActivityReport() {
      this.activityReportUser = null
      this.activityReport = null
      this.activityReportError = ''
      this.activityReportPdfError = ''
    },
    formatDate(value, rtl) {
      if (!value) return this.t('activeUsers.now')
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return this.t('activeUsers.unknownTime')
      return date.toLocaleString(rtl ? 'ar-EG' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
    },
    offlinePeriod(session, index, sessions) {
      if (!session.endedAt) return null
      const newerSession = sessions[index - 1]
      return {
        from: this.formatDate(session.endedAt, this.isRTL),
        to: newerSession ? this.formatDate(newerSession.startedAt, this.isRTL) : this.t('activeUsers.now')
      }
    },
    resourceLabel(resource) {
      const key = `activeUsers.resourceLabels.${resource.split('/').join('.')}`
      const translated = this.t(key)
      if (translated !== key) return translated
      return resource.split('/').map(segment => {
        const resourceKey = `activeUsers.resourceLabels.${segment}`
        const resourceLabel = this.t(resourceKey)
        if (resourceLabel !== resourceKey) return resourceLabel
        const sectionKey = `activeUsers.sectionLabels.${segment}`
        const label = this.t(sectionKey)
        return label === sectionKey ? segment : label
      }).join(' / ')
    },
    fieldLabel(field) {
      const key = `activeUsers.fieldLabels.${field}`
      const translated = this.t(key)
      return translated === key ? field : translated
    },
    formatActivity(user, rtl) {
      if (user.online !== false) return this.t('activeUsers.onlineNow')
      if (!user.lastSeen) return this.t('activeUsers.lastSeenUnknown')

      const date = new Date(user.lastSeen)
      if (Number.isNaN(date.getTime())) return this.t('activeUsers.lastSeenUnknown')
      const time = date.toLocaleString(rtl ? 'ar-EG' : 'en-US', {
        dateStyle: 'short',
        timeStyle: 'short'
      })
      return `${this.t('activeUsers.offline')} · ${this.t('activeUsers.lastSeen')}: ${time}`
    },
    initials(name) {
      const parts = (name || '?').trim().split(/\s+/)
      const first = parts[0]?.[0] ?? '?'
      const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
      return ((first + second).toUpperCase()) || '?'
    },
    colorFor(userId) {
      return PALETTE[userId % PALETTE.length]
    }
  }
}
</script>
