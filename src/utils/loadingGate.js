let pending = 0
let delayTimer = null
let visible = false
const listeners = new Set()
const DELAY_MS = 400

function emit() {
  listeners.forEach((fn) => fn(visible))
}

export function subscribeLoading(fn) {
  listeners.add(fn)
  fn(visible)
  return () => listeners.delete(fn)
}

export function beginLoading() {
  pending += 1
  if (pending !== 1 || delayTimer) return
  delayTimer = window.setTimeout(() => {
    delayTimer = null
    if (pending > 0 && !visible) {
      visible = true
      emit()
    }
  }, DELAY_MS)
}

export function endLoading() {
  pending = Math.max(0, pending - 1)
  if (pending > 0) return
  if (delayTimer) {
    window.clearTimeout(delayTimer)
    delayTimer = null
  }
  if (visible) {
    visible = false
    emit()
  }
}

export function shouldTrackLoading(config) {
  if (!config || config.skipLoading) return false
  const url = String(config.url || "")
  const method = String(config.method || "get").toLowerCase()
  return method === "post" && (url.includes("/auth/login") || url.includes("/auth/pin"))
}
