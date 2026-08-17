import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { ClipboardList, LogOut, Users } from "lucide-react"
import { logout } from "../services/authService"
import { prefetchCoachData } from "../services/prefetch"
import AdminAlumnas from "../pages/AdminAlumnas"
import CoachPlanEditor from "./plan/CoachPlanEditor"

const BLAZE = "#FF5C00"

const items = [
  { to: "/admin", label: "Alumnas", icon: Users, end: true },
  { to: "/admin/plan", label: "Planes", icon: ClipboardList, end: false },
]

const TABS = [
  { path: "/admin", Page: AdminAlumnas },
  { path: "/admin/plan", Page: CoachPlanEditor },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    prefetchCoachData()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <main className="max-w-lg mx-auto px-5">
        {TABS.map((tab) => {
          const TabPage = tab.Page
          return (
            <div key={tab.path} hidden={pathname !== tab.path} aria-hidden={pathname !== tab.path}>
              <TabPage />
            </div>
          )
        })}
      </main>
      <nav className="fixed bottom-4 left-4 right-4 z-50" aria-label="Navegación del panel">
        <div className="bottom-dock flex items-center justify-around h-[68px] max-w-lg mx-auto px-2 rounded-[28px] bg-black/80 border border-white/10">
          {items.map((item) => {
            const TabIcon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex flex-col items-center justify-center gap-1 min-w-[72px] no-underline transition-transform duration-200"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-2xl transition-colors"
                      style={isActive ? { backgroundColor: "rgba(255, 92, 0, 0.18)", color: BLAZE } : { color: "#7A7A80" }}
                    >
                      <TabIcon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: isActive ? BLAZE : "#7A7A80" }}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 min-w-[72px] text-[#7A7A80] hover:text-[#FF5C00] transition-colors"
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
