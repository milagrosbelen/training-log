// Configuración de la API
const API_BASE_URL = 'http://localhost:3000'
const DEFAULT_USER_ID = 1 // Por ahora usamos user_id = 1, luego se puede hacer dinámico

/**
 * Convierte los datos del frontend al formato que espera el backend
 * 
 * Frontend: { date, type, duration, exercises }
 * Backend: { user_id, fecha, duracion_minutos, notas }
 */
const transformWorkoutToBackend = (workoutData) => {
  // Convertir ejercicios a JSON string para guardar en notas
  const notas = JSON.stringify({
    type: workoutData.type,
    exercises: workoutData.exercises || []
  })

  return {
    user_id: DEFAULT_USER_ID,
    fecha: workoutData.date, // Ya viene en formato YYYY-MM-DD
    duracion_minutos: workoutData.duration || 0,
    notas: notas
  }
}

/**
 * Convierte los datos del backend al formato que usa el frontend
 * 
 * Backend: { id, user_id, fecha, duracion_minutos, notas }
 * Frontend: { date, type, duration, exercises, locked }
 */
const transformBackendToWorkout = (backendData) => {
  let parsedNotas = {}
  try {
    parsedNotas = JSON.parse(backendData.notas || '{}')
  } catch (error) {
    // Si no se puede parsear, usar valores por defecto
    parsedNotas = { type: '', exercises: [] }
  }

  return {
    id: backendData.id,
    date: backendData.fecha,
    type: parsedNotas.type || '',
    duration: backendData.duracion_minutos || 0,
    exercises: parsedNotas.exercises || [],
    locked: true // Los entrenamientos del backend siempre están guardados
  }
}

/**
 * Crea un nuevo entrenamiento en el backend
 * @param {Object} workoutData - Datos del entrenamiento del frontend
 * @returns {Promise<Object>} - Entrenamiento creado desde el backend
 */
export const createTraining = async (workoutData) => {
  try {
    const backendData = transformWorkoutToBackend(workoutData)
    
    const response = await fetch(`${API_BASE_URL}/trainings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }

    const createdTraining = await response.json()
    return transformBackendToWorkout(createdTraining)
  } catch (error) {
    console.error('Error al crear entrenamiento:', error)
    throw error
  }
}

/**
 * Obtiene todos los entrenamientos del backend
 * @returns {Promise<Array>} - Array de entrenamientos transformados al formato del frontend
 */
export const getTrainings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/trainings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }

    const backendTrainings = await response.json()
    // Transformar cada entrenamiento al formato del frontend
    return backendTrainings.map(transformBackendToWorkout)
  } catch (error) {
    console.error('Error al obtener entrenamientos:', error)
    throw error
  }
}

