import { api } from "./api"

export async function getMyPlan() {
  const { data } = await api.get("/plans/me")
  return data?.data ?? null
}

export async function getClients() {
  const { data } = await api.get("/clients")
  return data?.data ?? []
}

export async function getClientPlan(userId) {
  const { data } = await api.get(`/plans/users/${userId}`)
  return data?.data ?? null
}

export async function saveClientPlan(userId, payload) {
  const { data } = await api.put(`/plans/users/${userId}`, payload)
  return data?.data ?? null
}

export async function deleteClientPlan(userId) {
  await api.delete(`/plans/users/${userId}`)
}

export async function savePlanProgress(weekday, completedExercises) {
  const { data } = await api.post("/plans/me/progress", {
    weekday,
    completed_exercises: completedExercises,
  })
  return data?.data ?? null
}
