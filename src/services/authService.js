import { api, TOKEN_KEY } from "./api"

export async function login(email, password) {
  const { data } = await api.post("/auth/login", {
    email: email?.trim()?.toLowerCase(),
    password,
  })
  const token = (data?.token ?? data?.data?.token)?.trim?.() ?? data?.token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  return data
}

export async function register({ name, email, password, password_confirmation }) {
  const { data } = await api.post("/auth/register", {
    name: name?.trim(),
    email: email?.trim()?.toLowerCase(),
    password,
    password_confirmation,
  })
  const token = (data?.token ?? data?.data?.token)?.trim?.() ?? data?.token
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
  return data
}

export async function logout() {
  try {
    await api.post("/auth/logout")
  } finally {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return !!getToken()
}

export async function getCurrentUser() {
  const { data } = await api.get("/user")
  return data ?? null
}
