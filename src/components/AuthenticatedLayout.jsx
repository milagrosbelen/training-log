import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import BottomNav from "./BottomNav"
import { prefetchAlumnaData } from "../services/prefetch"

export default function AuthenticatedLayout() {
  useEffect(() => {
    prefetchAlumnaData()
  }, [])

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}
