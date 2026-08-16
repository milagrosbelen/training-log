import { api, readStoredUserId } from "./api"

let planCache = undefined
let planCacheUserId = null
let planCacheAt = 0
let planInflight = null
const PLAN_TTL = 3 * 60 * 1000

let clientsCache = null
let clientsCacheUserId = null
let clientsCacheAt = 0
let clientsInflight = null
let clientPlans = new Map()
let clientPlansInflight = new Map()

export function peekPlan() {
  const userId = readStoredUserId()
  if (!userId || planCacheUserId !== userId) return undefined
  return planCache
}

export function clearPlanCache() {
  planCache = undefined
  planCacheUserId = null
  planCacheAt = 0
  planInflight = null
}

export async function getMyPlan() {
  const userId = readStoredUserId()
  if (
    planCacheUserId === userId
    && planCache !== undefined
    && Date.now() - planCacheAt < PLAN_TTL
  ) {
    return planCache
  }
  if (planInflight) return planInflight

  planInflight = api.get("/plans/me")
    .then(({ data }) => {
      planCache = data?.data ?? null
      planCacheUserId = readStoredUserId()
      planCacheAt = Date.now()
      return planCache
    })
    .finally(() => {
      planInflight = null
    })

  return planInflight
}

export async function getClients() {
  const userId = readStoredUserId()
  if (
    Array.isArray(clientsCache)
    && clientsCacheUserId === userId
    && Date.now() - clientsCacheAt < PLAN_TTL
  ) {
    return clientsCache
  }
  if (clientsInflight) return clientsInflight

  clientsInflight = api.get("/clients")
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
  planCache = data?.data ?? planCache
  planCacheUserId = readStoredUserId()
  planCacheAt = Date.now()
  return data?.data ?? null
}
