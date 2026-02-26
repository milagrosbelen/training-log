import { useState, useEffect } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { ChevronLeft, Plus } from "lucide-react"
import Calendar from "../components/Calendar"
import WorkoutDay from "../components/WorkoutDay"
import WorkoutSummary from "../components/WorkoutSummary"
import MonthlySummary from "../components/MonthlySummary"
import CopyWorkoutModal from "../components/CopyWorkoutModal"
import ProgressCharts from "../components/ProgressCharts"
import Toast from "../components/Toast"
import { getWorkouts, saveWorkout, deleteWorkout } from "../services/workoutService"
import { logout, isAuthenticated } from "../services/authService"
import { getRandomQuote, emptyStateQuotes, successQuotes, workoutDayQuotes } from "../utils/motivationalQuotes"

function Dashboard() {
  const navigate = useNavigate()
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [currentView, setCurrentView] = useState("calendar")
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth())
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear())
  const [editingDate, setEditingDate] = useState(null)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [copiedWorkout, setCopiedWorkout] = useState(null)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState("")

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  const loadWorkouts = async () => {
    setError("")
    setLoading(true)
    try {
      const data = await getWorkouts()
      setWorkouts(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err.response?.data?.message ?? "Error al cargar los entrenamientos."
      setError(msg)
      setWorkouts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setCurrentView("calendar")
    if (editingDate !== date) {
      setEditingDate(null)
      setCopiedWorkout(null)
    }
    const existingWorkout = workouts.find((w) => w.date === date && w.locked)
    if (!existingWorkout && workouts.some((w) => w.locked)) {
      setShowCopyModal(true)
    } else {
      setShowCopyModal(false)
    }
  }

  const handleSaveWorkout = async (workoutData) => {
    setError("")
    setSaving(true)
    try {
      const saved = await saveWorkout(workoutData)
      const existingIndex = workouts.findIndex((w) => w.date === saved.date)
      let updated
      if (existingIndex >= 0) {
        updated = [...workouts]
        updated[existingIndex] = saved
      } else {
        updated = [...workouts, saved]
      }
      setWorkouts(updated)
      setCopiedWorkout(null)
      setEditingDate(null)
      setToast({ message: `Entrenamiento guardado correctamente. ${getRandomQuote(successQuotes)}`, type: "success" })
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.errors
        ? Object.values(err.response.data.errors || {}).flat().join(" ")
        : "Error al guardar el entrenamiento"
      setToast({ message: msg, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardWorkout = () => {
    setEditingDate(null)
    setCopiedWorkout(null)
    const currentWorkout = workouts.find((w) => w.date === selectedDate)
    if (!currentWorkout || !currentWorkout.locked) {
      setSelectedDate("")
    }
  }

  const getCurrentWorkout = () => {
    return workouts.find((w) => w.date === selectedDate) || null
  }

  const handleEditWorkout = () => {
    setEditingDate(selectedDate)
  }

  const handleDeleteWorkout = async () => {
    const currentWorkout = getCurrentWorkout()
    if (!currentWorkout?.id) return
    if (!window.confirm("¿Estás seguro de que querés eliminar este entrenamiento?")) return
    try {
      await deleteWorkout(currentWorkout.id)
      setWorkouts(workouts.filter((w) => w.id !== currentWorkout.id))
      setSelectedDate("")
      setEditingDate(null)
      setToast({ message: "Entrenamiento eliminado correctamente", type: "success" })
    } catch (err) {
      setToast({ message: err.response?.data?.message ?? "Error al eliminar", type: "error" })
    }
  }

  const handleCopyWorkout = (workoutToCopy) => {
    setShowCopyModal(false)
    setCopiedWorkout(workoutToCopy)
    setEditingDate(selectedDate)
  }

  const handleCloseCopyModal = () => {
    setShowCopyModal(false)
  }

  const shouldShowSummary = () => {
    if (!selectedDate) return false
    const currentWorkout = getCurrentWorkout()
    return currentWorkout && currentWorkout.locked && editingDate !== selectedDate
  }

  const getWorkoutForEditing = () => {
    if (copiedWorkout && copiedWorkout.date === selectedDate) return copiedWorkout
    return getCurrentWorkout()
  }

  const handleViewSummary = () => {
    setCurrentView("summary")
    setSummaryMonth(new Date().getMonth())
    setSummaryYear(new Date().getFullYear())
  }

  const handleBackToCalendar = () => {
    setCurrentView("calendar")
    setSelectedDate("")
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch {
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">MiLogit</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => { setCurrentView("calendar"); setSelectedDate("") }}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === "calendar"
                    ? "bg-teal-500 text-black shadow-md shadow-teal-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Entrenamientos
              </button>
              <button
                onClick={handleViewSummary}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === "summary"
                    ? "bg-teal-500 text-black shadow-md shadow-teal-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Progreso
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-slate-400">Cargando entrenamientos...</p>
          </div>
        ) : currentView === "calendar" ? (
          <div className="space-y-6">
            {workouts.length === 0 && !selectedDate ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                    Todavía no registraste entrenamientos
                  </h2>
                  <p className="text-base sm:text-lg text-slate-400">Empezá agregando tu primer día 💪</p>
                  <p className="text-sm text-slate-500 italic mt-2">{getRandomQuote(emptyStateQuotes)}</p>
                </div>
                <button
                  onClick={() => handleDateSelect(new Date().toISOString().split("T")[0])}
                  className="bg-teal-500 hover:bg-teal-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-teal-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Agregar mi primer entrenamiento
                </button>
              </div>
            ) : (
              <>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  workouts={workouts}
                />
                {!selectedDate && (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">Elegí un día del calendario y registrá tu entrenamiento 💪</p>
                  </div>
                )}
                {selectedDate && (
                  <div className="space-y-6 pt-2 border-t border-slate-700/50">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-white">
                        {shouldShowSummary() ? "Entrenamiento guardado" : "Entrenamiento del día"}
                      </h2>
                      {!shouldShowSummary() && (
                        <p className="text-xs text-slate-500 italic mt-1">{getRandomQuote(workoutDayQuotes)}</p>
                      )}
                    </div>
                    {shouldShowSummary() ? (
                      <WorkoutSummary
                        workout={getCurrentWorkout()}
                        allWorkouts={workouts}
                        onEdit={handleEditWorkout}
                        onDelete={handleDeleteWorkout}
                      />
                    ) : (
                      <WorkoutDay
                        date={selectedDate}
                        workout={getWorkoutForEditing()}
                        onSave={handleSaveWorkout}
                        onDiscard={handleDiscardWorkout}
                      />
                    )}
                  </div>
                )}
              </>
            )}
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
            <MonthlySummary workouts={workouts} month={summaryMonth} year={summaryYear} />
            <div className="border-t border-slate-700/50 pt-6">
              <ProgressCharts workouts={workouts} />
            </div>
          </div>
        )}
      </main>

      {showCopyModal && (
        <CopyWorkoutModal
          workouts={workouts}
          selectedDate={selectedDate}
          onCopy={handleCopyWorkout}
          onClose={handleCloseCopyModal}
        />
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}

export default Dashboard
