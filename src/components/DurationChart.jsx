/**
 * Componente: Gráfico de Duración Total por Mes
 * 
 * ¿Qué hace este componente?
 * Muestra un gráfico de área con la duración total (en horas) que entrenaste
 * en cada mes.
 * 
 * ¿Por qué es útil?
 * Te permite ver si estás entrenando más tiempo mes a mes.
 * Útil para ver tendencias: ¿estoy dedicando más tiempo al entrenamiento?
 */

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Clock } from "lucide-react"
import { getDurationPerMonth } from "../utils/chartData"

/**
 * Props que recibe este componente:
 * @param {Array} workouts - Array de todos los entrenamientos guardados
 */
function DurationChart({ workouts }) {
  /**
   * useMemo: Calcula los datos del gráfico solo cuando workouts cambia
   * 
   * ¿Qué hace getDurationPerMonth?
   * Agrupa los entrenamientos por mes y suma la duración total de cada mes.
   * 
   * Ejemplo de resultado:
   * [
   *   { monthLabel: "Enero 2026", durationHours: "30.5" },
   *   { monthLabel: "Febrero 2026", durationHours: "35.2" },
   *   { monthLabel: "Marzo 2026", durationHours: "28.0" }
   * ]
   */
  const chartData = useMemo(() => {
    return getDurationPerMonth(workouts)
  }, [workouts])

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-400" />
          Duración Total por Mes
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
          <Clock className="w-5 h-5 text-teal-400" />
          Duración Total por Mes
        </h3>
        <p className="text-sm text-slate-400">
          Tiempo total entrenado cada mes (en horas)
        </p>
      </div>

      {/* Gráfico de área */}
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {/**
           * AreaChart: Componente principal del gráfico de área
           * Similar a LineChart pero con área rellena debajo de la línea
           */}
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              {/**
               * linearGradient: Define un gradiente de color
               * Se usa para rellenar el área del gráfico con un degradado
               * desde el color principal hasta transparente
               */}
              <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            
            <XAxis
              dataKey="monthLabel"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              label={{ value: "Horas", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#fff"
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(value) => [`${value} horas`, "Duración"]}
            />
            
            <Legend />
            
            {/**
             * Area: El área del gráfico
             * - type: tipo de línea ("monotone" = suave)
             * - dataKey: qué propiedad graficar ("durationHours")
             * - stroke: color de la línea
             * - fill: color del relleno (usa el gradiente definido arriba)
             * - fillOpacity: opacidad del relleno
             */}
            <Area
              type="monotone"
              dataKey="durationHours"
              stroke="#14b8a6"
              fillOpacity={1}
              fill="url(#colorDuration)"
              name="Duración (horas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default DurationChart














