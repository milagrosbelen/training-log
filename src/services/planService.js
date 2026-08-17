import { api, readStoredUserId } from "./api"

let planCache = undefined
let planCacheUserId = null
let planCacheAt = 0
let planInflight = null
const PLAN_TTL = 3 * 60 * 1000
const PLAN_STORAGE_PREFIX = "milogit_plan_"

function planStorageKey(userId) {
  return `${PLAN_STORAGE_PREFIX}${userId}`
}

function readStoredPlan(userId) {
  if (!userId) return undefined
  try {
    const raw = localStorage.getItem(planStorageKey(userId))
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function writeStoredPlan(userId, plan) {
  if (!userId) return
  try {
    if (plan == null) {
      localStorage.removeItem(planStorageKey(userId))
      return
    }
    localStorage.setItem(planStorageKey(userId), JSON.stringify(plan))
  } catch {
    // Quota / private mode: keep going with memory cache only.
  }
}

function rememberPlan(plan) {
  const userId = readStoredUserId()
  planCache = plan ?? null
  planCacheUserId = userId
  planCacheAt = Date.now()
  writeStoredPlan(userId, planCache)
  return planCache
}

function isAuthError(err) {
  const status = err?.response?.status
  return status === 401 || status === 403
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function requestMyPlan(skipLoading) {
  const { data } = await api.get("/plans/me", { skipLoading, timeout: 60000 })
  return data?.data ?? null
}

let clientsCache = null
let clientsCacheUserId = null
let clientsCacheAt = 0
let clientsInflight = null
let clientPlans = new Map()
let clientPlansInflight = new Map()

export function peekPlan() {
  const userId = readStoredUserId()
  if (!userId) return undefined
  if (planCacheUserId === userId && planCache !== undefined) return planCache
  const stored = readStoredPlan(userId)
  if (stored === undefined) return undefined
  planCache = stored
  planCacheUserId = userId
  planCacheAt = Date.now()
  return planCache
}

export function clearPlanCache() {
  const userId = readStoredUserId()
  planCache = undefined
  planCacheUserId = null
  planCacheAt = 0
  planInflight = null
  try {
    if (userId) localStorage.removeItem(planStorageKey(userId))
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PLAN_STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // ignore
  }
}

export async function getMyPlan({ skipLoading = false } = {}) {
  const userId = readStoredUserId()
  const hasCache = planCacheUserId === userId && planCache !== undefined
  if (hasCache && Date.now() - planCacheAt < PLAN_TTL) {
    return planCache
  }
  if (planInflight) return planInflight

  const silent = skipLoading || hasCache || peekPlan() !== undefined

  planInflight = (async () => {
    let lastError = null
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const plan = await requestMyPlan(silent)
        return rememberPlan(plan)
      } catch (err) {
        lastError = err
        if (isAuthError(err)) throw err
        if (attempt < 2) await wait(1200 * (attempt + 1))
      }
    }
    const cached = peekPlan()
    if (cached !== undefined) return cached
    throw lastError
  })().finally(() => {
    planInflight = null
  })

  return planInflight
}

export async function getClients({ skipLoading = false } = {}) {
  const userId = readStoredUserId()
  const hasCache = Array.isArray(clientsCache) && clientsCacheUserId === userId
  if (hasCache && Date.now() - clientsCacheAt < PLAN_TTL) {
    return clientsCache
  }
  if (clientsInflight) return clientsInflight

  clientsInflight = api.get("/clients", { skipLoading: skipLoading || hasCache })
    .then(({ data }) => {
      clientsCache = data?.data ?? []
      clientsCacheUserId = readStoredUserId()
      clientsCacheAt = Date.now()
      return clientsCache
    })
    .finally(() => {
      clientsInflight = null
    })

  return clientsInflight
}

export function peekClients() {
  const userId = readStoredUserId()
  if (!userId || clientsCacheUserId !== userId || !Array.isArray(clientsCache)) return null
  return clientsCache
}

export function peekClientPlan(alumnaId) {
  const key = String(alumnaId)
  if (!clientPlans.has(key)) return undefined
  return clientPlans.get(key)
}

export async function getClientPlan(userId) {
  const key = String(userId)
  if (clientPlans.has(key)) return clientPlans.get(key)
  if (clientPlansInflight.has(key)) return clientPlansInflight.get(key)

  const request = api.get(`/plans/users/${userId}`)
    .then(({ data }) => {
      const plan = data?.data ?? null
      clientPlans.set(key, plan)
      return plan
    })
    .finally(() => {
      clientPlansInflight.delete(key)
    })

  clientPlansInflight.set(key, request)
  return request
}

export async function saveClientPlan(userId, payload) {
  const { data } = await api.put(`/plans/users/${userId}`, payload)
  const plan = data?.data ?? null
  clientPlans.set(String(userId), plan)
  if (Array.isArray(clientsCache)) {
    clientsCache = clientsCache.map((client) =>
      String(client.id) === String(userId) ? { ...client, has_plan: true } : client
    )
    clientsCacheAt = Date.now()
  }
  return plan
}

export async function deleteClientPlan(userId) {
  await api.delete(`/plans/users/${userId}`)
  clientPlans.set(String(userId), null)
  if (Array.isArray(clientsCache)) {
    clientsCache = clientsCache.map((client) =>
      String(client.id) === String(userId) ? { ...client, has_plan: false } : client
    )
    clientsCacheAt = Date.now()
  }
}

export function clearCoachCaches() {
  clientsCache = null
  clientsCacheUserId = null
  clientsCacheAt = 0
  clientsInflight = null
  clientPlans = new Map()
  clientPlansInflight = new Map()
}

export async function savePlanProgress(weekday, completedExercises) {
  const { data } = await api.post("/plans/me/progress", {
    weekday,
    completed_exercises: completedExercises,
  })
  return rememberPlan(data?.data ?? planCache)
}
