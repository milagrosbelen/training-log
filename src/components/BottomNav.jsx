import { NavLink, Link } from "react-router-dom"
import { TrendingUp, Plus, User } from "lucide-react"

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 shadow-[0_-2px_12px_rgba(0,0,0,0.12)]"
      style={{ minHeight: "70px" }}
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-evenly h-[70px] max-w-md mx-auto px-6 sm:px-8">
        <NavLink
          to="/progreso"
          aria-label="Progreso"
          className="flex items-center justify-center flex-1 h-full !text-[#2AF447] transition-colors duration-200"
        >
          <TrendingUp
            className="w-6 h-6 flex-shrink-0"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </NavLink>

        <Link
          to="/dashboard"
          aria-label="Crear entrenamiento"
          className="flex items-center justify-center flex-shrink-0 -mt-7 w-16 h-16 rounded-full bg-[#2AF447] border-2 border-[#3dff5c] shadow-[0_0_12px_rgba(42,244,71,0.35)] transition-all duration-200 hover:bg-[#3dff5c] hover:border-[#5eff7a] hover:shadow-[0_0_16px_rgba(42,244,71,0.45)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="!text-[#0a0a0a]">
            <Plus
              className="w-8 h-8 flex-shrink-0"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </span>
        </Link>

        <NavLink
          to="/profile"
          aria-label="Perfil"
          className="flex items-center justify-center flex-1 h-full !text-[#2AF447] transition-colors duration-200"
        >
          <User
            className="w-6 h-6 flex-shrink-0"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </NavLink>
      </div>
    </nav>
  )
}
