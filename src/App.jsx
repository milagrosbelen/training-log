import { useState, useEffect } from "react"
import { ChevronLeft, Plus } from "lucide-react"
import Calendar from "./components/Calendar"
import WorkoutDay from "./components/WorkoutDay"
import WorkoutSummary from "./components/WorkoutSummary"
import MonthlySummary from "./components/MonthlySummary"
import CopyWorkoutModal from "./components/CopyWorkoutModal"
import ProgressCharts from "./components/ProgressCharts"
import Toast from "./components/Toast"
import { getRandomQuote, emptyStateQuotes, successQuotes, workoutDayQuotes } from "./utils/motivationalQuotes"

function App() {
  const [workouts, setWorkouts] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [currentView, setCurrentView] = useState("calendar") // "calendar", "summary"
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth())
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear())
  const [editingDate, setEditingDate] = useState(null) // Fecha que está siendo editada
  const [showCopyModal, setShowCopyModal] = useState(false) // Mostrar modal de copiar entrenamiento
  const [copiedWorkout, setCopiedWorkout] = useState(null) // Entrenamiento copiado temporalmente (aún no guardado)
  const [toast, setToast] = useState(null) // Estado para el toast (message, type)

  // Cargar entrenamientos desde localStorage al iniciar
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts")
    if (savedWorkouts) {
      try {
        setWorkouts(JSON.parse(savedWorkouts))
      } catch (error) {
        console.error("Error al cargar entrenamientos:", error)
      }
    }
  }, [])

  // Guardar entrenamientos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts))
  }, [workouts])

  const handleDateSelect = (date) => {
    // Seleccionar el día sin cambiar de vista - se mostrará debajo del calendario
    setSelectedDate(date)
    setCurrentView("calendar") // Mantener vista de calendario
    // Si cambiamos de fecha, salir del modo edición y limpiar workout copiado
    if (editingDate !== date) {
      setEditingDate(null)
      setCopiedWorkout(null)
    }

    // Verificar si el día seleccionado tiene entrenamiento guardado
    const existingWorkout = workouts.find((w) => w.date === date && w.locked)
    
    // Si no hay entrenamiento guardado y hay entrenamientos anteriores, mostrar modal
    if (!existingWorkout && workouts.some((w) => w.locked)) {
      setShowCopyModal(true)
    } else {
      setShowCopyModal(false)
    }
  }

  const handleSaveWorkout = (workoutData) => {
    try {
      const existingIndex = workouts.findIndex((w) => w.date === workoutData.date)

      // Guardar con locked: true (entrenamiento guardado permanentemente)
      const workoutToSave = {
        ...workoutData,
        locked: true,
      }

      if (existingIndex >= 0) {
        // Actualizar entrenamiento existente
        const updatedWorkouts = [...workouts]
        updatedWorkouts[existingIndex] = workoutToSave
        setWorkouts(updatedWorkouts)
        const quote = getRandomQuote(successQuotes)
        setToast({ message: `Entrenamiento actualizado correctamente. ${quote}`, type: "success" })
      } else {
        // Agregar nuevo entrenamiento
        setWorkouts([...workouts, workoutToSave])
        const quote = getRandomQuote(successQuotes)
        setToast({ message: `Entrenamiento guardado correctamente. ${quote}`, type: "success" })
      }

      // Limpiar workout copiado temporal
      setCopiedWorkout(null)
      
      // Salir del modo edición
      setEditingDate(null)
      // No limpiar selectedDate - mantener seleccionado para ver el entrenamiento guardado
    } catch (error) {
      setToast({ message: "Error al guardar el entrenamiento", type: "error" })
    }
  }

  const handleDiscardWorkout = () => {
    // Al descartar, salir del modo edición y limpiar workout copiado
    setEditingDate(null)
    setCopiedWorkout(null)
    // Si no hay entrenamiento guardado, limpiar selección
    const currentWorkout = workouts.find((w) => w.date === selectedDate)
    if (!currentWorkout || !currentWorkout.locked) {
      setSelectedDate("")
    }
  }

  const getCurrentWorkout = () => {
    return workouts.find((w) => w.date === selectedDate) || null
  }

  const handleEditWorkout = () => {
    // Habilitar modo edición para la fecha seleccionada
    setEditingDate(selectedDate)
  }

  const handleDeleteWorkout = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este entrenamiento?")) {
      try {
        const updatedWorkouts = workouts.filter((w) => w.date !== selectedDate)
        setWorkouts(updatedWorkouts)
        setSelectedDate("")
        setEditingDate(null)
        setToast({ message: "Entrenamiento eliminado correctamente", type: "success" })
      } catch (error) {
        setToast({ message: "Error al eliminar el entrenamiento", type: "error" })
      }
    }
  }

  const handleCopyWorkout = (workoutToCopy) => {
    // Cerrar el modal
    setShowCopyModal(false)
    
    // Guardar el entrenamiento copiado temporalmente (no en localStorage todavía)
    setCopiedWorkout(workoutToCopy)
    
    // Habilitar modo edición
    setEditingDate(selectedDate)
  }

  const handleCloseCopyModal = () => {
    setShowCopyModal(false)
  }

  // Determinar si debemos mostrar el resumen o el formulario de edición
  const shouldShowSummary = () => {
    if (!selectedDate) return false
    const currentWorkout = getCurrentWorkout()
    // Mostrar resumen si hay entrenamiento guardado Y no está en modo edición
    return currentWorkout && currentWorkout.locked && editingDate !== selectedDate
  }

  // Obtener workout para edición (incluye entrenamientos copiados temporalmente)
  const getWorkoutForEditing = () => {
    // Si hay un workout copiado temporalmente, usarlo
    if (copiedWorkout && copiedWorkout.date === selectedDate) {
      return copiedWorkout
    }
    
    // Si no, usar el workout existente
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

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Header/Navigation - Mejorado con mejor espaciado y sombra */}
      <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              MiLogit
            </h1>
            <nav className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setCurrentView("calendar")
                  setSelectedDate("")
                }}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === "calendar"
                    ? "bg-neon-500 text-black shadow-md shadow-neon-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Entrenamientos
              </button>
              <button
                onClick={handleViewSummary}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === "summary"
                    ? "bg-neon-500 text-black shadow-md shadow-neon-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                Progreso
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Contenedor centrado con padding responsive */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === "calendar" && (
          <div className="space-y-6">
            {/* Estado vacío cuando no hay entrenamientos */}
            {workouts.length === 0 && !selectedDate ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                    Todavía no registraste entrenamientos
                  </h2>
                  <p className="text-base sm:text-lg text-slate-400">
                    Empezá agregando tu primer día 💪
                  </p>
                  <p className="text-sm text-slate-500 italic mt-2">
                    {getRandomQuote(emptyStateQuotes)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0]
                    handleDateSelect(today)
                  }}
                  className="bg-neon-500 hover:bg-neon-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-neon-500/20 hover:shadow-neon-500/30 hover:scale-[1.02] active:scale-[0.98]"
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
                
                {/* Guía visual cuando no hay día seleccionado */}
                {!selectedDate && (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">
                      Elegí un día del calendario y registrá tu entrenamiento 💪
                    </p>
                  </div>
                )}
                
                {/* Sección de Registro del Día - Directamente debajo del calendario */}
                {selectedDate && (
                  <div className="space-y-6 pt-2 border-t border-slate-700/50">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-white">
                        {shouldShowSummary() ? "Entrenamiento guardado" : "Entrenamiento del día"}
                      </h2>
                      {!shouldShowSummary() && (
                        <p className="text-xs text-slate-500 italic mt-1">
                          {getRandomQuote(workoutDayQuotes)}
                        </p>
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
        )}

        {currentView === "summary" && (
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
            />
            {/* Separador visual entre resumen mensual y gráficos */}
            <div className="border-t border-slate-700/50 pt-6">
              <ProgressCharts workouts={workouts} />
            </div>
          </div>
        )}
      </main>

      {/* Modal de Copiar Entrenamiento */}
      {showCopyModal && (
        <CopyWorkoutModal
          workouts={workouts}
          selectedDate={selectedDate}
          onCopy={handleCopyWorkout}
          onClose={handleCloseCopyModal}
        />
      )}

      {/* Toast de feedback */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}

export default App
