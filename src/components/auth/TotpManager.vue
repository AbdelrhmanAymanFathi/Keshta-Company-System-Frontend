<template>
  <div class="space-y-4">
    <!-- <h3 class="text-lg font-semibold">{{ $t('profile.totpTitle') || 'Two-factor Authentication' }}</h3> -->

    <!-- Start registration -->
    <div class="bg-white p-4 rounded shadow">
      <div v-if="!registering && !temp" class="space-y-2">
        <p class="text-sm text-gray-600">{{ $t('profile.totpIntro') || 'Add an authenticator app to secure your account.' }}</p>
        <div class="flex gap-2">
          <input v-model="label" class="flex-1 border rounded px-3 py-2" :placeholder="$t('profile.deviceLabel') || 'Device label'" />
          <button @click="startRegister" class="px-4 py-2 theme-button rounded">{{ $t('labels.start') || 'Start' }}</button>
        </div>
      </div>

      <div v-if="temp" class="space-y-3">
        <div class="flex gap-4 items-start">
            <div>
            <img :src="qrSrc" alt="QR Code" v-if="qrSrc" class="w-40 h-40 bg-white border" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600">{{ $t('profile.scanQr') || 'Scan the QR using your authenticator app or copy the secret.' }}</p>
            <div class="mt-2 p-2 bg-gray-50 rounded">
              <div class="flex items-center justify-between">
                <div class="font-mono text-sm break-all">{{ temp.secret }}</div>
                <button @click="copySecret" class="theme-text text-sm">{{ $t('labels.copy') || 'Copy' }}</button>
              </div>
              <div class="mt-2 text-xs text-gray-500">{{ countdownText }}</div>
            </div>
            <div class="mt-3 flex gap-2">
              <input v-model="confirmToken" placeholder="123456" class="border rounded px-3 py-2 w-40" />
              <button @click="confirmRegister" :disabled="confirming" class="px-4 py-2 bg-green-600 text-white rounded">{{ $t('labels.confirm') || 'Confirm' }}</button>
              <button @click="cancelTemp" class="px-4 py-2 border rounded">{{ $t('labels.cancel') || 'Cancel' }}</button>
            </div>
            <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-if="registering" class="text-sm text-gray-500">{{ $t('labels.loading') || 'Loading...' }}</div>
    </div>

    <!-- Devices list -->
    <div class="bg-white p-4 rounded shadow">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-medium">{{ $t('profile.devices') || 'Devices' }}</h4>
        <button @click="loadDevices" class="text-sm theme-text">{{ $t('labels.refresh') || 'Refresh' }}</button>
      </div>
      <div v-if="loadingDevices" class="text-sm text-gray-500">{{ $t('labels.loading') || 'Loading...' }}</div>
      <ul v-else class="space-y-2">
        <li v-for="d in devices" :key="d.id" class="flex items-center justify-between border rounded p-2">
          <div>
            <div class="font-medium">{{ d.label || ('Device ' + d.id) }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(d.createdAt) }}</div>
          </div>
          <div class="flex gap-2 items-center">
            <button @click="removeDevice(d.id)" class="text-red-600 text-sm">{{ $t('labels.delete') || 'Delete' }}</button>
          </div>
        </li>
        <li v-if="devices.length === 0" class="text-sm text-gray-500">{{ $t('profile.noDevices') || 'No TOTP devices configured' }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { startTotpRegister, confirmTotpRegister, listTotpDevices, deleteTotpDevice } from '@/api'
import QRCode from 'qrcode'
import { formatDateTimeCairo } from '@/utils/dateUtils'

export default {
  name: 'TotpManager',
  setup() {
    const label = ref('')
    const temp = ref(null)
    const registering = ref(false)
    const confirming = ref(false)
    const confirmToken = ref('')
    const error = ref('')
    const devices = ref([])
    const loadingDevices = ref(false)
    const countdown = ref(0)
    let countdownTimer = null

    const startRegister = async () => {
      error.value = ''
      registering.value = true
      try {
        const payload = {}
        if (label.value) payload.label = label.value
        const res = await startTotpRegister(payload)
        // Normalize response shapes from different backends
        let body = res?.data
        if (!body) body = {}
        // Common nesting: { data: {...} } or { result: {...} }
        if (body.data && typeof body.data === 'object') body = body.data
        else if (body.result && typeof body.result === 'object') body = body.result

        // Some backends use different key names; map them into a predictable temp object
        const normalized = {
          tempId: body.tempId || body.temp_id || body.id || body.temp || null,
          secret: body.secret || body.sharedSecret || body.otpauth_secret || null,
          otpauthUrl: body.otpauthUrl || body.otpauth_url || body.otpauth || body.otpauthURI || null,
          qrDataUrl: body.qrDataUrl || body.qrData || body.qr_data_url || body.qr || null,
          ttlSeconds: body.ttlSeconds || body.ttl_seconds || body.ttl || body.ttl_s || null
        }

        temp.value = normalized

        // Immediately generate QR locally if needed
        if (normalized.qrDataUrl) {
          qrData.value = normalized.qrDataUrl
        } else if (normalized.otpauthUrl) {
          try {
            qrData.value = await QRCode.toDataURL(normalized.otpauthUrl, { margin: 1, width: 200 })
          } catch (e) {
            console.error('QRCode generation failed:', e)
            error.value = 'Failed to generate QR code'
          }
        } else {
          // No QR info available
          console.debug('[TOTP] start register response had no QR/otpauth:', res.data)
          error.value = 'No QR code data received from server'
        }

        countdown.value = normalized.ttlSeconds || 600
        startCountdown()
      } catch (e) {
        console.error(e)
        error.value = e?.response?.data?.message || 'Failed to start registration'
      } finally {
        registering.value = false
      }
    }

    const startCountdown = () => {
      clearInterval(countdownTimer)
      countdownTimer = setInterval(() => {
        if (countdown.value > 0) countdown.value -= 1
        else clearInterval(countdownTimer)
      }, 1000)
    }

    const countdownText = computed(() => {
      if (!countdown.value) return ''
      const mins = Math.floor(countdown.value / 60)
      const secs = countdown.value % 60
      return `${mins}m ${secs}s`
    })
    const qrData = ref('')

    // Watch temp and generate a QR data URL locally when otpauthUrl is available
    watch(temp, async (nv) => {
      qrData.value = ''
      if (!nv) return
      if (nv.qrDataUrl) {
        qrData.value = nv.qrDataUrl
        return
      }
      if (nv.otpauthUrl) {
        try {
          qrData.value = await QRCode.toDataURL(nv.otpauthUrl, { margin: 1, width: 200 })
        } catch (e) {
          console.error('Failed to generate QR locally:', e)
          qrData.value = ''
        }
      }
    }, { immediate: true })

    const qrSrc = computed(() => {
      if (temp.value && temp.value.qrDataUrl) return temp.value.qrDataUrl
      return qrData.value || ''
    })

    const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US'
    const formatDate = (d) => formatDateTimeCairo(d, locale)

    const copySecret = async () => {
      try {
        await navigator.clipboard.writeText(temp.value.secret || '')
        // show toast if available
        if (window.$toast) window.$toast('Secret copied', 'success')
      } catch (e) {
        console.error(e)
      }
    }

    const confirmRegister = async () => {
      if (!temp.value || !confirmToken.value) return
      confirming.value = true
      error.value = ''
      try {
        // Send temp identifier and token. Some backends also require the secret here;
        // look for common secret fields returned by the start endpoint and include only when present.
        const payload = { tempId: temp.value.tempId, token: confirmToken.value }
        // Include label (device name) so server can persist device with provided name
        if (label.value) payload.label = label.value
        else if (temp.value && temp.value.label) payload.label = temp.value.label

        // Try to detect secret from a variety of possible response keys
        const secretCandidates = [
          'secret', 'sharedSecret', 'otpauth_secret', 'secretEncrypted', 'secret_encrypted', 'secretEncryptedBase64', 'secret_b64', 'secretBase32'
        ]
        let foundSecret = null
        for (const k of secretCandidates) {
          if (temp.value && typeof temp.value[k] === 'string' && temp.value[k].length > 0) {
            foundSecret = temp.value[k]
            break
          }
        }
        if (foundSecret) payload.secret = foundSecret

        const res = await confirmTotpRegister(payload)
        // Accept 200 or 201 as success
        if (!res || (res.status !== 200 && res.status !== 201)) throw new Error('Unexpected response from server')
        // success — reload devices
        temp.value = null
        confirmToken.value = ''
        // If server returned the created device object, merge it into list for immediate feedback,
        // otherwise reload full device list.
        const created = res.data && (res.data.device || res.data.device === 0) ? res.data.device : null
        if (created && typeof created === 'object') {
          // prepend new device and ensure no duplicate ids
          devices.value = [created, ...devices.value.filter(d => d.id !== created.id)]
        } else {
          await loadDevices()
        }
        if (window.$toast) window.$toast('TOTP device added', 'success')
      } catch (e) {
        console.error('TOTP confirm error:', e, e?.response?.data)
        error.value = e?.response?.data?.message || 'Invalid token'
      } finally {
        confirming.value = false
      }
    }

    const cancelTemp = () => {
      temp.value = null
      confirmToken.value = ''
      clearInterval(countdownTimer)
    }

    const loadDevices = async () => {
      loadingDevices.value = true
      try {
        const res = await listTotpDevices()
        if (!res || res.status !== 200) throw new Error('Unexpected response from server')
        // Normalize different possible response shapes from the backend:
        // - Array directly: res.data = [{...}, ...]
        // - Wrapped: res.data.devices = [...] or res.data.data = [...]
        // - Empty object or other: fall back to []
        let list = []
        const body = res.data
        if (Array.isArray(body)) {
          list = body
        } else if (body && Array.isArray(body.devices)) {
          list = body.devices
        } else if (body && Array.isArray(body.data)) {
          list = body.data
        } else if (body && body.device && typeof body.device === 'object') {
          list = [body.device]
        } else {
          list = []
        }

        // Ensure each item is an object with expected fields
        devices.value = list.map(item => (typeof item === 'object' && item !== null) ? item : { id: item, label: String(item), createdAt: '' })
      } catch (e) {
        console.error(e)
      } finally {
        loadingDevices.value = false
      }
    }

    const removeDevice = async (id) => {
      try {
        await deleteTotpDevice(id)
        if (window.$toast) window.$toast('Device removed', 'success')
        await loadDevices()
      } catch (e) {
        console.error(e)
        if (window.$toast) window.$toast('Failed to remove device', 'error')
      }
    }

    onMounted(() => {
      loadDevices()
    })

    return {
      label,
      temp,
      registering,
      confirming,
      confirmToken,
      error,
      devices,
      loadingDevices,
      startRegister,
      confirmRegister,
      cancelTemp,
      copySecret,
      removeDevice,
      loadDevices,
      countdownText,
      qrSrc,
      formatDate
    }
  }
}
</script>

<style scoped>
img[alt="QR Code"] { background: white }
</style>
