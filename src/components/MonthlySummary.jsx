import { getDateParts } from "../utils/dateUtils"

function MonthlySummary({ workouts, month, year }) {
  const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Filtrar entrenamientos del mes
  const monthWorkouts = workouts.filter((workout) => {
    const { year: workoutYear, month: workoutMonth } = getDateParts(workout.date)
    return workoutMonth === month && workoutYear === year
  })

  // Calcular estadísticas
  const totalDays = new Date(year, month + 1, 0).getDate()
  const daysWithWorkout = monthWorkouts.length
  const trainingPercentage = Math.round((daysWithWorkout / totalDays) * 100)

  // Volumen total (suma de peso × reps × series de todos los ejercicios)
  const totalVolume = monthWorkouts.reduce((total, workout) => {
    const workoutVolume = workout.exercises.reduce((sum, exercise) => {
      const weight = parseFloat(exercise.weight) || 0
      const reps = parseInt(exercise.reps) || 0
      const sets = parseInt(exercise.sets) || 1
      return sum + weight * reps * sets
    }, 0)
    return total + workoutVolume
  }, 0)

  // Promedio de duración por sesión
  const totalDuration = monthWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0)
  const averageDuration = daysWithWorkout > 0 ? Math.round(totalDuration / daysWithWorkout) : 0

  // Grupo muscular más entrenado (simplificado - basado en nombre del ejercicio)
  const muscleGroups = {
    "pecho": ["press", "banca", "pecho"],
    "piernas": ["sentadilla", "pierna", "cuádriceps", "gemelo", "glúteo"],
    "espalda": ["remo", "dominada", "espalda", "jalón"],
    "hombros": ["press militar", "hombro", "elevación"],
    "brazos": ["curl", "tríceps", "bíceps", "brazo"],
    "core": ["abdominal", "core", "plancha"],
  }

  const muscleCount = {}
  monthWorkouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const exerciseName = exercise.name.toLowerCase()
      Object.keys(muscleGroups).forEach((muscle) => {
        if (muscleGroups[muscle].some((keyword) => exerciseName.includes(keyword))) {
          muscleCount[muscle] = (muscleCount[muscle] || 0) + 1
        }
      })
    })
  })

  const mainFocus = Object.keys(muscleCount).length > 0
    ? Object.entries(muscleCount)
        .sort((a, b) => b[1] - a[1])[0][0]
        .charAt(0)
        .toUpperCase() + Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0][0].slice(1)
    : "N/A"

  // Rating del mes (basado en días entrenados)
  const getRating = () => {
    if (trainingPercentage >= 80) return { text: "Excelente", stars: 5, value: 5 }
    if (trainingPercentage >= 60) return { text: "Muy Bueno", stars: 4, value: 4 }
    if (trainingPercentage >= 40) return { text: "Bueno", stars: 3, value: 3 }
    if (trainingPercentage >= 20) return { text: "Regular", stars: 2, value: 2 }
    return { text: "Puede Mejorar", stars: 1, value: 1 }
  }

  const rating = getRating()

  // Formatear volumen
  const formatVolume = (volume) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M KG`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K KG`
    return `${volume.toFixed(0)} KG`
  }

  return (
    <div className="space-y-6">
      {/* Header con mejor jerarquía */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          RETROSPECTIVA MENSUAL
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Resumen de <span className="text-teal-400">{MONTHS[month]}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          {totalVolume > 0
            ? `Has superado tu volumen total de entrenamiento este mes.`
            : "Comienza a registrar tus entrenamientos para ver tu progreso."}
        </p>
      </div>

      {/* Tarjetas de Métricas - Mejor diseño con sombras y bordes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Días de Entrenamiento */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
            Días de Entrenamiento
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-5">
            {trainingPercentage >= 80 ? "Meta de días cumplida" : "Continúa entrenando"}
          </p>
          <div className="flex items-center justify-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32">
              <svg className="transform -rotate-90 w-28 h-28 sm:w-32 sm:h-32">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-slate-700/50"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(trainingPercentage / 100) * 301.59} 301.59`}
                  className="text-teal-500 transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-white">{trainingPercentage}%</span>
                <span className="text-xs text-slate-400 mt-0.5">{daysWithWorkout}/{totalDays} días</span>
              </div>
            </div>
          </div>
        </div>

        {/* Volumen Total */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-5">
            Volumen Total
          </h3>
          <div className="flex items-center justify-between mb-4">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {formatVolume(totalVolume)}
            </p>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 rounded-lg flex items-center justify-center border border-teal-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Progreso del mes</span>
          </div>
        </div>

        {/* Calificación del Mes */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-md border border-slate-700/50">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-5">
            Calificación del Mes
          </h3>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{rating.text}</p>
            <div className="bg-teal-500 text-black rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-sm sm:text-base shadow-md shadow-teal-500/20">
              {rating.value}/5
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`w-5 h-5 sm:w-6 sm:h-6 ${i < rating.stars ? "text-teal-400" : "text-slate-600/50"}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Estadísticas Pequeñas - Grid mejorado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
          {/* Promedio Sesión */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              PROMEDIO SESIÓN
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">{averageDuration} min</p>
          </div>

          {/* Foco Principal */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-slate-700/50">
            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
              FOCO PRINCIPAL
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">{mainFocus}</p>
          </div>
        </div>
      </div>

      {/* Mensaje Motivacional - Mejor diseño */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-center shadow-md border border-slate-700/50">
        <p className="text-sm sm:text-base text-white italic mb-3 leading-relaxed">
          "La disciplina es el puente entre las metas y los logros. Has construido un puente sólido este mes."
        </p>
        <div className="w-16 h-0.5 bg-teal-500 mx-auto rounded-full"></div>
      </div>
    </div>
  )
}

export default MonthlySummary

