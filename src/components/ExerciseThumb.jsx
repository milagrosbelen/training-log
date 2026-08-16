import { useState } from "react"
import { getExerciseImage } from "../utils/exerciseImages"

export default function ExerciseThumb({ name, className = "w-[72px] h-[72px]" }) {
  const [failed, setFailed] = useState(false)
  const src = getExerciseImage(name)

  if (failed) {
    return (
      <div className={`${className} rounded-xl bg-ink-400 overflow-hidden shrink-0`} />
    )
  }

  return (
    <div className={`${className} rounded-xl overflow-hidden shrink-0 bg-ink-400`}>
      <img
        src={src}
        alt={name || "Ejercicio"}
        className="w-full h-full object-cover object-center"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
