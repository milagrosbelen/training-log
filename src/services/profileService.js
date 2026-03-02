import { api } from "./api"

/**
 * Obtiene el resumen del perfil del usuario (info + estadísticas).
 */
export async function getProfileSummary() {
  const { data } = await api.get("/profile-summary")
  const payload = data?.data ?? data
  return {
    user: payload?.user ?? null,
    totalWorkouts: payload?.total_workouts ?? 0,
    totalDuration: payload?.total_duration ?? 0,
    lastWorkout: payload?.last_workout ?? null,
    mostFrequentType: payload?.most_frequent_type ?? null,
    history: Array.isArray(payload?.history) ? payload.history : [],
    focusAnalytics: payload?.focus_analytics ?? null,
  }
}

/**
 * Obtiene solo el foco del usuario (ligero).
 */
export async function getFocus() {
  const { data } = await api.get("/profile/focus")
  const payload = data?.data ?? data
  return payload?.focus ?? null
}

/**
 * Actualiza el foco del usuario.
 * @param {string|null} focus
 */
export async function updateFocus(focus) {
  const { data } = await api.patch("/profile/focus", {
    focus: focus == null || focus === "" ? null : String(focus).trim(),
  })
  const payload = data?.data ?? data
  return payload?.focus ?? null
}

/**
 * Actualiza el perfil del usuario (nombre y/o avatar).
 * @param {{ name: string, avatar?: File }} data
 */
export async function updateProfile({ name, avatar }) {
  const formData = new FormData()
  formData.append("name", name)
  if (avatar instanceof File) {
    formData.append("avatar", avatar)
  }

  const { data } = await api.put("/profile", formData)

  const payload = data?.data ?? data
  return payload?.user ?? null
}
