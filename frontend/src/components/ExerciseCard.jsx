import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, ChevronUp, ChevronDown, Plus, Minus } from "lucide-react"

function ExerciseCard({ exercise, onUpdate, onDelete, onMoveUp, onMoveDown, canMoveUp = false, canMoveDown = false, errors = {} }) {
  const [weight, setWeight] = useState(exercise.weight || "")
  const [reps, setReps] = useState(exercise.reps || "")
  // Usar string vacío para evitar concatenación en mobile
  const [sets, setSets] = useState(exercise.sets ? String(exercise.sets) : "")
  const [notes, setNotes] = useState(exercise.notes || "")
  const [isNoteOpen, setIsNoteOpen] = useState(true)

  // Sincronizar cuando el ejercicio cambia externamente
  useEffect(() => {
    setWeight(exercise.weight || "")
    setReps(exercise.reps || "")
    setSets(exercise.sets ? String(exercise.sets) : "")
    setNotes(exercise.notes || "")
  }, [exercise])

  const handleWeightChange = (newWeight) => {
    setWeight(newWeight)
    onUpdate({
      ...exercise,
      weight: newWeight,
      reps,
      sets,
      notes,
    })
  }

  const handleRepsChange = (newReps) => {
    setReps(newReps)
    onUpdate({
      ...exercise,
      weight,
      reps: newReps,
      sets,
      notes,
    })
  }

  const handleSetsChange = (newSets) => {
    // Mantener como string durante el tipeo
    setSets(newSets)
    // Convertir a número solo para actualizar el ejercicio (mínimo 1)
    const setsValue = Math.max(1, parseInt(newSets) || 1)
    onUpdate({
      ...exercise,
      weight,
      reps,
      sets: setsValue,
      notes,
    })
  }

  const handleNameChange = (newName) => {
    onUpdate({
      ...exercise,
      name: newName,
      weight,
      reps,
      sets,
      notes,
    })
  }

  const handleNotesChange = (newNotes) => {
    setNotes(newNotes)
    onUpdate({
      ...exercise,
      weight,
      reps,
      sets,
      notes: newNotes,
    })
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
        {/* Bloque izquierdo: Título */}
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="text-white font-semibold text-base sm:text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 -ml-2 flex-1 min-w-0 placeholder:text-slate-500"
          placeholder="Nombre del ejercicio"
        />
        {/* Bloque derecho: Flechas + Tacho agrupados */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Flecha arriba */}
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
          {/* Flecha abajo */}
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
          {/* Botón eliminar */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            aria-label="Eliminar ejercicio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid de inputs simplificados - Orden lógico: Series, Repeticiones, Peso */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {/* SERIES */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2.5">
            Series
          </label>
          <input
            type="number"
            value={sets}
            onChange={(e) => {
              const value = e.target.value
              // Permitir string vacío o números válidos >= 1
              if (value === "" || (!isNaN(value) && parseInt(value) >= 1)) {
                handleSetsChange(value)
              }
            }}
            onFocus={(e) => {
              // Limpiar el input al hacer focus si tiene valor por defecto
              if (e.target.value === "1") {
                e.target.select()
              }
            }}
            className="w-full h-12 bg-slate-700/50 text-white text-center px-3 rounded-lg text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/30 placeholder:text-slate-500/50"
            placeholder="1"
            min="1"
          />
        </div>

        {/* REPS */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2.5">
            Repeticiones
          </label>
          <input
            type="number"
            value={reps}
            onChange={(e) => handleRepsChange(e.target.value)}
            className={`w-full h-12 bg-slate-700/50 text-white text-center px-3 rounded-lg text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border ${
              errors.reps ? "border-red-500/50" : "border-slate-600/30"
            } placeholder:text-slate-500/50`}
            placeholder="0"
            min="0"
          />
          {errors.reps && (
            <p className="text-xs text-red-400 mt-1">{errors.reps}</p>
          )}
        </div>

        {/* PESO (KG) */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2.5">
            Peso (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className={`w-full h-12 bg-slate-700/50 text-white text-center px-3 rounded-lg text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border ${
              errors.weight ? "border-red-500/50" : "border-slate-600/30"
            } placeholder:text-slate-500/50`}
            placeholder="0"
            min="0"
            step="0.5"
          />
          {errors.weight && (
            <p className="text-xs text-red-400 mt-1">{errors.weight}</p>
          )}
        </div>
      </div>

      {/* Campo de notas del ejercicio */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        {/* Encabezado de nota */}
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
        {/* Textarea con animación */}
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
            className="w-full bg-slate-700/50 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/30 placeholder:text-slate-500/50 resize-none transition-all duration-200 hover:border-slate-600/50"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ExerciseCard

