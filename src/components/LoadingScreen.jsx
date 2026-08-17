import { Loader2 } from "lucide-react"
import BrandLogo from "./BrandLogo"

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <BrandLogo size="lg" className="mx-auto" />
      <Loader2
        className="mt-8 h-11 w-11 animate-spin"
        style={{ color: "#FF5C00" }}
        strokeWidth={2.4}
      />
    </div>
  )
}
