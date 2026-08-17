import { useEffect, useMemo, useState } from "react"
import { Lock } from "lucide-react"
import { getPoseProgress, updatePoseProgress } from "../../services/poseService"
import {
  POSE_FAMILIES,
  POSE_STATUSES,
  getPoseImage,
  resolvePoseLevels,
} from "../../data/poseProgressions"

const BLAZE = "#FF5C00"
const BLAZE_GLOW = "rgba(255, 92, 0, 0.45)"

export default function PoseProgressSection() {
  const [saved, setSaved] = useState({})
  const [hint, setHint] = useState("")

  useEffect(() => {
    getPoseProgress()
      .then((progress) => setSaved(progress && typeof progress === "object" ? progress : {}))
      .catch(() => {})
  }, [])

  const families = useMemo(
    () => POSE_FAMILIES.map((family) => ({
      ...family,
      levels: resolvePoseLevels(family, saved),
    })),
    [saved]
  )

  const setStatus = async (levelId, status) => {
    const next = { ...saved }
    if (!status || saved[levelId] === status) {
      delete next[levelId]
    } else {
      next[levelId] = status
    }
    setSaved(next)
    try {
      const stored = await updatePoseProgress(next)
      setSaved(stored && typeof stored === "object" ? stored : next)
    } catch {
      setSaved(saved)
    }
  }

  return (
    <section className="mt-10">
      <p className="text-[11px] font-semibold tracking-[0.22em] uppercase" style={{ color: BLAZE }}>
        Tus poses
      </p>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Las que ya te salen están abiertas. El cuervo tiene niveles (bajar normal o con piernas juntas), no poses distintas.
      </p>
      {hint ? <p className="mt-2 text-[12px] italic" style={{ color: BLAZE }}>{hint}</p> : null}

      <div className="mt-5 space-y-6">
        {families.map((family) => (
          <article key={family.id}>
            <div className="flex items-baseline justify-between gap-3 px-0.5">
              <div>
                <h3 className="font-display font-black italic tracking-tight text-[22px] text-white">
                  {family.name}
                </h3>
                {family.spanish ? (
                  <p className="mt-0.5 text-[12px] text-slate-500">{family.spanish}</p>
                ) : null}
              </div>
              <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{family.zone}</span>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {family.levels.map((level, index) => {
                const locked = !level.open
                return (
                  <div key={level.id} className="w-[148px] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (locked) {
                          const prev = family.levels[index - 1]
                          setHint(prev ? `Primero dominá ${prev.name}.` : "Esta pose todavía está bloqueada.")
                          return
                        }
                        setHint("")
                      }}
                      className="relative w-full overflow-hidden rounded-[22px] h-[196px] border text-left"
                      style={{
                        borderColor: locked ? "rgba(255,255,255,0.12)" : "rgba(255,92,0,0.55)",
                        boxShadow: locked ? "none" : `0 0 16px ${BLAZE_GLOW}`,
                      }}
                    >
                      <img
                        src={getPoseImage(level.image)}
                        alt={level.name}
                        className={`absolute inset-0 h-full w-full object-cover ${locked ? "brightness-[0.28] grayscale" : "brightness-[0.78]"}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      {locked ? (
                        <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <Lock className="w-7 h-7" strokeWidth={2.2} />
                          <span className="mt-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
                            Nivel {index + 1}
                          </span>
                        </span>
                      ) : (
                        <span
                          className="absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ backgroundColor: BLAZE, color: "#080809" }}
                        >
                          Nivel {index + 1}
                        </span>
                      )}
                      <p className="absolute bottom-3 left-3 right-3 font-display font-black italic text-[16px] leading-tight text-white">
                        {level.name}
                      </p>
                    </button>
                    {locked ? (
                      <p className="mt-2 text-[11px] text-slate-500 text-center">Bloqueado</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {POSE_STATUSES.map((item) => {
                          const active = level.status === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setStatus(level.id, item.id)}
                              className="h-8 rounded-full text-[10px] font-semibold"
                              style={
                                active
                                  ? { backgroundColor: BLAZE, color: "#080809" }
                                  : { backgroundColor: "transparent", color: "#cfcfcf", border: "1px solid rgba(255,255,255,0.18)" }
                              }
                            >
                              {item.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
