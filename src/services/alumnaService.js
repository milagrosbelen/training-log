import { api, readStoredUserId } from "./api"

let alumnasCache = null
let alumnasCacheUserId = null
let alumnasCacheAt = 0
let alumnasInflight = null
const TTL = 3 * 60 * 1000

export function peekAlumnas() {
  const userId = readStoredUserId()
  if (!userId || alumnasCacheUserId !== userId || !Array.isArray(alumnasCache)) return null
  return alumnasCache
}

export function clearAlumnasCache() {
  alumnasCache = null
  alumnasCacheUserId = null
  alumnasCacheAt = 0
  alumnasInflight = null
}

function setAlumnasCache(list) {
  alumnasCache = list
  alumnasCacheUserId = readStoredUserId()
  alumnasCacheAt = Date.now()
  return list
}

export async function getAlumnas() {
  const userId = readStoredUserId()
  if (
    Array.isArray(alumnasCache)
    && alumnasCacheUserId === userId
    && Date.now() - alumnasCacheAt < TTL
  ) {
    return alumnasCache
  }
  if (alumnasInflight) return alumnasInflight

  alumnasInflight = api.get("/alumnas")
    .then(({ data }) => setAlumnasCache(data?.data ?? []))
    .finally(() => {
      alumnasInflight = null
    })

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
