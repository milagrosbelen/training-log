import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, ChevronUp, ChevronDown, Plus, Minus, X } from "lucide-react"

const MAX_SERIES = 5

// Convierte datos legacy (sets, reps, weight) a formato series
function normalizeSeries(exercise) {
  if (exercise.series && Array.isArray(exercise.series) && exercise.series.length > 0) {
    return exercise.series.slice(0, MAX_SERIES).map((s) => ({
      reps: s.reps ?? "",
      weight: s.weight ?? "",
    }))
  }
  const sets = Math.min(MAX_SERIES, Math.max(1, parseInt(exercise.sets) || 1))
  const reps = exercise.reps ?? ""
  const weight = exercise.weight ?? ""
  return Array.from({ length: sets }, () => ({ reps, weight }))
}

function ExerciseCard({ exercise, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp = false, canMoveDown = false, errors = {} }) {
  const [series, setSeries] = useState(() => normalizeSeries(exercise))
  const [notes, setNotes] = useState(exercise.notes || "")
  const [isNoteOpen, setIsNoteOpen] = useState(true)

  useEffect(() => {
    setSeries(normalizeSeries(exercise))
    setNotes(exercise.notes || "")
  }, [exercise])

  const emitUpdate = (newSeries, newNotes = notes) => {
    onUpdate({
      ...exercise,
      series: newSeries,
      notes: newNotes,
    })
  }

  const handleSeriesChange = (index, field, value) => {
    const newSeries = series.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    )
    setSeries(newSeries)
    emitUpdate(newSeries)
  }

  const handleAddSeries = () => {
    if (series.length >= MAX_SERIES) return
    const newSeries = [...series, { reps: "", weight: "" }]
    setSeries(newSeries)
    emitUpdate(newSeries)
  }

  const handleRemoveSeries = (index) => {
    if (series.length <= 1) return
    const newSeries = series.filter((_, i) => i !== index)
    setSeries(newSeries)
    emitUpdate(newSeries)
  }

  const handleNameChange = (newName) => {
    onUpdate({
      ...exercise,
      name: newName,
      series,
      notes,
    })
  }

  const handleNotesChange = (newNotes) => {
    setNotes(newNotes)
    emitUpdate(series, newNotes)
  }

  return (
    <motion.div
      layout
      layoutId={`exercise-${exercise.id}`}
      initial={false}
      transition={{
        duration: 0.35,
        ease: "easeInOut"
      }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-slate-700/50 hover:border-slate-600/50"
    >
      {/* Header con nombre, botones de reordenar y botón eliminar */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-700/50">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="text-white font-semibold text-base sm:text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-neon-500 rounded px-2 -ml-2 flex-1 min-w-0 placeholder:text-slate-500"
          placeholder="Nombre del ejercicio"
        />
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-1 rounded transition-all duration-200 ${
              canMoveUp
                ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700/30 hover:scale-110 opacity-70 hover:opacity-100"
                : "text-slate-700 cursor-not-allowed opacity-30"
            }`}
            aria-label="Mover ejercicio arriba"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-1 rounded transition-all duration-200 ${
              canMoveDown
                ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700/30 hover:scale-110 opacity-70 hover:opacity-100"
                : "text-slate-700 cursor-not-allowed opacity-30"
            }`}
            aria-label="Mover ejercicio abajo"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            aria-label="Eliminar ejercicio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabla de series */}
      <div className="overflow-hidden rounded-lg border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/30 border-b border-slate-600/50">
              <th className="text-left text-slate-400 font-medium py-2.5 px-3 w-8">#</th>
              <th className="text-left text-slate-400 font-medium py-2.5 px-3">Repeticiones</th>
              <th className="text-left text-slate-400 font-medium py-2.5 px-3">Peso (kg)</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {series.map((s, index) => (
              <tr
                key={index}
                className="group border-b border-slate-700/30 last:border-b-0 hover:bg-slate-700/20 transition-colors duration-150"
              >
                <td className="py-2 px-3 text-slate-500 font-medium tabular-nums">
                  {index + 1}
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    value={s.reps}
                    onChange={(e) => handleSeriesChange(index, "reps", e.target.value)}
                    placeholder="0"
                    min="0"
                    className={`w-full max-w-[80px] h-9 bg-slate-700/50 text-white text-center px-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-neon-500/70 focus:bg-slate-700 border ${
                      errors.reps ? "border-red-500/50" : "border-slate-600/30"
                    } placeholder:text-slate-500/50`}
                  />
                </td>
                <td className="py-1.5 px-3">
                  <input
                    type="number"
                    value={s.weight}
                    onChange={(e) => handleSeriesChange(index, "weight", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.5"
                    className={`w-full max-w-[80px] h-9 bg-slate-700/50 text-white text-center px-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-neon-500/70 focus:bg-slate-700 border ${
                      errors.weight ? "border-red-500/50" : "border-slate-600/30"
                    } placeholder:text-slate-500/50`}
                  />
                </td>
                <td className="py-1.5 px-2">
                  <button
                    onClick={() => handleRemoveSeries(index)}
                    disabled={series.length <= 1}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      series.length <= 1
                        ? "text-slate-600 cursor-not-allowed"
                        : "text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-60 group-hover:opacity-100"
                    }`}
                    aria-label="Eliminar serie"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-2 border-t border-slate-700/30 bg-slate-800/30">
          <button
            onClick={handleAddSeries}
            disabled={series.length >= MAX_SERIES}
            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              series.length >= MAX_SERIES
                ? "text-slate-600 cursor-not-allowed bg-slate-800/50"
                : "text-neon-500/90 hover:text-neon-500 hover:bg-neon-500/10 border border-dashed border-slate-600/50 hover:border-neon-500/40"
            }`}
          >
            <Plus className="w-4 h-4" />
            Agregar serie
          </button>
        </div>
      </div>

      {errors.reps && (
        <p className="text-xs text-red-400 mt-2">{errors.reps}</p>
      )}
      {errors.weight && (
        <p className="text-xs text-red-400 mt-1">{errors.weight}</p>
      )}

      {/* Campo de notas del ejercicio */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Nota</span>
          <button
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 transition-all duration-200"
            aria-label={isNoteOpen ? "Colapsar nota" : "Expandir nota"}
          >
            {isNoteOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isNoteOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Notas del ejercicio (sensaciones, técnica, progreso...)"
            rows={2}
            className="w-full bg-slate-700/50 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 focus:bg-slate-700 border border-slate-600/30 placeholder:text-slate-500/50 resize-none transition-all duration-200 hover:border-slate-600/50"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ExerciseCard
