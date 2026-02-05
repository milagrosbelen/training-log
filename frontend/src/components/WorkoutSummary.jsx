import { Clock, Edit, Trash2 } from "lucide-react"
import { formatDateLong } from "../utils/dateUtils"
import { getExerciseProgressStatus } from "../utils/exerciseProgress"

function WorkoutSummary({ workout, allWorkouts, onEdit, onDelete }) {

  const formatDuration = (minutes) => {
    if (!minutes) return "0 min"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const getWorkoutEmoji = (type) => {
    if (!type) return "🏋️"
    
    const typeLower = type.toLowerCase()
    
    // Detectar emoji basado en palabras clave en el texto libre
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
    
    // Emoji genérico por defecto
    return "🏋️"
  }

  const getWorkoutTitle = (type) => {
    if (!type || type.trim() === "") {
      return "Entrenamiento"
    }
    return type
  }

  const getProgressIndicator = (exercise) => {
    if (!allWorkouts || !workout) return null
    
    const progress = getExerciseProgressStatus(exercise, workout.date, allWorkouts)
    
    // Si es primer registro, mostrar solo mensaje simple
    if (progress.status === "first") {
      return (
        <span className="text-xs font-medium text-teal-400 flex items-center gap-1.5 mt-0.5">
          <span className="text-base">🆕</span>
          <span>Primer registro</span>
        </span>
      )
    }
    
    // Determinar color, icono y etiqueta según estado general
    const statusConfig = {
      improved: {
        color: "text-green-400",
        icon: "bg-green-400",
        shadow: "shadow-green-400/50",
        label: "Mejoró"
      },
      same: {
        color: "text-yellow-400",
        icon: "bg-yellow-400",
        shadow: "shadow-yellow-400/50",
        label: "Sin cambios"
      },
      worse: {
        color: "text-red-400",
        icon: "bg-red-400",
        shadow: "shadow-red-400/50",
        label: "Empeoró"
      }
    }
    
    const config = statusConfig[progress.status] || statusConfig.same
    
    return (
      <span className={`text-xs font-medium ${config.color} flex items-center gap-1.5 mt-0.5`}>
        <span className={`w-2.5 h-2.5 rounded-full ${config.icon} shadow-sm ${config.shadow}`}></span>
        <span>{config.label}: {progress.comparisonDetails.reason}</span>
      </span>
    )
  }

  if (!workout) return null

  return (
    <div className="space-y-6">
      {/* Header con título y fecha */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <span>{getWorkoutEmoji(workout.type)}</span>
              <span>{getWorkoutTitle(workout.type)}</span>
            </h2>
            <p className="text-sm text-slate-400">{formatDateLong(workout.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600/50">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium text-white">{formatDuration(workout.duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ejercicios */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
          Ejercicios Realizados
        </h3>

        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <div
                key={exercise.id || index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-1">
                      {exercise.name || "Ejercicio sin nombre"}
                    </h4>
                    {getProgressIndicator(exercise)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Peso</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {exercise.weight ? `${exercise.weight} kg` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Repeticiones</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {exercise.reps || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Series</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {exercise.sets || 1}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700/30">
            <p className="text-sm text-slate-400">No hay ejercicios registrados para este entrenamiento.</p>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-teal-500 hover:bg-teal-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Edit className="w-4 h-4" />
          Modificar
        </button>
        <button
          onClick={onDelete}
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-medium rounded-xl transition-all duration-200 text-sm sm:text-base border border-red-500/30 hover:border-red-500/50 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default WorkoutSummary

