import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import MonthlySummary from "../components/MonthlySummary"
import ProgressCharts from "../components/ProgressCharts"
import { getWorkouts } from "../services/workoutService"
import { isAuthenticated } from "../services/authService"

const now = new Date()
const CURRENT_MONTH = now.getMonth()
const CURRENT_YEAR = now.getFullYear()

export default function Progreso() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summaryMonth, setSummaryMonth] = useState(CURRENT_MONTH)
  const [summaryYear, setSummaryYear] = useState(CURRENT_YEAR)

  const handleMonthPrev = () => {
    setSummaryMonth((m) => {
      if (m <= 0) {
        setSummaryYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }

  const handleMonthNext = () => {
    const isCurrent = summaryYear === CURRENT_YEAR && summaryMonth === CURRENT_MONTH
    if (isCurrent) return
    setSummaryMonth((m) => {
      if (m >= 11) {
        setSummaryYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }

  const canGoNext = !(summaryYear === CURRENT_YEAR && summaryMonth === CURRENT_MONTH)

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    async function load() {
      setError("")
      setLoading(true)
      try {
        const data = await getWorkouts()
        setWorkouts(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.response?.data?.message ?? "Error al cargar progreso.")
        setWorkouts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B1B2C] text-white flex items-center justify-center pb-24 md:pb-0">
        <p className="text-slate-400">Cargando progreso...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1B1B2C] text-white flex items-center justify-center px-4 pb-24 md:pb-0">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    )
  }

  const monthWorkouts = workouts.filter((w) => {
    if (!w?.date) return false
    const [y, m] = w.date.split("-").map(Number)
    return m - 1 === summaryMonth && y === summaryYear
  })

  return (
    <div className="min-h-screen bg-[#1B1B2C] text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        <div className="space-y-6">
          <MonthlySummary
            workouts={workouts}
            month={summaryMonth}
            year={summaryYear}
            onMonthPrev={handleMonthPrev}
            onMonthNext={handleMonthNext}
            canGoNext={canGoNext}
          />
          <div className="border-t border-[#2C2C40] pt-6">
            <ProgressCharts workouts={workouts} monthWorkouts={monthWorkouts} />
          </div>
        </div>
      </main>
    </div>
  )
}
