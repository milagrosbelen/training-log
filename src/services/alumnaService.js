import { api, readStoredUserId } from "./api"

let alumnasCache = null
let alumnasCacheUserId = null
let alumnasCacheAt = 0
let alumnasInflight = null
const TTL = 3 * 60 * 1000
const ALUMNAS_STORAGE_PREFIX = "milogit_alumnas_"

function alumnasStorageKey(userId) {
  return `${ALUMNAS_STORAGE_PREFIX}${userId}`
}

function readStoredAlumnas(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(alumnasStorageKey(userId))
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStoredAlumnas(userId, list) {
  if (!userId) return
  try {
    localStorage.setItem(alumnasStorageKey(userId), JSON.stringify(list))
  } catch {
    // Quota / private mode.
  }
}

export function hydrateAlumnas(list) {
  return setAlumnasCache(Array.isArray(list) ? list : [])
}

export function peekAlumnas() {
  const userId = readStoredUserId()
  if (!userId) return null
  if (alumnasCacheUserId === userId && Array.isArray(alumnasCache)) return alumnasCache
  const stored = readStoredAlumnas(userId)
  if (!stored) return null
  alumnasCache = stored
  alumnasCacheUserId = userId
  alumnasCacheAt = Date.now()
  return alumnasCache
}

export function clearAlumnasCache() {
  const userId = readStoredUserId()
  alumnasCache = null
  alumnasCacheUserId = null
  alumnasCacheAt = 0
  alumnasInflight = null
  try {
    if (userId) localStorage.removeItem(alumnasStorageKey(userId))
  } catch {
    // ignore
  }
}

function setAlumnasCache(list) {
  alumnasCache = list
  alumnasCacheUserId = readStoredUserId()
  alumnasCacheAt = Date.now()
  writeStoredAlumnas(alumnasCacheUserId, list)
  return list
}

export async function getAlumnas({ skipLoading = false } = {}) {
  const cached = peekAlumnas()
  const hasCache = Array.isArray(cached)
  if (hasCache && Date.now() - alumnasCacheAt < TTL) {
    return cached
  }
  if (alumnasInflight) return hasCache ? cached : alumnasInflight

  alumnasInflight = api.get("/alumnas", { skipLoading: skipLoading || hasCache })
    .then(({ data }) => setAlumnasCache(data?.data ?? []))
    .finally(() => {
      alumnasInflight = null
    })

  if (hasCache) {
    alumnasInflight.catch(() => {})
    return cached
  }

  return alumnasInflight
}

export async function createAlumna(payload) {
  const { data } = await api.post("/alumnas", payload)
  const created = data?.data
  if (created && Array.isArray(alumnasCache)) {
    setAlumnasCache([...alumnasCache, created])
  } else {
    clearAlumnasCache()
  }
  return data
}

export async function updateAlumna(id, payload) {
  const { data } = await api.put(`/alumnas/${id}`, payload)
  const updated = data?.data
  if (updated && Array.isArray(alumnasCache)) {
    setAlumnasCache(alumnasCache.map((item) => (item.id === id ? { ...item, ...updated } : item)))
  }
  return data
}
