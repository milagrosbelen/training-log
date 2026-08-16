import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import Login from "./pages/Login"
import LoginAdmin from "./pages/LoginAdmin"
import Welcome from "./pages/Welcome"
import AuthenticatedLayout from "./components/AuthenticatedLayout"
import AdminLayout from "./components/AdminLayout"
import Dashboard from "./pages/Dashboard"
import Plan from "./pages/Plan"
import Progreso from "./pages/Progreso"
import Stats from "./pages/Stats"
import Profile from "./pages/Profile"
import AdminAlumnas from "./pages/AdminAlumnas"
import CoachPlanEditor from "./components/plan/CoachPlanEditor"
import { isAuthenticated, isCoach, getStoredUser } from "./services/authService"
import OrangeGrain from "./components/OrangeGrain"

function RequireGuest({ children }) {
  if (!isAuthenticated()) return children
  return <Navigate to={isCoach() ? "/admin" : "/welcome"} replace />
}

function RequireAlumna() {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  if (isCoach()) return <Navigate to="/admin" replace />
  return <Outlet />
}

function RequireAdmin() {
  if (!isAuthenticated()) return <Navigate to="/acceso" replace />
  if (!isCoach()) return <Navigate to="/welcome" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <>
      <OrangeGrain />
      <Routes>
          <Route path="/" element={<RequireGuest><Login /></RequireGuest>} />
          <Route path="/acceso" element={<RequireGuest><LoginAdmin /></RequireGuest>} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          <Route element={<RequireAlumna />}>
            <Route path="/welcome" element={<Welcome />} />
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
            element={
              <Navigate
                to={
                  !isAuthenticated()
                    ? "/"
                    : isCoach(getStoredUser())
                      ? "/admin"
                      : "/welcome"
                }
                replace
              />
            }
          />
        </Routes>
    </>
  )
}

export default AppRoutes
