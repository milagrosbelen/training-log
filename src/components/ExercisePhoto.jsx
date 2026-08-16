import { useEffect, useState } from "react"
import { getExerciseImage, EXERCISE_PHOTO_FALLBACK } from "../utils/exerciseImages"

export default function ExercisePhoto({ name, className = "", dimmed = true }) {
  const [src, setSrc] = useState(() => getExerciseImage(name))

  useEffect(() => {
    setSrc(getExerciseImage(name))
  }, [name])

  return (
    <img
      src={src}
      alt=""
      className={`${className} ${dimmed ? "brightness-[0.58]" : ""}`}
      onError={() => {
        if (src !== EXERCISE_PHOTO_FALLBACK) setSrc(EXERCISE_PHOTO_FALLBACK)
      }}
    />
  )
}
