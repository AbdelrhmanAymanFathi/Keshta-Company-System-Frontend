<template>
  <div v-if="incomingCall" class="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <section class="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl">
      <div class="flex items-center gap-4 border-b border-white/10 px-6 py-5">
        <span class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-xl font-bold">
          {{ callerInitials }}
          <span class="absolute -bottom-0.5 -end-0.5 h-4 w-4 rounded-full border-[3px] border-slate-900 bg-emerald-400"></span>
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">{{ t('messaging.incomingCall') }}</p>
          <h2 class="mt-1 truncate text-xl font-semibold">{{ callerName }}</h2>
          <p class="mt-1 text-sm text-slate-300">{{ incomingCall.type === 'VIDEO' ? t('messaging.callVideo') : t('messaging.callAudio') }}</p>
        </div>
        <span class="animate-pulse text-2xl text-blue-300" aria-hidden="true">●</span>
      </div>
      <p class="px-6 pt-4 text-sm text-slate-300">{{ t('messaging.answerFromAnywhere') }}</p>
      <p v-if="errorMessage" class="px-6 pt-3 text-sm text-rose-300">{{ errorMessage }}</p>
      <div class="flex items-center justify-center gap-5 px-6 py-6">
        <button class="flex min-w-28 flex-col items-center gap-2 rounded-2xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white" :disabled="busy" @click="reject">
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-2xl shadow-lg shadow-rose-950/40" aria-hidden="true">✕</span>
          {{ t('messaging.reject') }}
        </button>
        <button class="flex min-w-28 flex-col items-center gap-2 rounded-2xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white" :disabled="busy" @click="answer">
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-2xl shadow-lg shadow-emerald-950/40" aria-hidden="true">☎</span>
          {{ t('messaging.answer') }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { getActiveChatCalls, updateChatCall } from '@/api'
import { user } from '@/composables/authStore'
import { realtimeService } from '@/services/realtimeService'
import { startChatRingtone, stopChatRingtone } from '@/utils/notificationSound'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const incomingCall = ref(null)
const busy = ref(false)
const errorMessage = ref('')
const currentUserId = computed(() => Number(user.value?.id || user.value?.userId) || 0)
const caller = computed(() => incomingCall.value?.participants?.find((participant) => participant.userId === incomingCall.value?.createdById)?.user)
const callerName = computed(() => caller.value?.name || t('messaging.unknownCaller'))
const callerInitials = computed(() => callerName.value.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || '?')

let unsubscribe = null

function showCall(call) {
  if (!call || call.createdById === currentUserId.value || route.name === 'messaging' || incomingCall.value?.id === call.id) return
  incomingCall.value = call
  errorMessage.value = ''
  startChatRingtone('incomingCall')
}

function handleRealtime(event, data) {
  if (event === 'call.incoming') showCall(data?.call)
  if (event === 'call.updated' && incomingCall.value?.id === data?.callId && data.status !== 'RINGING') {
    incomingCall.value = null
    stopChatRingtone()
  }
}

async function restoreIncomingCall() {
  try {
    const { data } = await getActiveChatCalls()
    const call = (data.calls || []).map((entry) => entry.call).find((item) =>
      item.createdById !== currentUserId.value && item.status === 'RINGING'
    )
    if (call) showCall(call)
  } catch (error) {
    console.error('Failed to restore incoming chat call notification', error)
  }
}

async function answer() {
  const call = incomingCall.value
  if (!call || busy.value) return
  busy.value = true
  errorMessage.value = ''
  stopChatRingtone()
  try {
    incomingCall.value = null
    await router.push({ name: 'messaging', query: { answerCall: call.id } })
  } catch (error) {
    console.error('Failed to open the call screen', error)
    incomingCall.value = call
    errorMessage.value = t('messaging.callFailed')
    startChatRingtone('incomingCall')
  } finally {
    busy.value = false
  }
}

async function reject() {
  const call = incomingCall.value
  if (!call || busy.value) return
  busy.value = true
  errorMessage.value = ''
  try {
    await updateChatCall(call.id, 'reject')
    incomingCall.value = null
    stopChatRingtone()
  } catch (error) {
    console.error('Failed to reject incoming chat call', error)
    errorMessage.value = t('messaging.callFailed')
  } finally {
    busy.value = false
  }
}

watch(() => route.name, (name) => {
  if (name === 'messaging' && incomingCall.value) {
    incomingCall.value = null
    stopChatRingtone()
  }
})

watch(() => realtimeService.isConnected.value, (connected) => {
  if (connected) void restoreIncomingCall()
})

onMounted(() => {
  unsubscribe = realtimeService.subscribe('chat', ['call.incoming', 'call.updated'], handleRealtime)
  void restoreIncomingCall()
})

onUnmounted(() => {
  unsubscribe?.()
  stopChatRingtone()
})
</script>
