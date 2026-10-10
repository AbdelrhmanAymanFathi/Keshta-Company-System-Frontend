import { ref } from 'vue'
import { getUserPreference, saveUserPreference } from '@/api'

const KEY = 'presenceEnabled'

export const presenceEnabled = ref(true)
export const presenceSettingsLoaded = ref(false)

let everLoaded = false

export async function loadPresenceSettings() {
  if (everLoaded) return presenceEnabled.value
  everLoaded = true
  try {
    const res = await getUserPreference(KEY)
    const value = res?.data?.value
    presenceEnabled.value = value === true || value === 'true'
  } catch (e) {
    presenceEnabled.value = true
  }
  presenceSettingsLoaded.value = true
  return presenceEnabled.value
}

export async function savePresenceSettings(value) {
  presenceEnabled.value = !!value
  presenceSettingsLoaded.value = true
  everLoaded = true
  try {
    await saveUserPreference(KEY, presenceEnabled.value)
  } catch (e) {
    // Persistence is best-effort; the live toggle still applies for this session.
  }
  return presenceEnabled.value
}