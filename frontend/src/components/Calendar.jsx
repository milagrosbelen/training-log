import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { dateToISOString } from "../utils/dateUtils"

const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
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

function Calendar({ selectedDate, onDateSelect, workouts }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const hasWorkout = (date) => {
    if (!date) return false
    const dateStr = dateToISOString(date)
    return workouts.some((w) => w.date === dateStr)
  }

  const isWorkoutLocked = (date) => {
    if (!date) return false
    const dateStr = dateToISOString(date)
    const workout = workouts.find((w) => w.date === dateStr)
    return workout && workout.locked === true
  }

  const isSelected = (date) => {
    if (!date) return false
    const dateStr = dateToISOString(date)
    return selectedDate === dateStr
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDateClick = (date) => {
    if (!date) return
    const dateStr = dateToISOString(date)
    onDateSelect(dateStr)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 shadow-lg border border-slate-700/50">
      {/* Header del calendario con mejor espaciado */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-white">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Días de la semana - más compactos */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes - mejor espaciado y diseño */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const dateStr = dateToISOString(date)
          const workout = hasWorkout(date)
          const locked = isWorkoutLocked(date)
          const selected = isSelected(date)
          const today = isToday(date)

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square rounded-lg transition-all duration-200 text-sm font-medium
                flex items-center justify-center relative
                ${selected 
                  ? "bg-teal-500 text-black shadow-md shadow-teal-500/30 scale-105" 
                  : "bg-slate-700/50 text-slate-200 hover:bg-slate-700 hover:scale-105"
                }
                ${today && !selected ? "ring-2 ring-teal-400/50" : ""}
              `}
            >
              {date.getDate()}
              {workout && !selected && (
                locked ? (
                  <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 text-xs" title="Entrenamiento guardado">
                    🔒
                  </span>
                ) : (
                  <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-400 rounded-full" />
                )
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar

