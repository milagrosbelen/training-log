import { useEffect } from "react"
import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import Login from "./pages/Login"
import LoginAdmin from "./pages/LoginAdmin"
import AuthenticatedLayout from "./components/AuthenticatedLayout"
import AdminLayout from "./components/AdminLayout"
import Dashboard from "./pages/Dashboard"
import Plan from "./pages/Plan"
import Progreso from "./pages/Progreso"
import Stats from "./pages/Stats"
import Profile from "./pages/Profile"
import AdminAlumnas from "./pages/AdminAlumnas"
import CoachPlanEditor from "./components/plan/CoachPlanEditor"
import {
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
  isCoach,
  logout,
} from "./services/authService"
import OrangeGrain from "./components/OrangeGrain"

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
  if (!isAuthenticated()) return <Navigate to="/acceso" replace />
  if (!isCoach()) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function AppRoutes() {
  useEffect(() => {
    if (!isAuthenticated()) return
    getCurrentUser().catch((err) => {
      if (err.response?.status === 401) logout()
    })
  }, [])

  return (
    <>
      <OrangeGrain />
      <Routes>
        <Route path="/" element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/acceso" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/welcome" element={<Navigate to={isAuthenticated() ? homeForUser() : "/"} replace />} />

        <Route element={<RequireAlumna />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/progreso" element={<Progreso />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminAlumnas />} />
            <Route path="/admin/plan" element={<CoachPlanEditor />} />
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
