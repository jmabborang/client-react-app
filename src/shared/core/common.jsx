const DEVICE_ID_STORAGE_KEY = 'auth.deviceId'

export const generateUuid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const getOrCreateDeviceId = () => {
  try {
    const existingDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (existingDeviceId) {
      return existingDeviceId
    }

    const nextDeviceId = generateUuid()
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId)
    return nextDeviceId
  } catch {
    return generateUuid()
  }
}

export const getDeviceName = () => {
  if (typeof navigator === 'undefined') {
    return 'Unknown Device'
  }

  const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown Platform'
  const browser = navigator.userAgentData?.brands?.map((brand) => brand.brand).join(', ') || navigator.userAgent || 'Unknown Browser'

  return `${platform} (${browser})`
}

export const getIpAddress = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data?.ip || null
  } catch {
    return null
  }
}
