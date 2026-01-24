/**
 * Componente: Contenedor de Gráficos de Progreso
 * 
 * ¿Qué hace este componente?
 * Agrupa y organiza los 3 gráficos de progreso en un layout ordenado.
 * 
 * ¿Por qué un componente contenedor?
 * - Organización: Mantiene el código de App.jsx más limpio
 * - Reutilización: Puedo usar este componente en otros lugares si es necesario
 * - Separación de responsabilidades: App.jsx maneja navegación, este maneja gráficos
 */

import WeightProgressChart from "./WeightProgressChart"
import WorkoutsPerMonthChart from "./WorkoutsPerMonthChart"
import DurationChart from "./DurationChart"

/**
 * Props que recibe este componente:
 * @param {Array} workouts - Array de todos los entrenamientos guardados
 * 
 * ¿Cómo funciona el paso de props?
 * App.jsx tiene workouts en su estado
 * → App.jsx pasa workouts a ProgressCharts
 * → ProgressCharts pasa workouts a cada gráfico individual
 * 
 * Esto se llama "prop drilling" (perforación de props)
 * En aplicaciones más grandes, se usaría Context API o un estado global
 */
function ProgressCharts({ workouts }) {
  return (
    <div className="space-y-6">
      {/* Título de la sección */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Gráficos de Progreso
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Visualiza tu progreso a lo largo del tiempo con estos gráficos interactivos
        </p>
      </div>

      {/* Grid responsivo para los gráficos */}
      {/**
       * Layout explicado:
       * - En mobile (por defecto): 1 columna (stack vertical)
       * - En tablet (md:): 2 columnas
       * - gap-6: espacio entre gráficos
       */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/**
         * Gráfico 1: Progreso de peso por ejercicio
         * - Ocupa toda la fila (col-span-1 md:col-span-2)
         * - Es el más importante, por eso tiene más espacio
         */}
        <div className="md:col-span-2">
          <WeightProgressChart workouts={workouts} />
        </div>

        {/**
         * Gráfico 2: Entrenamientos por mes
         * - Ocupa 1 columna en tablet/desktop
         */}
        <div>
          <WorkoutsPerMonthChart workouts={workouts} />
        </div>

        {/**
         * Gráfico 3: Duración total por mes
         * - Ocupa 1 columna en tablet/desktop
         */}
        <div>
          <DurationChart workouts={workouts} />
        </div>
      </div>
    </div>
  )
}

export default ProgressCharts

