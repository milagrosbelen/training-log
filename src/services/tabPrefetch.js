const listeners = new Set()
const seen = new Set()

export function rememberTab(path) {
  if (!path || seen.has(path)) return
  seen.add(path)
  const snapshot = new Set(seen)
  listeners.forEach((fn) => fn(snapshot))
}

export function subscribeSeenTabs(fn) {
  listeners.add(fn)
  fn(new Set(seen))
  return () => listeners.delete(fn)
}
