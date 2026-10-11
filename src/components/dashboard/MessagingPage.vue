<template>
  <div class="messaging-page" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <header class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold theme-text-primary">{{ t('messaging.title') }}</h1>
        <p class="text-sm theme-text-muted">{{ t('messaging.conversations') }}</p>
      </div>
      <span class="text-xs" :class="realtimeService.isConnected.value ? 'text-emerald-600' : 'text-slate-400'">
        {{ realtimeService.isConnected.value ? t('messaging.online') : t('messaging.offline') }}
      </span>
    </header>

    <div class="grid min-h-[65vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[21rem_minmax(0,1fr)]">
      <aside :class="['border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-e', mobileChatOpen ? 'hidden lg:block' : '']">
        <div class="space-y-3 border-b border-slate-200 p-4">
          <input
            v-model="search"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            :placeholder="t('messaging.search')"
          >
          <select v-model="newUserId" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">{{ t('messaging.startDirect') }}</option>
            <option v-for="person in filteredUsers" :key="person.id" :value="person.id">{{ person.name }}</option>
          </select>
          <button
            v-if="newUserId"
            class="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            @click="startDirectConversation"
          >{{ t('messaging.startDirect') }}</button>
        </div>

        <div v-if="loadingConversations" class="p-4 text-sm theme-text-muted">{{ t('messaging.conversations') }}...</div>
        <div v-else-if="!filteredConversations.length" class="p-4 text-sm theme-text-muted">{{ t('messaging.emptyConversations') }}</div>
        <div v-else class="max-h-[70vh] overflow-y-auto">
          <button
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            class="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-start transition hover:bg-blue-50"
            :class="selectedConversationId === conversation.id ? 'bg-blue-50' : ''"
            @click="selectConversation(conversation)"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              {{ initials(conversation.name) }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="flex items-center justify-between gap-2">
                <span class="truncate text-sm font-semibold theme-text-primary">{{ conversation.name }}</span>
                <span v-if="conversation.unreadCount" class="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{{ conversation.unreadCount }}</span>
              </span>
              <span class="block truncate text-xs theme-text-muted">{{ previewText(conversation.lastMessage) }}</span>
            </span>
          </button>
        </div>
      </aside>

      <section :class="['flex min-w-0 flex-col', !mobileChatOpen ? 'hidden lg:flex' : '']">
        <template v-if="selectedConversation">
          <header class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div class="flex min-w-0 items-center gap-3">
              <button class="rounded-lg px-2 py-1 text-sm text-blue-700 lg:hidden" @click="mobileChatOpen = false">‹</button>
              <div class="min-w-0">
                <h2 class="truncate font-semibold theme-text-primary">{{ selectedConversation.name }}</h2>
                <p class="text-xs theme-text-muted">
                  {{ selectedConversation.isOrganizationGroup ? `${selectedConversation.members.length} ${t('messaging.groupMembers')}` : (selectedConversation.members.find((member) => member.id !== currentUserId)?.online ? t('messaging.online') : t('messaging.offline')) }}
                </p>
              </div>
            </div>
            <div v-if="selectedConversation.type === 'DIRECT'" class="flex items-center gap-1">
              <button class="rounded-lg px-3 py-2 text-sm hover:bg-slate-100" :title="t('messaging.callAudio')" @click="startCall('AUDIO')">☎</button>
              <button class="rounded-lg px-3 py-2 text-sm hover:bg-slate-100" :title="t('messaging.callVideo')" @click="startCall('VIDEO')">▣</button>
            </div>
          </header>

          <div ref="messageScroller" class="relative flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4" @scroll="onMessageScroll">
            <button v-if="newMessagesAvailable" class="sticky top-1 z-10 mx-auto block rounded-full bg-blue-600 px-3 py-1 text-xs text-white shadow" @click="jumpToLatest">
              {{ t('messaging.newMessages') }}
            </button>
            <button v-if="hasMoreMessages" class="mx-auto block rounded-lg px-3 py-1 text-xs text-blue-700 hover:bg-blue-50" @click="loadOlderMessages">
              {{ t('messaging.retry') }}
            </button>
            <p v-if="loadingMessages" class="text-center text-sm theme-text-muted">{{ t('messaging.loadingMessages') }}</p>
            <p v-else-if="!messages.length" class="py-8 text-center text-sm theme-text-muted">{{ t('messaging.noMessages') }}</p>
            <article
              v-for="message in messages"
              :key="message.id"
              :id="`chat-message-${message.id}`"
              class="flex"
              :class="message.senderId === currentUserId ? 'justify-end' : 'justify-start'"
            >
              <div class="max-w-[88%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[75%]"
                :class="message.senderId === currentUserId ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white theme-text-primary'">
                <p v-if="selectedConversation.type === 'GROUP' && message.senderId !== currentUserId" class="mb-1 text-xs font-semibold text-blue-700">{{ message.sender?.name }}</p>
                <button v-if="message.replyTo" class="mb-1 block max-w-full truncate border-s-2 border-current ps-2 text-start text-xs opacity-75" @click="scrollToMessage(message.replyTo.id)">
                  {{ message.replyTo.text || t('messaging.file') }}
                </button>
                <p v-if="message.deletedAt" class="text-sm italic opacity-75">{{ t('messaging.deleted') }}</p>
                <template v-else>
                  <p v-if="message.text" class="whitespace-pre-wrap break-words text-sm">{{ message.text }}</p>
                  <div v-if="message.media" class="mt-2">
                    <img v-if="message.type === 'IMAGE' && mediaUrls[message.media.id]" :src="mediaUrls[message.media.id]" class="max-h-72 max-w-full rounded-lg object-contain" :alt="message.media.originalName">
                    <audio v-else-if="message.type === 'VOICE' && mediaUrls[message.media.id]" controls :src="mediaUrls[message.media.id]" class="max-w-full"></audio>
                    <video v-else-if="message.type === 'VIDEO_NOTE' && mediaUrls[message.media.id]" controls playsinline :src="mediaUrls[message.media.id]" class="max-h-72 max-w-full rounded-lg"></video>
                    <button v-else class="rounded-lg bg-black/5 px-2 py-1 text-sm underline" @click="downloadMedia(message.media)">
                      {{ message.media.originalName || t('messaging.file') }} · {{ formatBytes(message.media.sizeBytes) }}
                    </button>
                  </div>
                </template>
                <footer class="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-75">
                  <span>{{ formatTime(message.createdAt) }} <span v-if="message.editedAt">· {{ t('messaging.edited') }}</span></span>
                  <span v-if="message.senderId === currentUserId && message.readBy?.length">✓✓</span>
                  <button v-if="!message.deletedAt" class="underline" @click="replyTo(message)">{{ t('messaging.reply') }}</button>
                  <button v-if="message.senderId === currentUserId && !message.deletedAt && message.text" class="underline" @click="editMessage(message)">{{ t('messaging.edit') }}</button>
                  <button v-if="message.senderId === currentUserId || isConversationAdmin" class="underline" @click="removeMessage(message)">{{ t('messaging.delete') }}</button>
                </footer>
              </div>
            </article>
            <p v-if="activityLabel" class="text-center text-xs theme-text-muted">{{ activityLabel }}</p>
          </div>

          <div v-if="replyTarget" class="flex items-center justify-between border-t border-slate-200 bg-blue-50 px-4 py-2 text-xs">
            <span class="truncate">{{ t('messaging.reply') }}: {{ replyTarget.text || t('messaging.file') }}</span>
            <button class="px-2" @click="replyTarget = null">×</button>
          </div>
          <div class="border-t border-slate-200 bg-white p-3">
            <div v-if="recordingKind" class="mb-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <span>{{ recordingKind === 'video' ? t('messaging.callVideo') : t('messaging.recording') }} · {{ recordingSeconds }}s</span>
              <div class="flex gap-2">
                <button class="underline" @click="cancelRecording">{{ t('messaging.cancelRecording') }}</button>
                <button class="font-semibold underline" @click="stopRecording">{{ t('messaging.sendRecording') }}</button>
              </div>
            </div>
            <div class="flex items-end gap-2">
              <input ref="fileInput" type="file" class="hidden" accept="image/*,application/pdf,text/plain,text/csv,audio/*,video/*,.docx,.xlsx" @change="onFileSelected">
              <button class="rounded-lg p-2 text-slate-600 hover:bg-slate-100" :aria-label="t('messaging.attach')" :title="t('messaging.attach')" @click="$refs.fileInput.click()">＋</button>
              <button v-if="!recordingKind" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100" :title="t('messaging.startRecording')" @click="startRecording('audio')">🎙</button>
              <button v-if="!recordingKind && selectedConversation.type === 'DIRECT'" class="rounded-lg p-2 text-slate-600 hover:bg-slate-100" :title="t('messaging.callVideo')" @click="startRecording('video')">▣</button>
              <textarea
                v-model="draft"
                rows="1"
                class="max-h-32 min-h-10 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                :placeholder="t('messaging.messagePlaceholder')"
                @input="onDraftInput"
                @keydown.enter.exact.prevent="sendMessage"
              ></textarea>
              <button :disabled="!draft.trim() || sending" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" @click="sendMessage">
                {{ t('messaging.send') }}
              </button>
            </div>
            <p v-if="errorMessage" class="mt-2 text-xs text-red-600">{{ errorMessage }}</p>
          </div>
        </template>
        <div v-else class="flex flex-1 items-center justify-center p-8 text-center text-sm theme-text-muted">{{ t('messaging.chooseConversation') }}</div>
      </section>
    </div>

    <div v-if="incomingCall" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <p class="text-sm theme-text-muted">{{ t('messaging.incomingCall') }}</p>
        <h2 class="my-2 text-xl font-bold">{{ callerName(incomingCall) }}</h2>
        <p class="mb-5">{{ incomingCall.type === 'VIDEO' ? t('messaging.callVideo') : t('messaging.callAudio') }}</p>
        <div class="flex justify-center gap-3">
          <button class="rounded-xl bg-emerald-600 px-5 py-2 text-white" @click="answerCall">{{ t('messaging.answer') }}</button>
          <button class="rounded-xl bg-red-600 px-5 py-2 text-white" @click="rejectCall">{{ t('messaging.reject') }}</button>
        </div>
      </div>
    </div>

    <div v-if="activeCall" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4">
      <div class="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <p class="font-semibold">{{ activeCall.type === 'VIDEO' ? t('messaging.callVideo') : t('messaging.callAudio') }}</p>
            <p class="text-xs theme-text-muted">{{ callStatusText }}</p>
          </div>
          <button class="rounded-xl bg-red-600 px-4 py-2 text-sm text-white" @click="endCall">{{ t('messaging.endCall') }}</button>
        </div>
        <video ref="remoteVideoElement" autoplay playsinline class="max-h-[60vh] w-full rounded-xl bg-black" :class="activeCall.type === 'AUDIO' ? 'hidden' : ''"></video>
        <audio ref="remoteAudioElement" autoplay></audio>
        <video ref="localVideoElement" autoplay muted playsinline class="mt-2 max-h-40 rounded-lg bg-black" :class="activeCall.type === 'VIDEO' ? '' : 'hidden'"></video>
        <div class="mt-3 flex justify-center gap-3">
          <button class="rounded-lg border px-3 py-2 text-sm" @click="toggleMicrophone">{{ localStream?.getAudioTracks()[0]?.enabled ? t('messaging.mute') : t('messaging.unmute') }}</button>
          <button v-if="activeCall.type === 'VIDEO'" class="rounded-lg border px-3 py-2 text-sm" @click="toggleCamera">{{ localStream?.getVideoTracks()[0]?.enabled ? t('messaging.cameraOff') : t('messaging.cameraOn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createChatCall, createDirectConversation, deleteChatMessage, downloadChatMedia,
  editChatMessage, ensureOrganizationConversation, getActiveChatCalls,
  getChatCalls, getChatConversations, getChatMessages, getChatUsers, markChatRead,
  sendChatMessage, setChatActivity, updateChatCall, uploadChatMedia
} from '@/api'
import { realtimeService } from '@/services/realtimeService'
import { user } from '@/composables/authStore'

const { t, locale } = useI18n()
const users = ref([])
const conversations = ref([])
const selectedConversationId = ref('')
const messages = ref([])
const search = ref('')
const newUserId = ref('')
const draft = ref('')
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const hasMoreMessages = ref(false)
const newMessagesAvailable = ref(false)
const sending = ref(false)
const mobileChatOpen = ref(false)
const replyTarget = ref(null)
const errorMessage = ref('')
const messageScroller = ref(null)
const mediaUrls = ref({})
const markedReadMessageId = ref('')
const activity = ref(null)
const activityTimer = ref(null)
const typingTimer = ref(null)
const recordingKind = ref('')
const recordingSeconds = ref(0)
const recorder = ref(null)
const recordingStream = ref(null)
const recordingStartedAt = ref(0)
const cancelRecordingRequested = ref(false)
const activeCall = ref(null)
const incomingCall = ref(null)
const peerConnection = ref(null)
const localStream = ref(null)
const remoteStream = ref(null)
const iceCandidateQueue = ref([])
const callStatusText = ref('')
const currentUserId = computed(() => Number(user.value?.id || user.value?.userId || decodeSubject()) || 0)
const selectedConversation = computed(() => conversations.value.find((conversation) => conversation.id === selectedConversationId.value) || null)
const filteredUsers = computed(() => users.value.filter((person) => person.name.toLowerCase().includes(search.value.toLowerCase())))
const filteredConversations = computed(() => conversations.value.filter((conversation) => conversation.name.toLowerCase().includes(search.value.toLowerCase())))
const isConversationAdmin = computed(() => selectedConversation.value?.members?.some((member) => member.id === currentUserId.value && member.role === 'ADMIN') || false)
const activityLabel = computed(() => {
  if (!activity.value) return ''
  const person = selectedConversation.value?.members?.find((member) => member.id === activity.value.userId)
  const name = person?.name || ''
  return `${name} ${t(activity.value.kind === 'typing' ? 'messaging.typing' : 'messaging.recordingIndicator')}`
})

let unsubscribe = null
let recordingTimer = null
let isHandlingOffer = false
let destroyed = false

function decodeSubject() {
  try {
    const token = localStorage.getItem('accessToken')
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub
  } catch {
    return 0
  }
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || '?'
}

function formatTime(value) {
  return value ? new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : ''
}

function formatBytes(value) {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function previewText(message) {
  if (!message) return ''
  if (message.deletedAt) return t('messaging.deleted')
  return message.text || message.media?.originalName || t('messaging.file')
}

function showError(key) {
  errorMessage.value = t(key)
}

async function loadConversations() {
  loadingConversations.value = true
  try {
    const { data } = await getChatConversations()
    conversations.value = data.conversations || []
    if (!selectedConversationId.value && conversations.value.length) {
      const org = conversations.value.find((conversation) => conversation.isOrganizationGroup)
      if (org) await selectConversation(org)
    }
  } catch (error) {
    console.error('Failed to load messaging conversations', error)
    showError('messaging.loadFailed')
  } finally {
    loadingConversations.value = false
  }
}

async function loadInitialData() {
  errorMessage.value = ''
  try {
    const [usersResult] = await Promise.all([getChatUsers(), ensureOrganizationConversation()])
    users.value = usersResult.data.users || []
    await loadConversations()
  } catch (error) {
    console.error('Failed to load messaging users', error)
    showError('messaging.usersFailed')
  }
}

async function loadMessages(conversationId, { older = false } = {}) {
  if (!conversationId) return
  loadingMessages.value = true
  const previousScrollHeight = older ? messageScroller.value?.scrollHeight || 0 : 0
  try {
    const before = older ? messages.value[0]?.id : undefined
    const { data } = await getChatMessages(conversationId, { limit: 50, ...(before ? { before } : {}) })
    hasMoreMessages.value = Boolean(data.hasMore)
    messages.value = older
      ? [...(data.messages || []), ...messages.value.filter((old) => !(data.messages || []).some((current) => current.id === old.id))]
      : data.messages || []
    await Promise.all(messages.value.map(loadMediaPreview))
    if (older) {
      await nextTick()
      if (messageScroller.value) messageScroller.value.scrollTop += messageScroller.value.scrollHeight - previousScrollHeight
    } else {
      await scrollToBottom()
      newMessagesAvailable.value = false
    }
    const last = messages.value[messages.value.length - 1]
    if (!older && last && document.visibilityState === 'visible') await markLatestRead(conversationId, last.id)
    await loadConversations()
  } catch (error) {
    console.error('Failed to load chat messages', error)
    showError('messaging.messagesFailed')
  } finally {
    loadingMessages.value = false
  }
}

async function loadOlderMessages() {
  if (selectedConversationId.value && hasMoreMessages.value && !loadingMessages.value) {
    await loadMessages(selectedConversationId.value, { older: true })
  }
}

async function selectConversation(conversation) {
  const previousConversationId = selectedConversationId.value
  if (selectedConversationId.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
    void setChatActivity(selectedConversationId.value, 'typing', false).catch((error) => console.error('Failed to stop typing indicator', error))
    void setChatActivity(selectedConversationId.value, 'recording', false).catch((error) => console.error('Failed to stop recording indicator', error))
  }
  selectedConversationId.value = conversation.id
  markedReadMessageId.value = ''
  mobileChatOpen.value = true
  messages.value = []
  newMessagesAvailable.value = false
  replyTarget.value = null
  activity.value = null
  if (previousConversationId !== conversation.id) await loadCallsForConversation(conversation.id)
  await loadMessages(conversation.id)
}

async function loadCallsForConversation(conversationId) {
  try {
    const { data } = await getChatCalls(conversationId)
    const call = (data.calls || []).find((item) => ['RINGING', 'ACCEPTED'].includes(item.status))
    if (!call) return
    if (call.createdById !== currentUserId.value && call.status === 'RINGING') incomingCall.value = call
    else if (call.status === 'ACCEPTED' && call.createdById === currentUserId.value && !activeCall.value) {
      activeCall.value = call
      callStatusText.value = t('messaging.calling')
      const invitee = call.participants.find((participant) => participant.userId !== currentUserId.value)
      if (invitee?.status === 'ACCEPTED') {
        localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: call.type === 'VIDEO' })
        await createPeerConnection([])
      }
    }
  } catch (error) {
    console.error('Failed to restore conversation call', error)
  }
}

async function startDirectConversation() {
  if (!newUserId.value) return
  try {
    const { data } = await createDirectConversation(Number(newUserId.value))
    newUserId.value = ''
    await loadConversations()
    const conversation = conversations.value.find((item) => item.id === data.conversation.id)
    if (conversation) await selectConversation(conversation)
  } catch (error) {
    console.error('Failed to open direct conversation', error)
    showError('messaging.loadFailed')
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messageScroller.value) messageScroller.value.scrollTop = messageScroller.value.scrollHeight
}

function isNearLatest() {
  const element = messageScroller.value
  return Boolean(element && element.scrollHeight - element.scrollTop - element.clientHeight < 120)
}

function onMessageScroll() {
  if (!isNearLatest()) return
  newMessagesAvailable.value = false
  const last = messages.value[messages.value.length - 1]
  if (last && selectedConversationId.value && document.visibilityState === 'visible') {
    void markLatestRead(selectedConversationId.value, last.id)
  }
}

async function markLatestRead(conversationId, messageId) {
  if (markedReadMessageId.value === messageId) return
  const previousMessageId = markedReadMessageId.value
  markedReadMessageId.value = messageId
  try {
    await markChatRead(conversationId, messageId)
  } catch (error) {
    if (markedReadMessageId.value === messageId) markedReadMessageId.value = previousMessageId
    console.error('Failed to update read receipt', error)
  }
}

async function jumpToLatest() {
  await scrollToBottom()
  newMessagesAvailable.value = false
  onMessageScroll()
}

async function loadMediaPreview(message) {
  const media = message?.media
  if (!media || mediaUrls.value[media.id] || !['IMAGE', 'VOICE', 'VIDEO_NOTE'].includes(message.type)) return
  try {
    const { data } = await downloadChatMedia(media.id)
    const url = URL.createObjectURL(data)
    if (destroyed) URL.revokeObjectURL(url)
    else mediaUrls.value = { ...mediaUrls.value, [media.id]: url }
  } catch (error) {
    console.error('Failed to load chat media preview', error)
  }
}

async function downloadMedia(media) {
  try {
    const { data } = await downloadChatMedia(media.id)
    const url = URL.createObjectURL(data)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = media.originalName || 'attachment'
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download chat media', error)
    showError('messaging.uploadFailed')
  }
}

function addMessage(message, readIncoming = false) {
  const wasNearLatest = isNearLatest()
  if (!messages.value.some((existing) => existing.id === message.id)) {
    messages.value = [...messages.value, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  void loadMediaPreview(message)
  if (message.senderId === currentUserId.value || wasNearLatest) void scrollToBottom()
  else newMessagesAvailable.value = true
  if (readIncoming && wasNearLatest && document.visibilityState === 'visible') {
    void markLatestRead(message.conversationId, message.id)
  }
}

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || !selectedConversationId.value || sending.value) return
  sending.value = true
  errorMessage.value = ''
  const clientMessageId = crypto.randomUUID()
  try {
    const { data } = await sendChatMessage(selectedConversationId.value, {
      text,
      clientMessageId,
      ...(replyTarget.value ? { replyToId: replyTarget.value.id } : {}),
    })
    addMessage(data.message)
    draft.value = ''
    replyTarget.value = null
    await sendActivity('typing', false)
    await loadConversations()
  } catch (error) {
    console.error('Failed to send chat message', error)
    showError('messaging.sendFailed')
  } finally {
    sending.value = false
  }
}

async function sendFile(file, durationMs) {
  if (!file || !selectedConversationId.value || sending.value) return
  sending.value = true
  errorMessage.value = ''
  try {
    const { data: uploaded } = await uploadChatMedia(selectedConversationId.value, file, durationMs)
    const { data } = await sendChatMessage(selectedConversationId.value, {
      mediaId: uploaded.media.id,
      clientMessageId: crypto.randomUUID(),
      ...(replyTarget.value ? { replyToId: replyTarget.value.id } : {}),
    })
    addMessage(data.message)
    replyTarget.value = null
    await loadConversations()
  } catch (error) {
    console.error('Failed to send chat attachment', error)
    showError(error.response?.data?.message || t('messaging.uploadFailed'))
  } finally {
    sending.value = false
  }
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) await sendFile(file)
}

function replyTo(message) {
  replyTarget.value = message
}

function scrollToMessage(messageId) {
  document.getElementById(`chat-message-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function editMessage(message) {
  const nextText = window.prompt(t('messaging.edit'), message.text)
  if (nextText === null || !nextText.trim() || nextText === message.text) return
  try {
    const { data } = await editChatMessage(message.id, nextText)
    replaceMessage(data.message)
  } catch (error) {
    console.error('Failed to edit chat message', error)
    showError('messaging.sendFailed')
  }
}

async function removeMessage(message) {
  if (!window.confirm(t('messaging.confirmDelete'))) return
  try {
    await deleteChatMessage(message.id)
    const target = messages.value.find((item) => item.id === message.id)
    if (target) Object.assign(target, { deletedAt: new Date().toISOString(), text: null, media: null })
  } catch (error) {
    console.error('Failed to delete chat message', error)
    showError('messaging.sendFailed')
  }
}

function replaceMessage(message) {
  const index = messages.value.findIndex((item) => item.id === message.id)
  if (index >= 0) messages.value.splice(index, 1, message)
}

async function sendActivity(kind, active) {
  if (!selectedConversationId.value) return
  try {
    await setChatActivity(selectedConversationId.value, kind, active)
  } catch (error) {
    console.error(`Failed to update ${kind} indicator`, error)
  }
}

function onDraftInput() {
  if (!draft.value.trim()) return
  if (!typingTimer.value) void sendActivity('typing', true)
  clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(() => {
    typingTimer.value = null
    void sendActivity('typing', false)
  }, 2200)
}

function setActivity(kind, userId) {
  activity.value = { kind, userId, conversationId: selectedConversationId.value }
  clearTimeout(activityTimer.value)
  activityTimer.value = setTimeout(() => { activity.value = null }, 5000)
}

async function startRecording(kind) {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    showError('messaging.callFailed')
    return
  }
  try {
    const constraints = kind === 'video' ? { audio: true, video: true } : { audio: true, video: false }
    recordingStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    const options = kind === 'video'
      ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? { mimeType: 'video/webm;codecs=vp8,opus' } : {})
      : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? { mimeType: 'audio/webm;codecs=opus' } : {})
    recorder.value = new MediaRecorder(recordingStream.value, options)
    const chunks = []
    cancelRecordingRequested.value = false
    recordingKind.value = kind
    recordingStartedAt.value = Date.now()
    recordingSeconds.value = 0
    recorder.value.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    recorder.value.onstop = async () => {
      const elapsed = Math.min(600_000, Date.now() - recordingStartedAt.value)
      const blob = new Blob(chunks, { type: recorder.value?.mimeType || (kind === 'video' ? 'video/webm' : 'audio/webm') })
      stopRecordingTracks()
      recordingKind.value = ''
      clearInterval(recordingTimer)
      if (!cancelRecordingRequested.value && blob.size) {
        const extension = blob.type.includes('mp4') ? (kind === 'video' ? 'mp4' : 'm4a') : 'webm'
        const file = new File([blob], `${kind}-note-${Date.now()}.${extension}`, { type: blob.type })
        await sendFile(file, elapsed)
      }
    }
    recorder.value.start(250)
    void sendActivity('recording', true)
    recordingTimer = setInterval(() => {
      recordingSeconds.value = Math.floor((Date.now() - recordingStartedAt.value) / 1000)
      if ((kind === 'video' && recordingSeconds.value >= 120) || (kind === 'audio' && recordingSeconds.value >= 600)) stopRecording()
    }, 500)
  } catch (error) {
    console.error('Unable to start media recording', error)
    showError('messaging.callFailed')
    stopRecordingTracks()
    recordingKind.value = ''
  }
}

function stopRecordingTracks() {
  recordingStream.value?.getTracks().forEach((track) => track.stop())
  recordingStream.value = null
}

function stopRecording() {
  if (recorder.value && recorder.value.state !== 'inactive') recorder.value.stop()
  void sendActivity('recording', false)
}

function cancelRecording() {
  cancelRecordingRequested.value = true
  if (recorder.value && recorder.value.state !== 'inactive') recorder.value.stop()
  else {
    stopRecordingTracks()
    recordingKind.value = ''
  }
  void sendActivity('recording', false)
}

function waitForIceGatheringComplete(connection) {
  if (connection.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      connection.removeEventListener('icegatheringstatechange', onState)
      resolve()
    }, 8000)
    function onState() {
      if (connection.iceGatheringState === 'complete') {
        clearTimeout(timer)
        connection.removeEventListener('icegatheringstatechange', onState)
        resolve()
      }
    }
    connection.addEventListener('icegatheringstatechange', onState)
  })
}

async function createPeerConnection(servers) {
  closePeerConnection()
  peerConnection.value = new RTCPeerConnection({ iceServers: servers || [] })
  localStream.value?.getTracks().forEach((track) => peerConnection.value.addTrack(track, localStream.value))
  peerConnection.value.ontrack = (event) => {
    remoteStream.value = event.streams[0]
    if (remoteVideoElement.value) remoteVideoElement.value.srcObject = remoteStream.value
    if (remoteAudioElement.value) remoteAudioElement.value.srcObject = remoteStream.value
  }
  peerConnection.value.onicecandidate = (event) => {
    if (event.candidate && activeCall.value) {
      void updateChatCall(activeCall.value.id, 'ice', event.candidate.toJSON()).catch((error) => console.error('ICE candidate signaling failed', error))
    }
  }
  peerConnection.value.onconnectionstatechange = () => {
    if (peerConnection.value?.connectionState === 'failed') callStatusText.value = t('messaging.callFailed')
    if (peerConnection.value?.connectionState === 'connected') callStatusText.value = t('messaging.online')
  }
  await nextTick()
  if (localVideoElement.value && localStream.value) localVideoElement.value.srcObject = localStream.value
}

async function startCall(type) {
  if (activeCall.value || incomingCall.value) return
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'VIDEO' })
    const { data } = await createChatCall(selectedConversationId.value, type)
    activeCall.value = data.call
    callStatusText.value = t('messaging.calling')
    await createPeerConnection(data.iceServers)
  } catch (error) {
    console.error('Failed to start chat call', error)
    stopLocalCallMedia()
    showError('messaging.callFailed')
  }
}

async function answerCall() {
  const offeredCall = incomingCall.value
  if (!offeredCall) return
  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true, video: offeredCall.type === 'VIDEO' })
    const { data } = await updateChatCall(offeredCall.id, 'accept')
    activeCall.value = { ...offeredCall, status: 'ACCEPTED' }
    incomingCall.value = null
    callStatusText.value = t('messaging.calling')
    await createPeerConnection(data.iceServers)
  } catch (error) {
    console.error('Failed to accept chat call', error)
    showError('messaging.callFailed')
    stopLocalCallMedia()
  }
}

async function rejectCall() {
  const call = incomingCall.value
  incomingCall.value = null
  if (call) await updateChatCall(call.id, 'reject').catch((error) => console.error('Failed to reject chat call', error))
}

async function handleCallAccepted() {
  if (!activeCall.value || activeCall.value.createdById !== currentUserId.value || !peerConnection.value) return
  try {
    callStatusText.value = t('messaging.calling')
    const offer = await peerConnection.value.createOffer()
    await peerConnection.value.setLocalDescription(offer)
    await waitForIceGatheringComplete(peerConnection.value)
    await updateChatCall(activeCall.value.id, 'offer', peerConnection.value.localDescription.toJSON())
  } catch (error) {
    console.error('Failed to create call offer', error)
    showError('messaging.callFailed')
  }
}

async function handleCallSignal(data) {
  if (!activeCall.value || data.callId !== activeCall.value.id) return
  const pc = peerConnection.value
  if (!pc) return
  try {
    if (data.action === 'offer') {
      if (isHandlingOffer) return
      isHandlingOffer = true
      await pc.setRemoteDescription(new RTCSessionDescription(data.payload))
      while (iceCandidateQueue.value.length) await pc.addIceCandidate(iceCandidateQueue.value.shift())
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await waitForIceGatheringComplete(pc)
      await updateChatCall(activeCall.value.id, 'answer', pc.localDescription.toJSON())
      callStatusText.value = t('messaging.calling')
      isHandlingOffer = false
    } else if (data.action === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data.payload))
      while (iceCandidateQueue.value.length) await pc.addIceCandidate(iceCandidateQueue.value.shift())
    } else if (data.action === 'ice') {
      const candidate = new RTCIceCandidate(data.payload)
      if (pc.remoteDescription) await pc.addIceCandidate(candidate)
      else iceCandidateQueue.value.push(candidate)
    }
  } catch (error) {
    isHandlingOffer = false
    console.error('Failed to process call signaling', error)
    callStatusText.value = t('messaging.callFailed')
  }
}

async function endCall() {
  const call = activeCall.value
  if (!call) return
  try {
    await updateChatCall(call.id, 'end')
  } catch (error) {
    console.error('Failed to end chat call', error)
  } finally {
    closeCall()
  }
}

function stopLocalCallMedia() {
  localStream.value?.getTracks().forEach((track) => track.stop())
  localStream.value = null
}

function closePeerConnection() {
  peerConnection.value?.close()
  peerConnection.value = null
  remoteStream.value = null
  iceCandidateQueue.value = []
}

function closeCall() {
  closePeerConnection()
  stopLocalCallMedia()
  activeCall.value = null
  incomingCall.value = null
  callStatusText.value = ''
}

function toggleMicrophone() {
  const track = localStream.value?.getAudioTracks()[0]
  if (track) track.enabled = !track.enabled
}

function toggleCamera() {
  const track = localStream.value?.getVideoTracks()[0]
  if (track) track.enabled = !track.enabled
}

function callerName(call) {
  return call.participants?.find((participant) => participant.userId === call.createdById)?.user?.name || ''
}

function handleRealtime(event, data) {
  if (event === 'presence.online' || event === 'presence.offline') {
    const online = event === 'presence.online'
    for (const conversation of conversations.value) {
      const member = conversation.members?.find((item) => item.id === data.userId)
      if (member) member.online = online
    }
    const person = users.value.find((item) => item.id === data.userId)
    if (person) person.online = online
    return
  }
  if (event === 'message.new' && data.message) {
    const message = data.message
    const conversation = conversations.value.find((item) => item.id === message.conversationId)
    if (conversation) {
      conversation.lastMessage = message
      if (message.senderId !== currentUserId.value && message.conversationId !== selectedConversationId.value) conversation.unreadCount = (conversation.unreadCount || 0) + 1
    }
    if (data.conversationId === selectedConversationId.value) {
      addMessage(message, message.senderId !== currentUserId.value)
    }
    return
  }
  if (event === 'message.updated' && data.message?.conversationId === selectedConversationId.value) replaceMessage(data.message)
  if (event === 'message.deleted' && data.conversationId === selectedConversationId.value) {
    const message = messages.value.find((item) => item.id === data.messageId)
    if (message) Object.assign(message, { deletedAt: new Date().toISOString(), text: null, media: null })
  }
  if (event === 'message.read' && data.conversationId === selectedConversationId.value) {
    const message = messages.value.find((item) => item.id === data.messageId)
    if (message && !message.readBy?.includes(data.userId)) message.readBy = [...(message.readBy || []), data.userId]
  }
  if (['typing.start', 'recording.start'].includes(event) && data.conversationId === selectedConversationId.value) {
    setActivity(event.startsWith('typing') ? 'typing' : 'recording', data.userId)
  }
  if (['typing.stop', 'recording.stop'].includes(event) && data.conversationId === selectedConversationId.value && activity.value?.userId === data.userId) {
    clearTimeout(activityTimer.value)
    activity.value = null
  }
  if (event === 'call.incoming' && data.call?.createdById !== currentUserId.value) {
    incomingCall.value = data.call
    const conversation = conversations.value.find((item) => item.id === data.call.conversationId)
    if (conversation) void selectConversation(conversation)
  }
  if (event === 'call.updated' && activeCall.value?.id === data.callId) {
    if (data.status === 'ACCEPTED') {
      activeCall.value.status = 'ACCEPTED'
      void handleCallAccepted()
    } else if (['REJECTED', 'MISSED', 'ENDED', 'FAILED'].includes(data.status)) {
      callStatusText.value = t('messaging.callEnded')
      closeCall()
    }
  }
  if (event === 'call.updated' && incomingCall.value?.id === data.callId && ['REJECTED', 'MISSED', 'ENDED'].includes(data.status)) {
    incomingCall.value = null
  }
  if (event === 'call.signal') void handleCallSignal(data)
}

async function restoreActiveCalls() {
  try {
    const { data } = await getActiveChatCalls()
    for (const entry of data.calls || []) {
      const call = entry.call
      if (call.createdById !== currentUserId.value && call.status === 'RINGING' && !activeCall.value) {
        incomingCall.value = call
        const conversation = conversations.value.find((item) => item.id === call.conversationId)
        if (conversation) void selectConversation(conversation)
      }
    }
  } catch (error) {
    console.error('Failed to restore active calls', error)
  }
}

watch(() => realtimeService.isConnected.value, async (connected) => {
  if (connected) {
    await loadConversations()
    if (selectedConversationId.value) await loadMessages(selectedConversationId.value)
    await restoreActiveCalls()
  }
})

const remoteVideoElement = ref(null)
const remoteAudioElement = ref(null)
const localVideoElement = ref(null)

onMounted(async () => {
  unsubscribe = realtimeService.subscribe('chat', [
    'message.new', 'message.updated', 'message.deleted', 'message.read',
    'typing.start', 'typing.stop', 'recording.start', 'recording.stop',
    'call.incoming', 'call.updated', 'call.signal'
  ], handleRealtime)
  await loadInitialData()
  await restoreActiveCalls()
})

onUnmounted(() => {
  destroyed = true
  unsubscribe?.()
  clearTimeout(typingTimer.value)
  clearTimeout(activityTimer.value)
  clearInterval(recordingTimer)
  if (recordingKind.value) void sendActivity('recording', false)
  if (selectedConversationId.value) void sendActivity('typing', false)
  if (recorder.value && recorder.value.state !== 'inactive') recorder.value.stop()
  stopRecordingTracks()
  closeCall()
  Object.values(mediaUrls.value).forEach((url) => URL.revokeObjectURL(url))
})
</script>
