import { useState, useEffect } from "react"
import { Navigate, Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import HomeInicio from "../components/HomeInicio"
import AlumnaProgressView from "../components/progress/AlumnaProgressView"
import { ToastHost } from "../components/Toast"
import BrandLogo from "../components/BrandLogo"
import { getWorkouts, peekWorkouts } from "../services/workoutService"
import { getStoredUser, isAuthenticated } from "../services/authService"
import { rememberTab } from "../services/tabPrefetch"

function Dashboard() {
  const [workouts, setWorkouts] = useState(() => peekWorkouts() || [])
  const [selectedDate, setSelectedDate] = useState("")
  const [currentView, setCurrentView] = useState("calendar")
  const [toast, setToast] = useState(null)
  const [error, setError] = useState("")
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) return
    getWorkouts()
      .then((data) => setWorkouts(Array.isArray(data) ? data : []))
      .catch((err) => {
        setError(err.response?.data?.message ?? "Error al cargar los entrenamientos.")
      })
  }, [authenticated])

  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setCurrentView("calendar")
  }

  const handleViewSummary = () => {
    setCurrentView("summary")
  }

  const handleBackToCalendar = () => {
    setCurrentView("calendar")
    setSelectedDate("")
  }

  return (
    <div className="min-h-screen bg-ink text-white relative z-10">
      <header className="hidden md:flex bg-ink-200/95 backdrop-blur-sm border-b border-white/5 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <BrandLogo size="wide" />
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => { setCurrentView("calendar"); setSelectedDate("") }}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === "calendar"
                    ? "bg-ember text-white shadow-ember-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Entrenamientos
              </button>
              <button
                onClick={handleViewSummary}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === "summary"
                    ? "bg-ember text-white shadow-ember-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Progreso
              </button>
              <Link
                to="/plan"
                onMouseEnter={() => rememberTab("/plan")}
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                Plan
              </Link>
              <Link
                to="/profile"
                onMouseEnter={() => rememberTab("/profile")}
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                Perfil
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {currentView === "calendar" ? (
          <div className="space-y-6">
            <HomeInicio
              userName={getStoredUser()?.name}
              workouts={Array.isArray(workouts) ? workouts : []}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
          </div>
        ) : (
          <div>
            <button
              onClick={handleBackToCalendar}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group px-1 mb-2"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver al inicio</span>
            </button>
            <AlumnaProgressView workouts={Array.isArray(workouts) ? workouts : []} />
          </div>
        )}
      </main>

      <ToastHost toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default Dashboard
