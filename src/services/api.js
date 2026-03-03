import axios from "axios"

const TOKEN_KEY = "auth_token"

// Producción: Render (si VITE_API_URL apunta a Railway, se ignora)
const RENDER_API = "https://milogit-backend-r81y.onrender.com/api"
let baseURL = import.meta.env.PROD
  ? RENDER_API
  : (import.meta.env.VITE_API_URL || "/api")
// Si es URL externa y no termina en /api, agregarlo
if (baseURL.startsWith("http") && !/\/api\/?$/.test(baseURL)) {
  baseURL = baseURL.replace(/\/?$/, "") + "/api"
}

const api = axios.create({
  baseURL,
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
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir si el 401 viene del login (credenciales incorrectas)
    const isLoginRequest = error.config?.url?.includes("/auth/login")
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export { api, TOKEN_KEY }
