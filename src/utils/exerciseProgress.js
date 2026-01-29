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
 * Obtiene el estado de progreso general de un ejercicio comparando peso, repeticiones y series
 * con el entrenamiento anterior usando lógica jerárquica:
 * - Si el peso cambia, ese cambio determina el rendimiento
 * - Si el peso es igual, se evalúan repeticiones y series
 * 
 * @param {Object} currentExercise - Ejercicio actual
 * @param {string} currentDate - Fecha del entrenamiento actual (YYYY-MM-DD)
 * @param {Array} allWorkouts - Array de todos los entrenamientos guardados
 * @returns {Object} {
 *   status: "improved" | "same" | "worse" | "first",
 *   previousWeight: number,
 *   currentWeight: number,
 *   weightDifference: number,
 *   previousReps: number,
 *   currentReps: number,
 *   repsDifference: number,
 *   previousSets: number,
 *   currentSets: number,
 *   setsDifference: number,
 *   comparisonDetails: {
 *     weightChanged: boolean,
 *     repsChanged: boolean,
 *     setsChanged: boolean,
 *     reason: string
 *   }
 * }
 */
export function getExerciseProgressStatus(currentExercise, currentDate, allWorkouts) {
  if (!currentExercise || !currentDate || !allWorkouts) {
    return { 
      status: "first", 
      previousWeight: 0, 
      currentWeight: 0,
      weightDifference: 0,
      previousReps: 0,
      currentReps: 0,
      repsDifference: 0,
      previousSets: 0,
      currentSets: 0,
      setsDifference: 0,
      comparisonDetails: {
        weightChanged: false,
        repsChanged: false,
        setsChanged: false,
        reason: "sin datos previos"
      }
    }
  }
  
  // Extraer valores actuales
  const currentWeight = parseFloat(currentExercise.weight) || 0
  const currentReps = parseInt(currentExercise.reps) || 0
  const currentSets = parseInt(currentExercise.sets) || 1
  
  // Buscar el último ejercicio previo con el mismo nombre
  const lastExercise = findLastExerciseOccurrence(currentExercise, currentDate, allWorkouts)
  
  // Si no hay ejercicio previo, es el primer registro
  if (!lastExercise) {
    return { 
      status: "first", 
      previousWeight: 0, 
      currentWeight,
      weightDifference: currentWeight,
      previousReps: 0,
      currentReps,
      repsDifference: currentReps,
      previousSets: 0,
      currentSets,
      setsDifference: currentSets,
      comparisonDetails: {
        weightChanged: currentWeight > 0,
        repsChanged: currentReps > 0,
        setsChanged: currentSets > 0,
        reason: "primer registro"
      }
    }
  }
  
  // Extraer valores anteriores
  const previousWeight = parseFloat(lastExercise.weight) || 0
  const previousReps = parseInt(lastExercise.reps) || 0
  const previousSets = parseInt(lastExercise.sets) || 1
  
  // Calcular diferencias
  const weightDiff = currentWeight - previousWeight
  const repsDiff = currentReps - previousReps
  const setsDiff = currentSets - previousSets
  
  // LÓGICA DE COMPARACIÓN JERÁRQUICA
  
  let status
  let reason
  
  // Caso 1: Peso cambió (tiene prioridad absoluta)
  if (weightDiff > 0) {
    status = "improved"
    reason = `peso +${weightDiff.toFixed(1)}kg`
  } else if (weightDiff < 0) {
    status = "worse"
    reason = `peso ${weightDiff.toFixed(1)}kg`
  } 
  // Caso 2: Peso igual, evaluar reps y series
  else {
    const repsImproved = repsDiff > 0
    const setsImproved = setsDiff > 0
    const repsWorsened = repsDiff < 0
    const setsWorsened = setsDiff < 0
    
    if (repsImproved || setsImproved) {
      status = "improved"
      if (repsImproved && setsImproved) {
        reason = `reps +${repsDiff}, series +${setsDiff} (peso igual)`
      } else if (repsImproved) {
        reason = `reps +${repsDiff} (peso igual)`
      } else {
        reason = `series +${setsDiff} (peso igual)`
      }
    } else if (repsWorsened || setsWorsened) {
      status = "worse"
      if (repsWorsened && setsWorsened) {
        reason = `reps ${repsDiff}, series ${setsDiff} (peso igual)`
      } else if (repsWorsened) {
        reason = `reps ${repsDiff} (peso igual)`
      } else {
        reason = `series ${setsDiff} (peso igual)`
      }
    } else {
      status = "same"
      reason = "sin cambios"
    }
  }
  
  return {
    status,
    previousWeight,
    currentWeight,
    weightDifference: weightDiff,
    previousReps,
    currentReps,
    repsDifference: repsDiff,
    previousSets,
    currentSets,
    setsDifference: setsDiff,
    comparisonDetails: {
      weightChanged: weightDiff !== 0,
      repsChanged: repsDiff !== 0,
      setsChanged: setsDiff !== 0,
      reason
    }
  }
}

/**
 * Formatea la diferencia numérica para mostrar al usuario
 * @param {number} difference - Diferencia numérica (puede ser positiva, negativa o cero)
 * @param {string} unit - Unidad de medida ("kg" o "volumen")
 * @returns {string} Diferencia formateada (ej: "+5kg", "-120", "0kg")
 */
export function formatProgressDifference(difference, unit = "kg") {
  if (difference === 0) {
    return unit === "kg" ? "0kg" : "0"
  }
  
  const sign = difference > 0 ? "+" : ""
  const formattedValue = unit === "kg" 
    ? Math.abs(difference).toFixed(1) 
    : Math.abs(difference).toFixed(0)
  
  return `${sign}${formattedValue}${unit === "kg" ? "kg" : ""}`
}





