import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"

function ExerciseCard({ exercise, onUpdate, onDelete }) {
  const [weight, setWeight] = useState(exercise.weight || "")
  const [reps, setReps] = useState(exercise.reps || "")
  // Usar string vacío para evitar concatenación en mobile
  const [sets, setSets] = useState(exercise.sets ? String(exercise.sets) : "")

  // Sincronizar cuando el ejercicio cambia externamente
  useEffect(() => {
    setWeight(exercise.weight || "")
    setReps(exercise.reps || "")
    setSets(exercise.sets ? String(exercise.sets) : "")
  }, [exercise])

  const handleWeightChange = (newWeight) => {
    setWeight(newWeight)
    onUpdate({
      ...exercise,
      weight: newWeight,
      reps,
      sets,
    })
  }

  const handleRepsChange = (newReps) => {
    setReps(newReps)
    onUpdate({
      ...exercise,
      weight,
      reps: newReps,
      sets,
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
    })
  }

  const handleNameChange = (newName) => {
    onUpdate({
      ...exercise,
      name: newName,
      weight,
      reps,
      sets,
    })
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
      {/* Header con nombre y botón eliminar */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700/50">
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="text-white font-semibold text-base sm:text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500 rounded px-2 -ml-2 flex-1 mr-2 placeholder:text-slate-500"
          placeholder="Nombre del ejercicio"
        />
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 flex-shrink-0"
          aria-label="Eliminar ejercicio"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Grid de inputs simplificados - Solo inputs numéricos */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {/* PESO (KG) */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2.5">
            Peso (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full h-12 bg-slate-700/50 text-white text-center px-3 rounded-lg text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/30 placeholder:text-slate-500/50"
            placeholder="0"
            min="0"
            step="0.5"
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
            className="w-full h-12 bg-slate-700/50 text-white text-center px-3 rounded-lg text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-700 border border-slate-600/30 placeholder:text-slate-500/50"
            placeholder="0"
            min="0"
          />
        </div>

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
      </div>
    </div>
  )
}

export default ExerciseCard

