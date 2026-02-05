/**
 * Utilidades para procesar datos de entrenamientos y prepararlos para gráficos
 * 
 * ¿Por qué este archivo?
 * - Separación de responsabilidades: la lógica de procesamiento está separada de los componentes
 * - Reutilización: estas funciones pueden usarse en diferentes componentes
 * - Testeo: es más fácil testear funciones puras
 */

/**
 * Obtiene todos los nombres únicos de ejercicios de todos los entrenamientos
 * @param {Array} workouts - Array de entrenamientos
 * @returns {Array} Array de nombres de ejercicios únicos, ordenados alfabéticamente
 * 
 * ¿Qué hace?
 * 1. Recorre todos los entrenamientos
 * 2. Para cada entrenamiento, recorre todos sus ejercicios
 * 3. Extrae el nombre de cada ejercicio
 * 4. Filtra nombres vacíos o duplicados
 * 5. Ordena alfabéticamente
 */
export function getAllExerciseNames(workouts) {
  if (!workouts || workouts.length === 0) return []
  
  // Set es una estructura de datos que solo permite valores únicos
  const exerciseNames = new Set()
  
  workouts.forEach(workout => {
    if (workout.exercises && workout.exercises.length > 0) {
      workout.exercises.forEach(exercise => {
        // Solo agregar si el nombre no está vacío
        if (exercise.name && exercise.name.trim() !== "") {
          exerciseNames.add(exercise.name.trim())
        }
      })
    }
  })
  
  // Convertir Set a Array y ordenar alfabéticamente
  return Array.from(exerciseNames).sort()
}

/**
 * Obtiene el historial de peso para un ejercicio específico
 * @param {string} exerciseName - Nombre del ejercicio a buscar
 * @param {Array} workouts - Array de entrenamientos
 * @returns {Array} Array de objetos {date, weight, volume} ordenados por fecha
 * 
 * ¿Qué hace?
 * 1. Busca en todos los entrenamientos el ejercicio con el nombre especificado
 * 2. Para cada ocurrencia, extrae: fecha, peso usado
 * 3. Ordena por fecha (más antiguo primero)
 * 4. Retorna datos listos para graficar
 * 
 * Nota: La búsqueda es case-insensitive (no distingue mayúsculas/minúsculas)
 */
export function getWeightHistoryForExercise(exerciseName, workouts) {
  if (!exerciseName || !workouts || workouts.length === 0) return []
  
  const history = []
  const exerciseNameLower = exerciseName.trim().toLowerCase()
  
  workouts
    .filter(workout => workout.locked) // Solo entrenamientos guardados
    .forEach(workout => {
      if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach(exercise => {
          // Comparar nombres sin distinguir mayúsculas/minúsculas
          if (exercise.name && exercise.name.trim().toLowerCase() === exerciseNameLower) {
            const weight = parseFloat(exercise.weight) || 0
            const reps = parseInt(exercise.reps) || 0
            const sets = parseInt(exercise.sets) || 1
            const volume = weight * reps * sets
            
            history.push({
              date: workout.date,
              weight: weight,
              volume: volume,
              // Formatear fecha para mostrar en el gráfico (ej: "15 Ene")
              dateLabel: formatDateForChart(workout.date)
            })
          }
        })
      }
    })
  
  // Ordenar por fecha (más antiguo primero)
  return history.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Obtiene la cantidad de entrenamientos por mes
 * @param {Array} workouts - Array de entrenamientos
 * @returns {Array} Array de objetos {month, year, monthLabel, count} ordenados por fecha
 * 
 * ¿Qué hace?
 * 1. Agrupa entrenamientos por mes y año
 * 2. Cuenta cuántos entrenamientos hay en cada mes
 * 3. Formatea las etiquetas para mostrar (ej: "Enero 2026")
 * 4. Retorna datos listos para gráfico de barras
 */
export function getWorkoutsPerMonth(workouts) {
  if (!workouts || workouts.length === 0) return []
  
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  // Objeto para agrupar por mes-año
  const monthGroups = {}
  
  workouts
    .filter(workout => workout.locked) // Solo entrenamientos guardados
    .forEach(workout => {
      // Extraer año y mes de la fecha (formato: "YYYY-MM-DD")
      const [year, month] = workout.date.split("-").map(Number)
      const monthIndex = month - 1 // Los meses en Date son 0-indexed
      
      // Crear clave única para mes-año (ej: "2026-0" para Enero 2026)
      const key = `${year}-${monthIndex}`
      
      if (!monthGroups[key]) {
        monthGroups[key] = {
          year,
          month: monthIndex,
          monthLabel: `${MONTHS[monthIndex]} ${year}`,
          count: 0
        }
      }
      
      monthGroups[key].count++
    })
  
  // Convertir objeto a array y ordenar por fecha
  const result = Object.values(monthGroups).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })
  
  return result
}

/**
 * Obtiene la duración total entrenada por mes
 * @param {Array} workouts - Array de entrenamientos
 * @returns {Array} Array de objetos {month, year, monthLabel, duration} ordenados por fecha
 * 
 * ¿Qué hace?
 * 1. Agrupa entrenamientos por mes y año
 * 2. Suma la duración total de todos los entrenamientos de cada mes
 * 3. Convierte minutos a horas para mostrar mejor
 * 4. Retorna datos listos para gráfico de área
 */
export function getDurationPerMonth(workouts) {
  if (!workouts || workouts.length === 0) return []
  
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  
  // Objeto para agrupar por mes-año
  const monthGroups = {}
  
  workouts
    .filter(workout => workout.locked) // Solo entrenamientos guardados
    .forEach(workout => {
      const [year, month] = workout.date.split("-").map(Number)
      const monthIndex = month - 1
      const key = `${year}-${monthIndex}`
      
      if (!monthGroups[key]) {
        monthGroups[key] = {
          year,
          month: monthIndex,
          monthLabel: `${MONTHS[monthIndex]} ${year}`,
          duration: 0 // Duración en minutos
        }
      }
      
      // Sumar duración del entrenamiento (ya está en minutos)
      monthGroups[key].duration += workout.duration || 0
    })
  
  // Convertir objeto a array, ordenar y convertir minutos a horas
  const result = Object.values(monthGroups)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
    .map(item => ({
      ...item,
      durationHours: (item.duration / 60).toFixed(1) // Convertir a horas con 1 decimal
    }))
  
  return result
}

/**
 * Formatea una fecha "YYYY-MM-DD" a formato corto para mostrar en gráficos
 * @param {string} dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada (ej: "15 Ene")
 */
function formatDateForChart(dateStr) {
  if (!dateStr) return ""
  
  const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const [year, month, day] = dateStr.split("-").map(Number)
  
  return `${day} ${MONTHS_SHORT[month - 1]}`
}







