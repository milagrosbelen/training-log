import { api } from "./api"

export async function getAlumnas() {
  const { data } = await api.get("/alumnas")
  return data?.data ?? []
}

export async function createAlumna(payload) {
  const { data } = await api.post("/alumnas", payload)
  return data
}

export async function updateAlumna(id, payload) {
  const { data } = await api.put(`/alumnas/${id}`, payload)
  return data
}
