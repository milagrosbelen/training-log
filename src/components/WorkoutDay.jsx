import { useState, useEffect, useMemo } from "react"
import { Clock, ArrowUp, Plus, Save, X, ChevronRight } from "lucide-react"
import ExerciseCard from "./ExerciseCard"
import { getMainGroups, getMuscleGroups, getExercisesForMuscleGroup } from "../data/routines"

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
  
  /**
   * Estados para el nuevo flujo de rutinas
   * 
   * selectedMainGroup: Grupo principal seleccionado ("Tren inferior", "Tren superior", "Abdominales")
   * - null cuando no hay grupo seleccionado
   * 
   * selectedMuscleGroup: Grupo muscular seleccionado (ej: "Cuádriceps", "Pecho")
   * - null cuando no hay grupo muscular seleccionado
   * 
   * showExerciseSelector: Si mostrar el selector de ejercicios
   * - true cuando hay un grupo muscular seleccionado
   */
  const [selectedMainGroup, setSelectedMainGroup] = useState(null)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [errors, setErrors] = useState({})

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

  /**
   * useMemo: Obtiene los grupos principales disponibles
   * Siempre retorna: ["Tren inferior", "Tren superior", "Abdominales"]
   */
  const mainGroups = useMemo(() => {
    return getMainGroups()
  }, [])

  /**
   * useMemo: Obtiene los grupos musculares del grupo principal seleccionado
   * Solo calcula si hay un grupo principal seleccionado
   */
  const availableMuscleGroups = useMemo(() => {
    if (!selectedMainGroup) return []
    return getMuscleGroups(selectedMainGroup)
  }, [selectedMainGroup])

  /**
   * useMemo: Obtiene los ejercicios del grupo muscular seleccionado
   * Solo calcula si hay un grupo principal y un grupo muscular seleccionados
   */
  const availableExercises = useMemo(() => {
    if (!selectedMainGroup || !selectedMuscleGroup) return []
    return getExercisesForMuscleGroup(selectedMainGroup, selectedMuscleGroup)
  }, [selectedMainGroup, selectedMuscleGroup])

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

  const moveExerciseUp = (exerciseId) => {
    const currentIndex = exercises.findIndex((ex) => ex.id === exerciseId)
    if (currentIndex > 0) {
      const newExercises = [...exercises]
      const temp = newExercises[currentIndex]
      newExercises[currentIndex] = newExercises[currentIndex - 1]
      newExercises[currentIndex - 1] = temp
      setExercises(newExercises)
    }
  }

  const moveExerciseDown = (exerciseId) => {
    const currentIndex = exercises.findIndex((ex) => ex.id === exerciseId)
    if (currentIndex < exercises.length - 1) {
      const newExercises = [...exercises]
      const temp = newExercises[currentIndex]
      newExercises[currentIndex] = newExercises[currentIndex + 1]
      newExercises[currentIndex + 1] = temp
      setExercises(newExercises)
    }
  }

  /**
   * Función para seleccionar un grupo principal
   * 
   * ¿Qué hace?
   * - Establece el grupo principal seleccionado
   * - Limpia la selección de grupo muscular y ejercicios
   * - Oculta el selector de ejercicios
   * 
   * @param {string} mainGroup - Grupo principal ("Tren inferior", "Tren superior", "Abdominales")
   */
  const handleSelectMainGroup = (mainGroup) => {
    setSelectedMainGroup(mainGroup)
    setSelectedMuscleGroup(null)
    setShowExerciseSelector(false)
  }

  /**
   * Función para seleccionar un grupo muscular
   * 
   * ¿Qué hace?
   * - Establece el grupo muscular seleccionado
   * - Muestra el selector de ejercicios
   * 
   * @param {string} muscleGroup - Grupo muscular (ej: "Cuádriceps", "Pecho")
   */
  const handleSelectMuscleGroup = (muscleGroup) => {
    setSelectedMuscleGroup(muscleGroup)
    setShowExerciseSelector(true)
  }

  /**
   * Función para agregar un ejercicio individual a la lista
   * 
   * ¿Qué hace?
   * 1. Verifica si el ejercicio ya existe (previene duplicados)
   * 2. Si NO existe, lo agrega con nombre predefinido
   * 3. Peso, reps, sets quedan vacíos (usuario los completa)
   * 
   * @param {string} exerciseName - Nombre del ejercicio (ej: "Sentadilla")
   */
  const addSingleExercise = (exerciseName) => {
    // Verificar si el ejercicio ya existe (comparación case-insensitive)
    const exists = exercises.some(
      (ex) => ex.name && ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
    )

    // Si ya existe, no agregar (prevenir duplicados)
    if (exists) {
      return
    }

    // Crear nuevo ejercicio
    const newExercise = {
      id: Date.now() + Math.random() * 1000, // ID único
      name: exerciseName, // Nombre predefinido
      weight: "", // Usuario completa
      reps: "", // Usuario completa
      sets: 1, // Valor por defecto
    }

    // Agregar a la lista
    setExercises([...exercises, newExercise])
  }

  const handleSave = () => {
    // Limpiar errores previos
    setErrors({})
    const newErrors = {}

    // Validar que el tipo de entrenamiento no esté vacío
    const trimmedType = workoutType.trim()
    if (!trimmedType) {
      newErrors.type = "Ingresá un título para el entrenamiento"
    }

    // Validar que haya al menos un ejercicio
    if (exercises.length === 0) {
      newErrors.exercises = "Agregá al menos un ejercicio"
    } else {
      // Validar que cada ejercicio tenga datos válidos
      exercises.forEach((exercise, index) => {
        // Validar peso (debe ser número válido si está presente)
        if (exercise.weight && exercise.weight !== "") {
          const weightNum = parseFloat(exercise.weight)
          if (isNaN(weightNum) || weightNum < 0) {
            newErrors[`exercise-${index}-weight`] = "El peso debe ser un número válido"
          }
        }
        // Validar repeticiones (debe ser número válido si está presente)
        if (exercise.reps && exercise.reps !== "") {
          const repsNum = parseInt(exercise.reps)
          if (isNaN(repsNum) || repsNum < 0) {
            newErrors[`exercise-${index}-reps`] = "Las repeticiones deben ser un número válido"
          }
        }
      })
    }

    // Validar que la fecha esté presente
    if (!date || date.trim() === "") {
      newErrors.date = "Seleccioná una fecha válida"
    }

    // Si hay errores, mostrarlos y no guardar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
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

  /**
   * Calcula el tiempo total del entrenamiento en minutos
   * 
   * ¿Qué hace?
   * - Convierte las horas y minutos ingresados a minutos totales
   * - Usa los valores actuales de durationHours y durationMinutes
   * 
   * @returns {number} Tiempo total en minutos
   */
  const calculateTotalDuration = () => {
    const hours = parseInt(durationHours) || 0
    const minutes = parseInt(durationMinutes) || 0
    return (hours * 60) + minutes
  }

  /**
   * Formatea el tiempo total para mostrar al usuario
   * 
   * ¿Qué hace?
   * - Convierte minutos totales a formato legible (horas y minutos)
   * - Ejemplo: 90 minutos → "1h 30min"
   * 
   * @param {number} totalMinutes - Tiempo total en minutos
   * @returns {string} Tiempo formateado (ej: "1h 30min" o "45min")
   */
  const formatTotalDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes === 0) return "0 min"
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}min`
    }
  }

  // Calcular tiempo total usando useMemo para optimización
  const totalDuration = useMemo(() => {
    return calculateTotalDuration()
  }, [durationHours, durationMinutes])

  return (
    <div className="space-y-6">
      {/* Input de Título del Entrenamiento - Card principal */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-300">
            Título del entrenamiento:
          </label>
          <input
            type="text"
            value={workoutType}
            onChange={(e) => {
              setWorkoutType(e.target.value)
              // Limpiar error al escribir
              if (errors.type) {
                setErrors({ ...errors, type: undefined })
              }
            }}
            placeholder="Ej: Piernas + glúteos, Full body, Cardio..."
            className={`w-full bg-slate-700/50 text-white py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border ${
              errors.type ? "border-red-500/50" : "border-slate-600/50"
            } placeholder:text-slate-400`}
          />
          {errors.type ? (
            <p className="text-xs text-red-400">{errors.type}</p>
          ) : (
            <p className="text-xs text-slate-400">
              Escribe un título para identificar este entrenamiento
            </p>
          )}
        </div>
      </div>

      {/* Sección de Grupos Principales - Siempre visible */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-3">
          Lista de ejercicios
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Selecciona un grupo para ver sus ejercicios disponibles
        </p>
        
        {/* Botones de grupos principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {mainGroups.map((mainGroup) => (
            <button
              key={mainGroup}
              onClick={() => handleSelectMainGroup(mainGroup)}
              className={`
                px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-between
                ${
                  selectedMainGroup === mainGroup
                    ? "bg-teal-500 text-black shadow-md shadow-teal-500/20"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50"
                }
              `}
            >
              <span>{mainGroup}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedMainGroup === mainGroup ? "rotate-90" : ""}`} />
            </button>
          ))}
        </div>

        {/* Grupos musculares - Se muestra cuando hay un grupo principal seleccionado */}
        {selectedMainGroup && availableMuscleGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-3">
              Selecciona un grupo muscular:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableMuscleGroups.map((muscleGroup) => (
                <button
                  key={muscleGroup}
                  onClick={() => handleSelectMuscleGroup(muscleGroup)}
                  className={`
                    px-4 py-2.5 rounded-lg font-medium text-xs transition-all duration-200
                    ${
                      selectedMuscleGroup === muscleGroup
                        ? "bg-teal-500/80 text-black shadow-md shadow-teal-500/20"
                        : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-600/30"
                    }
                  `}
                >
                  {muscleGroup}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selector de ejercicios - Se muestra cuando hay un grupo muscular seleccionado */}
        {showExerciseSelector && availableExercises.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-3">
              Haz click en un ejercicio para agregarlo a tu lista:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableExercises.map((exerciseName) => {
                // Verificar si el ejercicio ya está en la lista
                const isAlreadyAdded = exercises.some(
                  (ex) => ex.name && ex.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
                )
                
                return (
                  <button
                    key={exerciseName}
                    onClick={() => addSingleExercise(exerciseName)}
                    disabled={isAlreadyAdded}
                    className={`
                      px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-left
                      ${
                        isAlreadyAdded
                          ? "bg-slate-700/20 text-slate-500 cursor-not-allowed line-through"
                          : "bg-slate-700/50 text-slate-200 hover:bg-teal-500 hover:text-black border border-slate-600/50"
                      }
                    `}
                  >
                    {exerciseName}
                    {isAlreadyAdded && <span className="ml-2 text-xs">✓ Agregado</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
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

      {/* Lista de Ejercicios Agregados */}
      {exercises.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              Ejercicios agregados
            </h2>
            <ArrowUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <div key={exercise.id}>
                <ExerciseCard
                  exercise={exercise}
                  onUpdate={updateExercise}
                  onDelete={() => deleteExercise(exercise.id)}
                  onMoveUp={() => moveExerciseUp(exercise.id)}
                  onMoveDown={() => moveExerciseDown(exercise.id)}
                  canMoveUp={index > 0}
                  canMoveDown={index < exercises.length - 1}
                  errors={{
                    weight: errors[`exercise-${index}-weight`],
                    reps: errors[`exercise-${index}-reps`],
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay ejercicios */}
      {exercises.length === 0 && (
        <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700/30">
          <p className="text-sm text-slate-400">
            Selecciona un grupo arriba y luego un ejercicio para comenzar.
          </p>
        </div>
      )}

      {/* Mensaje de error si no hay ejercicios */}
      {errors.exercises && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-sm text-red-400">{errors.exercises}</p>
        </div>
      )}

      {/* Botón Añadir Ejercicio Manual (opcional) */}
      <div className="pt-2">
        <button
          onClick={addExercise}
          className="w-full border-2 border-dashed border-slate-600/50 text-slate-400 py-3.5 px-4 rounded-xl hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/5 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Añadir Ejercicio Manual
        </button>
      </div>

      {/* Tiempo Total del Entrenamiento */}
      {totalDuration > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Tiempo Total
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {formatTotalDuration(totalDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

