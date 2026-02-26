/**
 * Componente: Gráfico de Entrenamientos por Mes
 * 
 * ¿Qué hace este componente?
 * Muestra un gráfico de barras con la cantidad de entrenamientos
 * realizados en cada mes.
 * 
 * ¿Por qué es útil?
 * Te permite ver tu consistencia: ¿entrenaste más en enero o febrero?
 * ¿Estás manteniendo una rutina constante?
 */

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar } from "lucide-react"
import { getWorkoutsPerMonth } from "../utils/chartData"

/**
 * Props que recibe este componente:
 * @param {Array} workouts - Array de todos los entrenamientos guardados
 */
function WorkoutsPerMonthChart({ workouts }) {
  /**
   * useMemo: Calcula los datos del gráfico solo cuando workouts cambia
   * 
   * ¿Qué hace getWorkoutsPerMonth?
   * Agrupa los entrenamientos por mes y cuenta cuántos hay en cada uno.
   * 
   * Ejemplo de resultado:
   * [
   *   { monthLabel: "Enero 2026", count: 12 },
   *   { monthLabel: "Febrero 2026", count: 15 },
   *   { monthLabel: "Marzo 2026", count: 10 }
   * ]
   */
  const chartData = useMemo(() => {
    return getWorkoutsPerMonth(workouts)
  }, [workouts])

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          Entrenamientos por Mes
        </h3>
        <p className="text-slate-400 text-sm">
          No hay entrenamientos registrados aún. Comienza a registrar tus entrenamientos para ver tu progreso.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
      {/* Header del gráfico */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          Entrenamientos por Mes
        </h3>
        <p className="text-sm text-slate-400">
          Cantidad de días que entrenaste cada mes
        </p>
      </div>

      {/* Gráfico de barras */}
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {/**
           * BarChart: Componente principal del gráfico de barras
           * - data: los datos a graficar
           * - margin: espacio alrededor del gráfico
           */}
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            
            {/**
             * XAxis: Eje horizontal (meses)
             * - dataKey: qué propiedad usar para el eje X ("monthLabel")
             * - angle: rotar las etiquetas para que quepan mejor
             * - textAnchor: alinear el texto
             */}
            <XAxis
              dataKey="monthLabel"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            
            {/**
             * YAxis: Eje vertical (cantidad de entrenamientos)
             */}
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Cantidad", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff"
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            
            <Legend />
            
            {/**
             * Bar: La barra del gráfico
             * - dataKey: qué propiedad graficar ("count")
             * - fill: color de las barras (verde teal)
             * - radius: bordes redondeados en las barras
             */}
            <Bar
              dataKey="count"
              fill="#14b8a6"
              radius={[8, 8, 0, 0]}
              name="Entrenamientos"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WorkoutsPerMonthChart














