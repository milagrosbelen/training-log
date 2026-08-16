import { Check, ChevronRight } from "lucide-react"
import { resolveExerciseMeta } from "../../data/exerciseCatalog"
import ExercisePhoto from "../ExercisePhoto"

export default function ExerciseHeroCard({
  exercise,
  index,
  completed = false,
  onOpen,
}) {
  const meta = resolveExerciseMeta(exercise)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative w-full overflow-hidden rounded-[28px] h-[210px] border border-white/5 text-left transition-transform duration-200 ease-out active:scale-[0.985]"
    >
      <ExercisePhoto
        name={exercise.name}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/30" />

      {completed ? (
        <span className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ember text-white">
          <Check className="w-4 h-4" strokeWidth={2.6} />
        </span>
      ) : (
        <span className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-[12px] font-medium text-white/80">
          {index + 1}
        </span>
      )}

      <div className="relative h-full flex flex-col justify-end p-5">
        <p className="text-[11px] font-medium tracking-[0.16em] text-ember uppercase">
          {meta.primaryLabel}
          {exercise.sets ? ` · ${exercise.sets} series` : ""}
        </p>
        <h3 className="mt-1 text-[26px] font-semibold tracking-tight text-white leading-tight">
          {exercise.name}
        </h3>
        <p className="mt-1.5 text-sm text-white/85 leading-snug">
          {exercise.sets} series · {exercise.reps} reps
          {exercise.rest_seconds ? ` · ${exercise.rest_seconds}s` : ""}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-white">
          Ver ejercicio
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  )
}
