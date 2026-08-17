import { useEffect, useState } from "react"
import { getExerciseImage, EXERCISE_PHOTO_FALLBACK } from "../utils/exerciseImages"

export default function ExercisePhoto({ name, className = "", dimmed = true }) {
  const [src, setSrc] = useState(() => getExerciseImage(name))

  useEffect(() => {
    setSrc(getExerciseImage(name))
  }, [name])

  return (
      <img
      key={src}
      src={src}
      alt={name || ""}
      loading="lazy"
      decoding="async"
      className={`${className} ${dimmed ? "brightness-[0.78]" : ""}`}
      onError={() => {
        if (src !== EXERCISE_PHOTO_FALLBACK) setSrc(EXERCISE_PHOTO_FALLBACK)
      }}
    />
  )
}
