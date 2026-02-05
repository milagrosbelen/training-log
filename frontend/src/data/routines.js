/**
 * Rutinas Predefinidas por Grupo Muscular
 * 
 * Estructura:
 * Tipo de entrenamiento → Grupo muscular → Lista de ejercicios
 * 
 * ¿Por qué este archivo?
 * - Separación de datos de la lógica
 * - Fácil de modificar sin tocar componentes
 * - Reutilizable en otros componentes si es necesario
 * - Mantiene el código organizado y escalable
 */

export const ROUTINES = {
  "Tren inferior": {
    "Cuádriceps": [
      "Sentadilla",
      "Prensa",
      "Sillón de cuádriceps"
    ],
    "Aductor": [
      "Sentadilla sumo",
      "Máquina de aductor",
      "Sentadilla lateral"
    ],
    "Glúteos": [
      "Hip thrust",
      "Subidas al cajón",
      "Peso muerto",
      "Patada de glúteos",
      "Patada lateral",
      "Abducción con banda"
    ],
    "Isquios": [
      "Peso muerto",
      "Sillón de isquios"
    ]
  },
  "Tren superior": {
    "Espalda": [
      "Dominadas",
      "Jalón al pecho",
      "Remo sentado",
      "Pull over"
    ],
    "Pecho": [
      "Press inclinado",
      "Press de banca",
      "Flexiones",
      "Cruce de polea",
      "Fondos"
    ],
    "Hombros": [
      "Press militar",
      "Vuelos laterales"
    ],
    "Tríceps": [
      "Extensión de tríceps"
    ],
    "Bíceps": [
      "Banco Scott",
      "Barra W",
      "Martillo"
    ],
    "Abdominales": [
      "Crunch normal",
      "Elevación de piernas",
      "Plancha"
    ]
  }
}

/**
 * Obtiene los grupos principales disponibles (Tren inferior, Tren superior)
 * @returns {Array} Array de nombres de grupos principales
 */
export function getMainGroups() {
  return Object.keys(ROUTINES)
}

/**
 * Obtiene los grupos musculares disponibles para un tipo de entrenamiento
 * @param {string} workoutType - Tipo de entrenamiento ("Tren inferior" o "Tren superior")
 * @returns {Array} Array de nombres de grupos musculares
 * 
 * Ejemplo:
 * getMuscleGroups("Tren inferior") 
 * → ["Cuádriceps", "Aductor", "Glúteos", "Isquios"]
 * 
 * getMuscleGroups("Tren superior")
 * → ["Espalda", "Pecho", "Hombros", "Tríceps", "Bíceps", "Abdominales"]
 */
export function getMuscleGroups(workoutType) {
  if (!workoutType || !ROUTINES[workoutType]) {
    return []
  }
  return Object.keys(ROUTINES[workoutType])
}

/**
 * Obtiene los ejercicios de un grupo muscular específico
 * @param {string} workoutType - Tipo de entrenamiento
 * @param {string} muscleGroup - Grupo muscular
 * @returns {Array} Array de nombres de ejercicios
 * 
 * Ejemplo:
 * getExercisesForMuscleGroup("Tren inferior", "Cuádriceps")
 * → ["Sentadilla", "Prensa", "Sillón de cuádriceps"]
 */
export function getExercisesForMuscleGroup(workoutType, muscleGroup) {
  if (!workoutType || !muscleGroup || !ROUTINES[workoutType] || !ROUTINES[workoutType][muscleGroup]) {
    return []
  }
  return ROUTINES[workoutType][muscleGroup]
}

