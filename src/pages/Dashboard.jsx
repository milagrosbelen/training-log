import { useState, useEffect } from "react"
import { Navigate, Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import HomeInicio from "../components/HomeInicio"
import MonthlySummary from "../components/MonthlySummary"
import ProgressCharts from "../components/ProgressCharts"
import { ToastHost } from "../components/Toast"
import { getWorkouts } from "../services/workoutService"
import { getStoredUser, isAuthenticated } from "../services/authService"

function Dashboard() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [currentView, setCurrentView] = useState("calendar")
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth())
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear())
  const [toast, setToast] = useState(null)
  const [error, setError] = useState("")
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) return
    let cancelled = false
    async function loadWorkouts() {
      setError("")
      setLoading(true)
      try {
        const data = await getWorkouts()
        if (!cancelled) setWorkouts(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message ?? "Error al cargar los entrenamientos."
          setError(msg)
          setWorkouts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadWorkouts()
    return () => {
      cancelled = true
    }
  }, [authenticated])

  if (!authenticated) {
    return <Navigate to="/" replace />
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setCurrentView("calendar")
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const handleMonthPrev = () => {
    setSummaryMonth((m) => {
      if (m <= 0) {
        setSummaryYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }

  const handleMonthNext = () => {
    if (summaryYear === currentYear && summaryMonth === currentMonth) return
    setSummaryMonth((m) => {
      if (m >= 11) {
        setSummaryYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }

  const canGoNext = !(summaryYear === currentYear && summaryMonth === currentMonth)

  const handleViewSummary = () => {
    setCurrentView("summary")
    setSummaryMonth(currentMonth)
    setSummaryYear(currentYear)
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
            <span className="text-xl font-bold text-ember [text-shadow:0_0_20px_rgba(235,87,61,0.4)] tracking-wide">MiLogit</span>
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
                className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                Plan
              </Link>
              <Link
                to="/profile"
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

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <div className="w-8 h-8 border-2 border-ink-400 border-t-ember rounded-full animate-spin" />
            <p className="text-slate-300">Cargando entrenamientos...</p>
          </div>
        ) : currentView === "calendar" ? (
          <div className="space-y-6">
            <HomeInicio
              userName={getStoredUser()?.name}
              workouts={Array.isArray(workouts) ? workouts : []}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={handleBackToCalendar}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver al calendario</span>
            </button>
            <MonthlySummary
              workouts={workouts}
              month={summaryMonth}
              year={summaryYear}
              onMonthPrev={handleMonthPrev}
              onMonthNext={handleMonthNext}
              canGoNext={canGoNext}
            />
            <div className="border-t border-slate-700/50 pt-6">
              <ProgressCharts
                workouts={workouts}
                monthWorkouts={workouts.filter((w) => {
                  if (!w?.date) return false
                  const [y, m] = w.date.split("-").map(Number)
                  return m - 1 === summaryMonth && y === summaryYear
                })}
              />
            </div>
          </div>
        )}
      </main>

      <ToastHost toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default Dashboard
