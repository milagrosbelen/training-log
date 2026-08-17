import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import BottomNav from "./BottomNav"
import Dashboard from "../pages/Dashboard"
import Plan from "../pages/Plan"
import Progreso from "../pages/Progreso"
import Profile from "../pages/Profile"
import { prefetchAlumnaData } from "../services/prefetch"
import { rememberTab, subscribeSeenTabs } from "../services/tabPrefetch"

const TABS = [
  { path: "/dashboard", Page: Dashboard },
  { path: "/plan", Page: Plan },
  { path: "/progreso", Page: Progreso },
  { path: "/stats", Page: Progreso },
  { path: "/profile", Page: Profile },
]

export default function AuthenticatedLayout() {
  const { pathname } = useLocation()
  const seenRef = useRef(new Set([pathname]))
  const [seen, setSeen] = useState(() => new Set([pathname]))

  useEffect(() => {
    rememberTab(pathname)
  }, [pathname])

  useEffect(() => subscribeSeenTabs((next) => {
    seenRef.current = next
    setSeen(next)
  }), [])

  useEffect(() => {
    prefetchAlumnaData()
  }, [])

  return (
    <>
      {TABS.filter((tab) => seen.has(tab.path)).map((tab) => {
        const TabPage = tab.Page
        return (
          <div
            key={tab.path}
            hidden={pathname !== tab.path}
            aria-hidden={pathname !== tab.path}
          >
            <TabPage />
          </div>
        )
      })}
      <BottomNav />
    </>
  )
}
