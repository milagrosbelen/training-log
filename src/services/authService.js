import { api, TOKEN_KEY, USER_KEY } from "./api"
import { clearPlanCache, clearCoachCaches } from "./planService"
import { clearWorkoutsCache } from "./workoutService"
import { clearProfileCache } from "./profileService"
import { clearAlumnasCache } from "./alumnaService"

function persistUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

function persistSession(data) {
  const token = (data?.token ?? data?.data?.token)?.trim?.() ?? data?.token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  const user = data?.user ?? data?.data?.user
  persistUser(user)
  return data
}

export async function login(email, password) {
  const { data } = await api.post("/auth/login", {
    email: email?.trim()?.toLowerCase(),
    password,
  })
  return persistSession(data)
}

export async function loginWithPin(username, pin, role = "alumna") {
  const { data } = await api.post("/auth/pin", {
    username: username?.trim()?.toLowerCase(),
    pin: String(pin ?? "").trim(),
    role: role === "coach" ? "coach" : "client",
  })
  return persistSession(data)
}

export async function logout() {
  try {
    await api.post("/auth/logout", null, { skipLoading: true })
  } finally {
    clearPlanCache()
    clearCoachCaches()
    clearWorkoutsCache()
    clearProfileCache()
    clearAlumnasCache()
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isCoach(user = getStoredUser()) {
  return user?.role === "coach"
}

export async function getCurrentUser() {
  const { data } = await api.get("/user", { skipLoading: true })
  const user = data ?? null
  persistUser(user)
  return user
}
