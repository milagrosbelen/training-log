import { X, Calendar, Activity } from "lucide-react"
import { formatDateShort } from "../utils/dateUtils"

function CopyWorkoutModal({ workouts, selectedDate, onCopy, onClose }) {
  // Obtener los últimos entrenamientos guardados (excluyendo el día seleccionado)
  // Ordenados por fecha, más reciente primero
  const getRecentWorkouts = () => {
    return workouts
      .filter((w) => w.locked && w.date !== selectedDate) // Solo entrenamientos guardados y que no sean del día seleccionado
      .sort((a, b) => {
        // Ordenar por fecha descendente (más reciente primero)
        return b.date.localeCompare(a.date)
      })
      .slice(0, 10) // Mostrar máximo 10 entrenamientos
  }

  const recentWorkouts = getRecentWorkouts()

  const handleCopyWorkout = (workout) => {
    // Copiar el entrenamiento pero con la fecha seleccionada
    const copiedWorkout = {
      ...workout,
      date: selectedDate, // Usar la fecha seleccionada, no la original
      locked: false, // Iniciar como editable
    }

    // Generar nuevos IDs para los ejercicios para evitar conflictos
    if (copiedWorkout.exercises) {
      copiedWorkout.exercises = copiedWorkout.exercises.map((exercise, index) => ({
        ...exercise,
        id: Date.now() + index + Math.random() * 1000, // Nuevo ID único para cada ejercicio
      }))
    }

    onCopy(copiedWorkout)
  }

  const getTotalSets = (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) return 0
    return workout.exercises.reduce((total, exercise) => {
      return total + (exercise.sets || 1)
    }, 0)
  }

  const getWorkoutEmoji = (type) => {
    if (!type) return "🏋️"
    
    const typeLower = type.toLowerCase()
    
    if (typeLower.includes("pierna") || typeLower.includes("glúteo") || typeLower.includes("isquio") || typeLower.includes("cuádriceps")) {
      return "🦵"
    }
    if (typeLower.includes("espalda") || typeLower.includes("remo") || typeLower.includes("jalón")) {
      return "💪"
    }
    if (typeLower.includes("pecho") || typeLower.includes("banca") || typeLower.includes("press")) {
      return "🏋️"
    }
    if (typeLower.includes("brazo") || typeLower.includes("bíceps") || typeLower.includes("tríceps")) {
      return "💪"
    }
    if (typeLower.includes("hombro") || typeLower.includes("deltoides")) {
      return "💪"
    }
    if (typeLower.includes("core") || typeLower.includes("abdominal")) {
      return "⚡"
    }
    if (typeLower.includes("cardio") || typeLower.includes("correr") || typeLower.includes("bicicleta")) {
      return "❤️"
    }
    if (typeLower.includes("full body") || typeLower.includes("cuerpo completo")) {
      return "🔥"
    }
    
    return "🏋️"
  }

  if (recentWorkouts.length === 0) {
    return null // No mostrar modal si no hay entrenamientos anteriores
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">¿Te gustaría repetir algún entrenamiento?</h2>
            <p className="text-sm text-slate-400 mt-1">
              Selecciona un entrenamiento anterior para copiarlo al día seleccionado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de entrenamientos */}
        <div className="flex-1 overflow-y-auto p-6">
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No hay entrenamientos anteriores para copiar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <button
                  key={`${workout.date}-${workout.type}`}
                  onClick={() => handleCopyWorkout(workout)}
                  className="w-full bg-slate-700/50 hover:bg-slate-700 rounded-xl p-4 text-left transition-all duration-200 border border-slate-600/50 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getWorkoutEmoji(workout.type)}</span>
                        <h3 className="text-base font-semibold text-white truncate">
                          {workout.type || "Entrenamiento"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateShort(workout.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          <span>
                            {workout.exercises?.length || 0} ejercicio{workout.exercises?.length !== 1 ? "s" : ""} • {getTotalSets(workout)} series
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                        <span className="text-teal-400 text-sm">→</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CopyWorkoutModal

