// Auto-split from src/api.js — domain module: chat.js
import axios from 'axios'
import { BASE_URL } from './http'

const CHAT_URL = `${BASE_URL}/api/chat`

export const getChatUsers = () => axios.get(`${CHAT_URL}/users`)
export const getChatConversations = () => axios.get(`${CHAT_URL}/conversations`)
export const ensureOrganizationConversation = () => axios.post(`${CHAT_URL}/conversations/organization`)
export const createDirectConversation = (userId) => axios.post(`${CHAT_URL}/conversations/direct`, { userId })
export const getChatMessages = (conversationId, params = {}) =>
  axios.get(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/messages`, { params })
export const sendChatMessage = (conversationId, payload) =>
  axios.post(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/messages`, payload)
export const editChatMessage = (messageId, text) =>
  axios.patch(`${CHAT_URL}/messages/${encodeURIComponent(messageId)}`, { text })
export const deleteChatMessage = (messageId) =>
  axios.delete(`${CHAT_URL}/messages/${encodeURIComponent(messageId)}`)
export const markChatRead = (conversationId, messageId) =>
  axios.post(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/read`, { messageId })
export const setChatActivity = (conversationId, activity, active) =>
  axios.post(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/activity`, { activity, active })
export const uploadChatMedia = (conversationId, file, durationMs) =>
  axios.post(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/media`, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name || 'attachment'),
      ...(Number.isFinite(durationMs) ? { 'X-Media-Duration-Ms': String(durationMs) } : {})
    },
    timeout: 120000
  })
export const downloadChatMedia = (mediaId) =>
  axios.get(`${CHAT_URL}/media/${encodeURIComponent(mediaId)}`, { responseType: 'blob' })
export const getActiveChatCalls = () => axios.get(`${CHAT_URL}/calls/active`)
export const getChatCalls = (conversationId) =>
  axios.get(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/calls`)
export const createChatCall = (conversationId, type) =>
  axios.post(`${CHAT_URL}/conversations/${encodeURIComponent(conversationId)}/calls`, { type })
export const updateChatCall = (callId, action, payload) =>
  axios.patch(`${CHAT_URL}/calls/${encodeURIComponent(callId)}`, { action, ...(payload ? { payload } : {}) })
