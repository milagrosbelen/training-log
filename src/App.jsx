import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import Calendar from "./components/Calendar"
import WorkoutDay from "./components/WorkoutDay"
import WorkoutSummary from "./components/WorkoutSummary"
import MonthlySummary from "./components/MonthlySummary"
import CopyWorkoutModal from "./components/CopyWorkoutModal"

function App() {
  const [workouts, setWorkouts] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [currentView, setCurrentView] = useState("calendar") // "calendar", "summary"
  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth())
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear())
  const [editingDate, setEditingDate] = useState(null) // Fecha que está siendo editada
  const [showCopyModal, setShowCopyModal] = useState(false) // Mostrar modal de copiar entrenamiento
  const [copiedWorkout, setCopiedWorkout] = useState(null) // Entrenamiento copiado temporalmente (aún no guardado)

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
    } else {
      // Agregar nuevo entrenamiento
      setWorkouts([...workouts, workoutToSave])
    }

    // Limpiar workout copiado temporal
    setCopiedWorkout(null)
    
    // Salir del modo edición
    setEditingDate(null)
    // No limpiar selectedDate - mantener seleccionado para ver el entrenamiento guardado
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
      const updatedWorkouts = workouts.filter((w) => w.date !== selectedDate)
      setWorkouts(updatedWorkouts)
      setSelectedDate("")
      setEditingDate(null)
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header/Navigation - Mejorado con mejor espaciado y sombra */}
      <header className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              FitnessLog
            </h1>
            <nav className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setCurrentView("calendar")
                  setSelectedDate("")
                }}
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
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Contenedor centrado con padding responsive */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === "calendar" && (
          <div className="space-y-6">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              workouts={workouts}
            />
            
            {/* Sección de Registro del Día - Directamente debajo del calendario */}
            {selectedDate && (
              <div className="space-y-6 pt-2 border-t border-slate-700/50">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {shouldShowSummary() ? "Entrenamiento guardado" : "Entrenamiento del día"}
                </h2>
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
    </div>
  )
}

export default App
