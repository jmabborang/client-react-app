let activeRequestCount = 0
const listeners = new Set()

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function startApiLoading() {
  activeRequestCount += 1
  emitChange()
}

export function stopApiLoading() {
  activeRequestCount = Math.max(0, activeRequestCount - 1)
  emitChange()
}

export function subscribeApiLoading(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getIsApiLoading() {
  return activeRequestCount > 0
}
