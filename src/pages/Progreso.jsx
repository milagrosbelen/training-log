import { Navigate } from "react-router-dom"
import AlumnaProgressView from "../components/progress/AlumnaProgressView"
import { isAuthenticated } from "../services/authService"

export default function Progreso() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  return <AlumnaProgressView />
}
