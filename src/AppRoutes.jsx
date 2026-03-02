import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AuthenticatedLayout from "./components/AuthenticatedLayout"
import Dashboard from "./pages/Dashboard"
import Progreso from "./pages/Progreso"
import Stats from "./pages/Stats"
import Profile from "./pages/Profile"
import { isAuthenticated } from "./services/authService"

function RequireAuth() {
  if (!isAuthenticated()) return <Navigate to="/" replace />
  return <AuthenticatedLayout />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/"} replace />} />
    </Routes>
  )
}

export default AppRoutes
