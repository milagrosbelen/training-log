import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Welcome from "./pages/Welcome"
import AuthenticatedLayout from "./components/AuthenticatedLayout"
import Dashboard from "./pages/Dashboard"
import Progreso from "./pages/Progreso"
import Stats from "./pages/Stats"
import Profile from "./pages/Profile"
import { isAuthenticated } from "./services/authService"

function RequireAuth() {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  return <Outlet />
}

function RequireGuest({ children }) {
  if (isAuthenticated()) return <Navigate to="/welcome" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireGuest><Login /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />
      <Route element={<RequireAuth />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/welcome" : "/"} replace />} />
    </Routes>
  )
}

export default AppRoutes
