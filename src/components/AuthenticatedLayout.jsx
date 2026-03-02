import { Outlet } from "react-router-dom"
import BottomNav from "./BottomNav"

/**
 * Layout para rutas autenticadas.
 * BottomNav solo en mobile. Sin header fijo dentro de la app.
 */
export default function AuthenticatedLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}
