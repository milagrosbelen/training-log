import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { dateToISOString } from "../utils/dateUtils"

const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function normalizeDate(value) {
  if (!value) return ""
  return String(value).slice(0, 10)
}

function Calendar({ selectedDate, onDateSelect, workouts = [], trainedDates = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const trainedSet = new Set(
    [
      ...(Array.isArray(trainedDates) ? trainedDates : []),
      ...(Array.isArray(workouts) ? workouts.map((w) => normalizeDate(w.date)) : []),
    ].filter(Boolean)
  )

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const mondayIndex = (firstDay.getDay() + 6) % 7

    const days = []
    for (let i = 0; i < mondayIndex; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const hasWorkout = (date) => {
    if (!date) return false
    return trainedSet.has(dateToISOString(date))
  }

  const isSelected = (date) => {
    if (!date) return false
    return normalizeDate(selectedDate) === dateToISOString(date)
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

  const days = getDaysInMonth(currentMonth)

  return (
    <div
      className="relative rounded-[28px] bg-ink-200/85 backdrop-blur-xl border border-white/10 px-4 py-5"
      style={{
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(255,79,42,0.12), 0 1px 0 rgba(255,255,255,0.06) inset",
        transform: "translateY(-4px)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
          }
          className="h-9 w-9 rounded-full bg-ember/10 text-ember flex items-center justify-center hover:bg-ember hover:text-ink transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight text-white">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          type="button"
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
          }
          className="h-9 w-9 rounded-full bg-ember/10 text-ember flex items-center justify-center hover:bg-ember hover:text-ink transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-3">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-[11px] font-medium tracking-wide text-slate-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="h-10" />

          const dateStr = dateToISOString(date)
          const trained = hasWorkout(date)
          const selected = isSelected(date)
          const today = isToday(date)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDateSelect(dateStr)}
              className="flex items-center justify-center h-10 bg-transparent"
            >
              <span
                className={`relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold tabular-nums transition-all duration-200 ${
                  selected
                    ? "bg-[#FF4F2A] text-ink shadow-ember"
                    : today
                      ? "text-[#FF4F2A] ring-2 ring-[#FF4F2A]"
                      : trained
                        ? "text-white"
                        : "text-slate-400"
                }`}
              >
                {date.getDate()}
                {trained && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#FF4F2A]"
                    aria-hidden
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
