import axios from "axios"

const TOKEN_KEY = "auth_token"

// En desarrollo: /api (proxy de Vite). En producción: VITE_API_URL
const baseURL = import.meta.env.VITE_API_URL || "/api"

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
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
