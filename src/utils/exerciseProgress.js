/**
 * Utilidades para calcular el progreso de ejercicios
 */

/**
 * Calcula el volumen total de un ejercicio
 * @param {Object} exercise - Objeto ejercicio con weight, reps, sets
 * @returns {number} Volumen total (peso × repeticiones × series)
 */
export function calculateExerciseVolume(exercise) {
  if (!exercise) return 0
  
  const weight = parseFloat(exercise.weight) || 0
  const reps = parseInt(exercise.reps) || 0
  const sets = parseInt(exercise.sets) || 1
  
  return weight * reps * sets
}

/**
 * Busca el último ejercicio previo con el mismo nombre (case-insensitive)
 * @param {Object} currentExercise - Ejercicio actual
 * @param {string} currentDate - Fecha del entrenamiento actual (YYYY-MM-DD)
 * @param {Array} allWorkouts - Array de todos los entrenamientos guardados
 * @returns {Object|null} Último ejercicio previo encontrado o null
 */
export function findLastExerciseOccurrence(currentExercise, currentDate, allWorkouts) {
  if (!currentExercise || !currentExercise.name || !allWorkouts) return null
  
  const exerciseName = currentExercise.name.trim().toLowerCase()
  if (!exerciseName) return null
  
  // Filtrar entrenamientos anteriores a la fecha actual
  const previousWorkouts = allWorkouts
    .filter(workout => workout.date < currentDate && workout.locked)
    .sort((a, b) => b.date.localeCompare(a.date)) // Ordenar por fecha descendente
  
  // Buscar el último ejercicio con el mismo nombre
  for (const workout of previousWorkouts) {
    if (!workout.exercises || workout.exercises.length === 0) continue
    
    for (const exercise of workout.exercises) {
      if (exercise.name && exercise.name.trim().toLowerCase() === exerciseName) {
        return exercise
      }
    }
  }
  
  return null
}

/**
 * Obtiene el estado de progreso de un ejercicio comparando el peso con el entrenamiento anterior
 * @param {Object} currentExercise - Ejercicio actual
 * @param {string} currentDate - Fecha del entrenamiento actual (YYYY-MM-DD)
 * @param {Array} allWorkouts - Array de todos los entrenamientos guardados
 * @returns {Object} { status: "improved" | "same" | "worse" | "first", previousWeight: number, currentWeight: number }
 */
export function getExerciseProgressStatus(currentExercise, currentDate, allWorkouts) {
  if (!currentExercise || !currentDate || !allWorkouts) {
    return { status: "first", previousWeight: 0, currentWeight: 0 }
  }
  
  // Obtener el peso actual (convertir a número)
  const currentWeight = parseFloat(currentExercise.weight) || 0
  
  // Buscar el último ejercicio previo con el mismo nombre
  const lastExercise = findLastExerciseOccurrence(currentExercise, currentDate, allWorkouts)
  
  // Si no hay ejercicio previo, es el primer registro
  if (!lastExercise) {
    return { status: "first", previousWeight: 0, currentWeight }
  }
  
  // Obtener el peso del ejercicio anterior (convertir a número)
  const previousWeight = parseFloat(lastExercise.weight) || 0
  
  // Comparar pesos
  if (currentWeight > previousWeight) {
    return { status: "improved", previousWeight, currentWeight }
  } else if (currentWeight === previousWeight) {
    return { status: "same", previousWeight, currentWeight }
  } else {
    return { status: "worse", previousWeight, currentWeight }
  }
}





