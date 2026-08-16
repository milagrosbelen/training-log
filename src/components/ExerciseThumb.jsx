import { useEffect, useState } from "react"
import { getExerciseImage, EXERCISE_PHOTO_FALLBACK } from "../utils/exerciseImages"

export default function ExerciseThumb({ name, className = "w-[72px] h-[72px]" }) {
  const [src, setSrc] = useState(() => getExerciseImage(name))

  useEffect(() => {
    setSrc(getExerciseImage(name))
  }, [name])

  return (
    <div className={`${className} rounded-xl overflow-hidden shrink-0 bg-ink-400`}>
      <img
        key={src}
        src={src}
        alt={name || "Ejercicio"}
        className="w-full h-full object-cover object-center"
        onError={() => {
          if (src !== EXERCISE_PHOTO_FALLBACK) setSrc(EXERCISE_PHOTO_FALLBACK)
        }}
      />
    </div>
  )
}
