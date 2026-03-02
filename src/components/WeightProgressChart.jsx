/**
 * Componente: Gráfico de Progreso de Peso por Ejercicio
 * 
 * ¿Qué hace este componente?
 * Muestra un gráfico de línea que visualiza cómo cambió el peso usado
 * en un ejercicio específico a lo largo del tiempo.
 * 
 * ¿Por qué es útil?
 * Te permite ver si estás progresando en un ejercicio específico.
 * Por ejemplo: "¿Estoy levantando más peso en sentadillas?"
 */

import { useState, useMemo, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp } from "lucide-react"
import { getAllExerciseNames, getWeightHistoryForExercise } from "../utils/chartData"

const TIME_FILTERS = [
  { id: "all", label: "Todo el tiempo", months: null },
  { id: "3m", label: "Últimos 3 meses", months: 3 },
  { id: "6m", label: "Últimos 6 meses", months: 6 },
  { id: "12m", label: "Ultimos 12 meses", months: 12 },
]

function filterByMonths(history, months) {
  if (!months || !history?.length) return history ?? []
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  return history.filter((d) => d.date >= cutoffStr)
}

/**
 * Props: workouts - Array de TODOS los entrenamientos (histórico completo)
 */
function WeightProgressChart({ workouts = [] }) {
  const [selectedExercise, setSelectedExercise] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")
  const safeWorkouts = Array.isArray(workouts) ? workouts : []

  /**
   * useMemo: Historial completo del ejercicio (sin filtrar por mes)
   * 
   * ¿Qué hace?
   * Memoriza (guarda en memoria) el resultado de un cálculo.
   * Solo recalcula si las dependencias cambian.
   * 
   * ¿Por qué lo uso aquí?
   * getAllExerciseNames puede ser costoso si hay muchos entrenamientos.
   * Con useMemo, solo se calcula cuando "workouts" cambia.
   * 
   * Dependencias: [workouts]
   * - Si workouts no cambia, devuelve el valor memorizado
   * - Si workouts cambia, recalcula
   */
  const exerciseNames = useMemo(() => {
    return getAllExerciseNames(safeWorkouts)
  }, [safeWorkouts])

  /**
   * useMemo: Otro cálculo optimizado
   * 
   * ¿Qué hace?
   * Obtiene el historial de peso para el ejercicio seleccionado.
   * 
   * Dependencias: [selectedExercise, workouts]
   * - Solo recalcula si cambia el ejercicio seleccionado o los workouts
   */
  const fullHistory = useMemo(() => {
    if (!selectedExercise) return []
    return getWeightHistoryForExercise(selectedExercise, safeWorkouts)
  }, [selectedExercise, safeWorkouts])

  const filterConfig = TIME_FILTERS.find((f) => f.id === timeFilter) ?? TIME_FILTERS[0]
  const weightHistory = useMemo(
    () => filterByMonths(fullHistory, filterConfig.months),
    [fullHistory, filterConfig.months]
  )

  /**
   * useEffect: Inicializar ejercicio seleccionado
   * 
   * ¿Qué hace?
   * Se ejecuta después de que el componente se renderiza.
   * En este caso, inicializa el ejercicio seleccionado con el primero disponible.
   * 
   * ¿Cuándo se ejecuta?
   * - Primera vez que el componente se monta
   * - Cuando exerciseNames cambia (si hay nuevos ejercicios disponibles)
   * 
   * Dependencias: [exerciseNames]
   * - Solo se ejecuta si exerciseNames cambia
   */
  useEffect(() => {
    // Si hay ejercicios disponibles y ninguno está seleccionado, seleccionar el primero
    if (exerciseNames.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseNames[0])
    }
  }, [exerciseNames, selectedExercise])

  /**
   * Función que se ejecuta cuando el usuario cambia el ejercicio en el dropdown
   * 
   * ¿Qué hace?
   * Actualiza el estado "selectedExercise" con el nuevo valor seleccionado.
   * 
   * ¿Por qué "e.target.value"?
   * "e" es el evento del cambio (onChange)
   * "target" es el elemento que disparó el evento (el <select>)
   * "value" es el valor seleccionado
   */
  const handleExerciseChange = (e) => {
    setSelectedExercise(e.target.value)
  }

  // Si no hay ejercicios disponibles, mostrar mensaje
  if (exerciseNames.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2AF447]" />
          Progreso de Peso por Ejercicio
        </h3>
        <p className="text-slate-400 text-sm">
          No hay ejercicios registrados aún. Registra algunos entrenamientos para ver tu progreso.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
      {/* Header del gráfico */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2AF447]" />
          Progreso de Peso por Ejercicio
        </h3>
        <p className="text-sm text-slate-400">
          Selecciona un ejercicio para ver cómo ha cambiado el peso que usas a lo largo del tiempo
        </p>
      </div>

      {/* Selector de ejercicio y filtro de tiempo */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Seleccionar ejercicio:
          </label>
          <select
            value={selectedExercise}
            onChange={handleExerciseChange}
            className="w-full bg-slate-700/50 text-white py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2AF447] focus:bg-slate-700 border border-slate-600/50"
          >
            {exerciseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {selectedExercise && fullHistory.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Período:
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full bg-slate-700/50 text-white py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2AF447] focus:bg-slate-700 border border-slate-600/50"
            >
              {TIME_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Gráfico */}
      {weightHistory.length > 0 ? (
        <div className="w-full h-64 sm:h-80">
          {/**
           * ResponsiveContainer: Componente de Recharts que hace el gráfico responsive
           * - Se adapta al ancho del contenedor
           * - Mantiene las proporciones correctas
           */}
          <ResponsiveContainer width="100%" height="100%">
            {/**
             * LineChart: Componente principal del gráfico de línea
             * - data: los datos a graficar (array de objetos)
             * - margin: espacio alrededor del gráfico
             */}
            <LineChart
              data={weightHistory}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              {/**
               * CartesianGrid: Muestra líneas de cuadrícula en el fondo
               * - strokeDasharray: hace las líneas punteadas
               * - stroke: color de las líneas (gris semitransparente)
               */}
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              
              {/**
               * XAxis: Eje horizontal (fechas)
               * - dataKey: qué propiedad del objeto usar para el eje X ("dateLabel")
               * - stroke: color del eje
               * - tick: estilo de las etiquetas
               */}
              <XAxis
                dataKey="dateLabel"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              
              {/**
               * YAxis: Eje vertical (peso en kg)
               * - stroke: color del eje
               * - tick: estilo de las etiquetas
               * - label: etiqueta del eje
               */}
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                label={{ value: "Peso (kg)", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
              />
              
              {/**
               * Tooltip: Muestra información al pasar el mouse sobre un punto
               * - contentStyle: estilo del tooltip
               * - labelStyle: estilo de la etiqueta
               */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              
              {/**
               * Legend: Muestra la leyenda del gráfico
               */}
              <Legend />
              
              {/**
               * Line: La línea del gráfico
               * - type: tipo de línea ("monotone" = suave)
               * - dataKey: qué propiedad graficar ("weight")
               * - stroke: color de la línea (verde neon)
               * - strokeWidth: grosor de la línea
               * - dot: muestra puntos en cada dato
               * - name: nombre que aparece en la leyenda
               */}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2AF447"
                strokeWidth={2}
                dot={{ fill: "#2AF447", r: 4 }}
                activeDot={{ r: 6 }}
                name="Peso (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          {selectedExercise
            ? "Aún no hay registros suficientes para mostrar progreso."
            : "Selecciona un ejercicio para ver su progreso."}
        </div>
      )}
    </div>
  )
}

export default WeightProgressChart

