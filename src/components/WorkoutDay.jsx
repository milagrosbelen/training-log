import { useState, useEffect } from "react"
import { Clock, ArrowUp, Plus, Save, X } from "lucide-react"
import ExerciseCard from "./ExerciseCard"

function WorkoutDay({ date, workout, onSave, onDiscard }) {
  // Duración en horas y minutos separados
  const getDurationFromMinutes = (minutes) => {
    if (!minutes) return { hours: 0, minutes: 0 }
    return {
      hours: Math.floor(minutes / 60),
      minutes: minutes % 60,
    }
  }

  const initialDuration = getDurationFromMinutes(workout?.duration || 0)
  // Usar strings vacíos para evitar concatenación en mobile
  const [durationHours, setDurationHours] = useState(initialDuration.hours === 0 ? "" : String(initialDuration.hours))
  const [durationMinutes, setDurationMinutes] = useState(initialDuration.minutes === 0 ? "" : String(initialDuration.minutes))
  const [workoutType, setWorkoutType] = useState(workout?.type || "")
  const [exercises, setExercises] = useState(workout?.exercises || [])

  // Sincronizar estado cuando el workout cambia (útil cuando se copia un entrenamiento)
  useEffect(() => {
    if (workout) {
      const duration = getDurationFromMinutes(workout.duration || 0)
      setDurationHours(duration.hours === 0 ? "" : String(duration.hours))
      setDurationMinutes(duration.minutes === 0 ? "" : String(duration.minutes))
      setWorkoutType(workout.type || "")
      setExercises(workout.exercises || [])
    } else {
      // Si no hay workout, resetear a valores por defecto
      setDurationHours("")
      setDurationMinutes("")
      setWorkoutType("")
      setExercises([])
    }
  }, [workout])

  const addExercise = () => {
    // Crear ejercicio con nombre vacío que se puede editar directamente
    const newExercise = {
      id: Date.now(),
      name: "",
      weight: "",
      reps: "",
      sets: 1,
    }
    
    setExercises([...exercises, newExercise])
  }

  const updateExercise = (updatedExercise) => {
    setExercises(
      exercises.map((ex) => (ex.id === updatedExercise.id ? updatedExercise : ex))
    )
  }

  const deleteExercise = (exerciseId) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId))
  }

  const handleSave = () => {
    // Validar que el tipo de entrenamiento no esté vacío
    const trimmedType = workoutType.trim()
    if (!trimmedType) {
      alert("Por favor, ingresa un tipo de entrenamiento")
      return
    }

    // Convertir horas y minutos a minutos totales (convertir strings a números)
    const hours = parseInt(durationHours) || 0
    const minutes = parseInt(durationMinutes) || 0
    const totalMinutes = (hours * 60) + minutes
    
    onSave({
      date,
      type: trimmedType,
      duration: totalMinutes,
      exercises,
    })
  }

  const handleDiscard = () => {
    // Eliminado window.confirm - descartar directamente
    onDiscard()
  }

  return (
    <div className="space-y-6">
      {/* Input de Tipo de Entrenamiento - Card principal */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-300">
            Tipo de entrenamiento:
          </label>
          <input
            type="text"
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            placeholder="Ej: Glúteos + Isquios, Piernas (foco cuádriceps), Hombros + Core..."
            className="w-full bg-slate-700/50 text-white py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/50 placeholder:text-slate-500"
          />
          <p className="text-xs text-slate-400">
            Escribe libremente el tipo de entrenamiento que realizaste
          </p>
        </div>
      </div>

      {/* Card de Duración del entrenamiento - Horas y Minutos */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
        <h2 className="text-sm sm:text-base font-semibold text-white mb-1">
          Tiempo total de sesión
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-4">
          ¿Cuánto duró tu entrenamiento hoy?
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={durationHours}
              onChange={(e) => {
                const value = e.target.value
                // Permitir string vacío o números válidos
                if (value === "" || (!isNaN(value) && parseInt(value) >= 0)) {
                  setDurationHours(value)
                }
              }}
              onFocus={(e) => {
                // Limpiar el input al hacer focus si tiene valor por defecto
                if (e.target.value === "0") {
                  e.target.select()
                }
              }}
              placeholder="0"
              className="w-20 bg-slate-700/50 text-white text-sm py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/50 placeholder:text-slate-500 text-center"
              min="0"
            />
            <span className="text-xs sm:text-sm text-slate-400 font-medium">H</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => {
                const value = e.target.value
                // Permitir string vacío o números válidos entre 0 y 59
                if (value === "") {
                  setDurationMinutes("")
                } else {
                  const numValue = parseInt(value)
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 59) {
                    setDurationMinutes(value)
                  }
                }
              }}
              onFocus={(e) => {
                // Limpiar el input al hacer focus si tiene valor por defecto
                if (e.target.value === "0") {
                  e.target.select()
                }
              }}
              placeholder="0"
              className="w-20 bg-slate-700/50 text-white text-sm py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/50 placeholder:text-slate-500 text-center"
              min="0"
              max="59"
            />
            <span className="text-xs sm:text-sm text-slate-400 font-medium">MIN</span>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-900/20 rounded-xl flex items-center justify-center border border-teal-500/20 ml-auto">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Lista de Ejercicios con mejor separación */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            Lista de Ejercicios
          </h2>
          <ArrowUp className="w-4 h-4 text-slate-400" />
        </div>

        {exercises.length === 0 ? (
          <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700/30">
            <p className="text-sm text-slate-400">
              No hay ejercicios agregados. Haz clic en "Añadir Ejercicio" para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={updateExercise}
                onDelete={() => deleteExercise(exercise.id)}
              />
            ))}
          </div>
        )}

        {/* Botón Añadir Ejercicio - Mejor diseño */}
        <button
          onClick={addExercise}
          className="w-full border-2 border-dashed border-slate-600/50 text-slate-400 py-3.5 px-4 rounded-xl hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/5 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Añadir Ejercicio
        </button>
      </div>

      {/* Botones de Acción - Mejor espaciado y diseño */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-teal-500 hover:bg-teal-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Save className="w-4 h-4" />
          GUARDAR ENTRENAMIENTO
        </button>
        <button
          onClick={handleDiscard}
          className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-all duration-200 text-sm sm:text-base border border-slate-600/50 hover:border-slate-600 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Descartar
        </button>
      </div>
    </div>
  )
}

export default WorkoutDay

