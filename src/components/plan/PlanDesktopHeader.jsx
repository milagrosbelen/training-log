import { Link } from "react-router-dom"

export default function PlanDesktopHeader() {
  return (
    <header className="hidden md:flex bg-ink-100 border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-md mx-auto w-full px-5 h-14 flex items-center justify-between">
        <Link to="/admin" className="text-sm text-slate-500 hover:text-white">
          Panel
        </Link>
        <span className="text-sm text-ember font-medium">Plan</span>
        <Link to="/admin" className="text-sm text-slate-500 hover:text-white">
          Alumnas
        </Link>
      </div>
    </header>
  )
}
