import { useEffect } from "react"
import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import Login from "./pages/Login"
import AuthenticatedLayout from "./components/AuthenticatedLayout"
import AdminLayout from "./components/AdminLayout"
import {
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
  isCoach,
  logout,
} from "./services/authService"
import { warmupApi } from "./services/api"
import OrangeGrain from "./components/OrangeGrain"
import LoadingOverlay from "./components/LoadingOverlay"

function homeForUser(user = getStoredUser()) {
  return isCoach(user) ? "/admin" : "/dashboard"
}

function RequireGuest({ children }) {
  if (!isAuthenticated()) return children
  return <Navigate to={homeForUser()} replace />
}

function RequireAlumna() {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  if (isCoach()) return <Navigate to="/admin" replace />
  return <Outlet />
}

function RequireAdmin() {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  if (!isCoach()) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function AppRoutes() {
  useEffect(() => {
    warmupApi()
    if (!isAuthenticated()) return
    getCurrentUser().catch((err) => {
      if (err.response?.status === 401) logout()
    })
  }, [])

  return (
    <>
      <OrangeGrain />
      <LoadingOverlay />
      <Routes>
        <Route path="/" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/acceso" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/welcome" element={<Navigate to={isAuthenticated() ? homeForUser() : "/"} replace />} />

        <Route element={<RequireAlumna />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={null} />
            <Route path="/plan" element={null} />
            <Route path="/progreso" element={null} />
            <Route path="/stats" element={null} />
            <Route path="/profile" element={null} />
          </Route>
        </Route>

        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={null} />
            <Route path="/admin/plan" element={null} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={!isAuthenticated() ? "/" : homeForUser()} replace />}
        />
      </Routes>
    </>
  )
}
