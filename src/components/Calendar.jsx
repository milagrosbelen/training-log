import { useState } from "react"
import { ChevronLeft, ChevronRight, Lock } from "lucide-react"
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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 lg:p-10 lg:text-lg shadow-lg border border-slate-700/50">
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
      <div className="grid grid-cols-7 gap-1.5 lg:gap-3 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-xs lg:text-base font-medium text-slate-400 py-1 lg:py-3">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes - mejor espaciado y diseño */}
      <div className="grid grid-cols-7 gap-1.5 lg:gap-3">
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
                aspect-square lg:h-16 lg:w-full lg:text-xl lg:font-bold rounded-lg transition-all duration-200 text-sm font-medium
                flex items-center justify-center relative border
                ${selected 
                  ? "bg-slate-700/80 text-white border-[#2AF447] shadow-[0_0_8px_rgba(42,244,71,0.25)] scale-105" 
                  : "bg-slate-700/50 text-slate-200 border-slate-600/60 hover:bg-slate-700 hover:border-slate-500/60 hover:scale-105"
                }
                ${today && !selected ? "ring-2 ring-[#2AF447]/50" : ""}
              `}
            >
              {date.getDate()}
              {workout && !selected && (
                locked ? (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2" title="Entrenamiento guardado">
                    <Lock className="w-3 h-3 text-[#2AF447] opacity-90" strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#2AF447] rounded-full" />
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

