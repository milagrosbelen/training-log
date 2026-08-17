import axios from "axios"
import { beginLoading, endLoading, shouldTrackLoading } from "../utils/loadingGate"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

// Producción (Vercel): siempre /api en el mismo origen. vercel.json hace proxy a Render.
// Así no hay CORS aunque exista VITE_API_URL apuntando a una URL vieja.
function resolveBaseURL() {
  if (import.meta.env.PROD) {
    return "/api"
  }
  let url = import.meta.env.VITE_API_URL || "/api"
  if (url.startsWith("http") && !/\/api\/?$/.test(url)) {
    url = url.replace(/\/?$/, "") + "/api"
  }
  return url
}

const baseURL = resolveBaseURL()

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    // Axios: si url empieza con /, REEMPLAZA el path del baseURL (ej: /api se pierde)
    // Por eso /auth/login → x.com/auth/login en vez de x.com/api/auth/login
    if (config.url?.startsWith("/") && baseURL.startsWith("http")) {
      config.url = config.url.slice(1)
    }
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (shouldTrackLoading(config)) beginLoading()
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    if (shouldTrackLoading(response.config)) endLoading()
    return response
  },
  (error) => {
    if (shouldTrackLoading(error.config)) endLoading()
    // No redirigir si el 401 viene del login (credenciales incorrectas)
    const isLoginRequest =
      error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/pin")
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export function readStoredUserId() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw)?.id ?? null : null
  } catch {
    return null
  }
}

export function apiErrorMessage(err, fallback = "Los datos son incorrectos.") {
  if (!err.response) {
    return "No se pudo conectar con el servidor. En el celular abrí la app en la misma Wi‑Fi que la PC, no el link de Vercel."
  }
  const status = err.response.status
  if (status === 404 || status >= 500) {
    return "El servidor no está disponible ahora. Probá de nuevo en un rato o usá la app en la PC."
  }
  return err.response.data?.message ?? fallback
}

export { api, TOKEN_KEY, USER_KEY }

let warmupPromise = null

export function warmupApi() {
  if (!warmupPromise) {
    warmupPromise = api.get("/ping", { skipLoading: true }).catch(() => {}).finally(() => {
      warmupPromise = null
    })
  }
  return warmupPromise
}
