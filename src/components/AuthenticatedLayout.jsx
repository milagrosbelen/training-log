import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import BottomNav from "./BottomNav"
import { prefetchAlumnaData } from "../services/prefetch"

export default function AuthenticatedLayout() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      prefetchAlumnaData()
    }, 250)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}
