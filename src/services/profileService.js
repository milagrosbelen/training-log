import { api, readStoredUserId } from "./api"

let profileCache = null
let profileCacheUserId = null
let profileCacheAt = 0
let profileInflight = null
const PROFILE_TTL = 3 * 60 * 1000
const PROFILE_STORAGE_PREFIX = "milogit_profile_"

function normalizeProfile(data) {
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

function profileStorageKey(userId) {
  return `${PROFILE_STORAGE_PREFIX}${userId}`
}

function readStoredProfile(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(profileStorageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredProfile(userId, profile) {
  if (!userId || !profile) return
  try {
    localStorage.setItem(profileStorageKey(userId), JSON.stringify(profile))
  } catch {
    // Quota / private mode.
  }
}

export function hydrateProfile(data) {
  const profile = normalizeProfile({ data })
  const userId = readStoredUserId()
  profileCache = profile
  profileCacheUserId = userId
  profileCacheAt = Date.now()
  writeStoredProfile(userId, profile)
  return profile
}

export function peekProfile() {
  const userId = readStoredUserId()
  if (!userId) return null
  if (profileCacheUserId === userId && profileCache) return profileCache
  const stored = readStoredProfile(userId)
  if (!stored) return null
  profileCache = stored
  profileCacheUserId = userId
  profileCacheAt = Date.now()
  return profileCache
}

export function clearProfileCache() {
  const userId = readStoredUserId()
  profileCache = null
  profileCacheUserId = null
  profileCacheAt = 0
  profileInflight = null
  try {
    if (userId) localStorage.removeItem(profileStorageKey(userId))
  } catch {
    // ignore
  }
}

export async function getProfileSummary({ skipLoading = false } = {}) {
  const cached = peekProfile()
  const hasCache = Boolean(cached)
  if (hasCache && Date.now() - profileCacheAt < PROFILE_TTL) {
    return cached
  }
  if (profileInflight) return hasCache ? cached : profileInflight

  profileInflight = api.get("/profile-summary", { skipLoading: skipLoading || hasCache })
    .then(({ data }) => hydrateProfile(data?.data ?? data))
    .finally(() => {
      profileInflight = null
    })

  if (hasCache) {
    profileInflight.catch(() => {})
    return cached
  }

  return profileInflight
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
