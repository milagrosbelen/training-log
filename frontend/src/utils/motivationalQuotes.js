// Frases motivadoras para diferentes contextos

export const emptyStateQuotes = [
  "Cada gran logro comienza con el primer paso 💪",
  "Tu mejor versión te está esperando 🚀",
  "El progreso se construye día a día ✨",
  "Hoy es el mejor día para empezar 🌟",
  "La disciplina es el puente entre metas y logros 🏋️",
  "Tu cuerpo puede hacerlo, es tu mente la que necesitas convencer 💭",
]

export const successQuotes = [
  "¡Excelente trabajo! Sigamos así 🔥",
  "Un paso más hacia tus objetivos 💪",
  "La consistencia es la clave del éxito ✨",
  "Cada entrenamiento te acerca a tu meta 🎯",
  "¡Bien hecho! Tu futuro yo te lo agradecerá 🙏",
  "El progreso se construye con entrenamientos como este 🚀",
]

export const workoutDayQuotes = [
  "Hoy es un nuevo día para superarte 💪",
  "La motivación te trajo aquí, la disciplina te mantendrá 🏋️",
  "Cada repetición cuenta ✨",
  "Tu cuerpo puede hacerlo, tu mente también 💭",
  "El dolor es temporal, el orgullo es para siempre 🎯",
  "No te rindas, estás más cerca de lo que crees 🌟",
]

export const progressQuotes = [
  "Mira cuánto has progresado 📈",
  "La consistencia es tu superpoder 💪",
  "Cada entrenamiento suma al gran total 🎯",
  "Estás construyendo algo increíble 🚀",
  "El progreso no es lineal, pero estás avanzando ✨",
  "Tus números cuentan una historia de dedicación 📊",
]

/**
 * Obtiene una frase motivadora aleatoria de un array
 * @param {string[]} quotes - Array de frases
 * @returns {string} Frase aleatoria
 */
export function getRandomQuote(quotes) {
  if (!quotes || quotes.length === 0) return ""
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}



