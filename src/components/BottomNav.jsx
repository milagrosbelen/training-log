import { NavLink } from "react-router-dom"
import { Home, CalendarDays, BarChart3, User } from "lucide-react"
import { rememberTab } from "../services/tabPrefetch"

const EMBER = "#FF5C00"

const items = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/plan", label: "Plan", icon: CalendarDays },
  { to: "/progreso", label: "Progreso", icon: BarChart3 },
  { to: "/profile", label: "Perfil", icon: User },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
      aria-label="Navegación principal"
    >
      <div className="bottom-dock flex items-center justify-around h-[68px] max-w-md mx-auto px-2 rounded-[28px]">
        {items.map((item) => {
          const TabIcon = item.icon
          return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            aria-label={item.label}
            onMouseEnter={() => rememberTab(item.to)}
            onFocus={() => rememberTab(item.to)}
            onTouchStart={() => rememberTab(item.to)}
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] no-underline transition-transform duration-200"
          >
            {({ isActive }) => (
              <>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-2xl transition-colors"
                  style={isActive ? { backgroundColor: "rgba(255, 92, 0, 0.18)", color: EMBER } : { color: "#7A7A80" }}
                >
                  <TabIcon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: isActive ? EMBER : "#7A7A80" }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
