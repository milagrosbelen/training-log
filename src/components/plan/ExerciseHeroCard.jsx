import { Check } from "lucide-react"

import { resolveExerciseMeta } from "../../data/exerciseCatalog"

import ExercisePhoto from "../ExercisePhoto"



const BLAZE = "#FF5C00"



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

      className="relative w-full overflow-hidden rounded-[28px] h-[210px] border border-white/10 text-left transition-transform duration-200 ease-out active:scale-[0.985]"

    >

      <ExercisePhoto

        name={exercise.name}

        className="absolute inset-0 h-full w-full object-cover object-center"

      />

      <div

        className="absolute inset-0"

        style={{

          background:

            "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.45) 48%, rgba(255,92,0,0.16) 100%)",

        }}

      />



      {completed ? (

        <span

          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white"

          style={{ backgroundColor: BLAZE, boxShadow: "0 0 14px rgba(255,92,0,0.55)" }}

        >

          <Check className="w-4 h-4" strokeWidth={2.6} />

        </span>

      ) : (

        <span className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-[12px] font-semibold text-white/85 border border-white/15">

          {index + 1}

        </span>

      )}



      <div className="relative h-full flex flex-col justify-end p-5">

        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: BLAZE }}>

          {meta.primaryLabel}

          {exercise.sets ? ` · ${exercise.sets} series` : ""}

        </p>

        <h3 className="mt-1 font-display text-[28px] font-black italic tracking-tight text-white leading-[0.95]">

          {exercise.name}

        </h3>

        <p className="mt-1.5 text-sm text-white/85 leading-snug">

          {exercise.sets} series · {exercise.reps} reps

          {exercise.rest_seconds ? ` · ${exercise.rest_seconds}s` : ""}

        </p>

        <span className="mt-3 inline-flex items-center text-[13px] font-medium text-white underline underline-offset-4 decoration-white/70">

          Ver ejercicio

        </span>

      </div>

    </button>

  )

}


