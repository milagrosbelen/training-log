/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 * Todas las fechas se manejan como strings "YYYY-MM-DD"
 */

/**
 * Convierte un objeto Date a string "YYYY-MM-DD" sin problemas de zona horaria
 * @param {Date} date - Objeto Date
 * @returns {string} Fecha en formato "YYYY-MM-DD"
 */
export function dateToISOString(date) {
  if (!date) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Parsea un string "YYYY-MM-DD" a objeto Date sin problemas de zona horaria
 * @param {string} dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns {Date} Objeto Date en hora local
 */
export function parseDateString(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split("-").map(Number)
  // month - 1 porque los meses en Date son 0-indexed
  return new Date(year, month - 1, day)
}

/**
 * Formatea una fecha "YYYY-MM-DD" a formato legible en español
 * @param {string} dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada (ej: "Miércoles 21 de enero de 2026")
 */
export function formatDateLong(dateStr) {
  if (!dateStr) return ""
  const date = parseDateString(dateStr)
  if (!date) return ""
  
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * Formatea una fecha "YYYY-MM-DD" a formato corto en español
 * @param {string} dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada (ej: "Miércoles, 21 de enero")
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return ""
  const date = parseDateString(dateStr)
  if (!date) return ""
  
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * Obtiene el año, mes y día de un string "YYYY-MM-DD"
 * @param {string} dateStr - Fecha en formato "YYYY-MM-DD"
 * @returns {Object} {year, month, day}
 */
export function getDateParts(dateStr) {
  if (!dateStr) return { year: null, month: null, day: null }
  const [year, month, day] = dateStr.split("-").map(Number)
  return { year, month: month - 1, day } // month - 1 porque los meses en Date son 0-indexed
}



