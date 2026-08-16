import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { ClipboardList, LogOut, Users } from "lucide-react"
import { logout } from "../services/authService"
import { prefetchCoachData } from "../services/prefetch"
const EMBER = "#FF4F2A"

const items = [
  { to: "/admin", label: "Alumnas", icon: Users, end: true },
  { to: "/admin/plan", label: "Planes", icon: ClipboardList, end: false },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    prefetchCoachData()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/acceso", { replace: true })
  }

  return (
    <div className="min-h-screen text-white pb-32">
      <header className="px-5 pt-8 pb-4 max-w-lg mx-auto">
        <p className="text-[11px] font-medium tracking-[0.28em] text-slate-500 uppercase">MILOGIT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Panel</h1>
      </header>
      <main className="max-w-lg mx-auto px-5">
        <Outlet />
      </main>
      <nav className="fixed bottom-4 left-4 right-4 z-50" aria-label="Navegación del panel">
        <div className="bottom-dock flex items-center justify-around h-[68px] max-w-lg mx-auto px-2 rounded-[28px]">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-col items-center justify-center gap-1 min-w-[72px] no-underline transition-transform duration-200"
            >
              {({ isActive }) => (
                <>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-2xl transition-colors"
                    style={isActive ? { backgroundColor: "rgba(255, 79, 42, 0.18)", color: EMBER } : { color: "#7A7A80" }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: isActive ? EMBER : "#7A7A80" }}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 min-w-[72px] text-[#7A7A80] hover:text-[#FF4F2A] transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl">
              <LogOut className="w-5 h-5" strokeWidth={1.8} />
            </span>
            <span className="text-[11px] font-semibold">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
