import { slugExercise } from "./exerciseImages"
import {
  POSE_FAMILIES,
  POSE_STATUSES,
  YOGA_CLASS_WEEKDAYS,
  isChallengeStatus,
  isMaintainedStatus,
  poseStatusRank,
} from "../data/poseProgressions"

export function todayISODate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isYogaClassWeekday(weekday) {
  return YOGA_CLASS_WEEKDAYS.includes(Number(weekday))
}

export function normalizePoseStatus(value) {
  if (value === "bien") return "domino"
  return POSE_STATUSES.some((item) => item.id === value) ? value : ""
}

export function normalizePoseEntry(value, fallbackName = "") {
  if (!value) return null
  if (typeof value === "string") {
    const status = normalizePoseStatus(value)
    return status ? { status, name: fallbackName, last_practiced: "", source: "" } : null
  }
  if (typeof value !== "object") return null
  const status = normalizePoseStatus(value.status)
  if (!status) return null
  return {
    status,
    name: String(value.name || fallbackName || "").trim(),
    spanish: String(value.spanish || "").trim(),
    last_practiced: /^\d{4}-\d{2}-\d{2}$/.test(value.last_practiced || "") ? value.last_practiced : "",
    source: value.source === "clase" ? "clase" : value.source === "practica" ? "practica" : "",
  }
}

export function normalizePoseProgress(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}
  const next = {}
  for (const [id, value] of Object.entries(source)) {
    const catalog = findCatalogPose(id)
    const entry = normalizePoseEntry(value, catalog?.title || "")
    if (!entry) continue
    next[id] = entry
  }
  return next
}

export function findCatalogPose(poseId) {
  for (const family of POSE_FAMILIES) {
    const level = family.levels.find((item) => item.id === poseId)
    if (!level) continue
    return {
      id: level.id,
      familyId: family.id,
      familyName: family.name,
      zone: family.zone,
      name: level.name,
      title: family.levels.length > 1 ? `${family.name} · ${level.name}` : family.name,
      spanish: family.spanish,
      image: level.image,
      custom: false,
    }
  }
  return null
}

export function matchCatalogPoseByName(name) {
  const slug = slugExercise(name)
  if (!slug) return null
  for (const family of POSE_FAMILIES) {
    const familyHit = [family.name, family.spanish, family.id].map(slugExercise).includes(slug)
    if (familyHit) {
      const level = family.levels.find((item) => item.startUnlocked) || family.levels[0]
      return findCatalogPose(level.id)
    }
    for (const level of family.levels) {
      const levelHit = [level.id, level.name, `${family.name} ${level.name}`].map(slugExercise).includes(slug)
      if (levelHit) return findCatalogPose(level.id)
    }
  }
  return null
}

export function customPoseId(name) {
  const slug = slugExercise(name) || `pose-${Date.now()}`
  return `custom-${slug}`
}

export function listPoseCards(saved = {}) {
  const progress = normalizePoseProgress(saved)
  const seen = new Set()
  const cards = []

  for (const family of POSE_FAMILIES) {
    for (const level of family.levels) {
      seen.add(level.id)
      const catalog = findCatalogPose(level.id)
      const entry = progress[level.id]
      cards.push({
        ...catalog,
        status: entry?.status || "",
        lastPracticed: entry?.last_practiced || "",
        source: entry?.source || "",
        rank: poseStatusRank(entry?.status),
      })
    }
  }

  for (const [id, entry] of Object.entries(progress)) {
    if (seen.has(id)) continue
    cards.push({
      id,
      familyId: "clase",
      familyName: entry.name || "De clase",
      zone: "Clase",
      name: entry.name || "Pose nueva",
      title: entry.name || "Pose nueva",
      spanish: entry.spanish || "",
      image: "",
      custom: true,
      status: entry.status,
      lastPracticed: entry.last_practiced || "",
      source: entry.source || "clase",
      rank: poseStatusRank(entry.status),
    })
  }

  return cards
}

function daysSince(dateStr, today = todayISODate()) {
  if (!dateStr) return 999
  const then = new Date(`${dateStr}T00:00:00`)
  const now = new Date(`${today}T00:00:00`)
  const diff = Math.round((now - then) / 86400000)
  return Number.isFinite(diff) ? diff : 999
}

export function pickDailyPosePractice(saved = {}, today = todayISODate()) {
  const cards = listPoseCards(saved)
  const maintain = cards
    .filter((card) => isMaintainedStatus(card.status))
    .sort((a, b) => {
      const stale = daysSince(b.lastPracticed, today) - daysSince(a.lastPracticed, today)
      if (stale) return stale
      return a.rank - b.rank
    })
    .slice(0, 6)

  const inProgress = cards
    .filter((card) => isChallengeStatus(card.status))
    .sort((a, b) => b.rank - a.rank || daysSince(b.lastPracticed, today) - daysSince(a.lastPracticed, today))

  let challenge = inProgress[0] || null
  if (!challenge) {
    for (const family of POSE_FAMILIES) {
      const levels = family.levels
      for (let index = 0; index < levels.length; index += 1) {
        const card = cards.find((item) => item.id === levels[index].id)
        if (!card || card.status) continue
        const previous = index === 0 ? null : cards.find((item) => item.id === levels[index - 1].id)
        const unlocked = levels[index].startUnlocked || isMaintainedStatus(previous?.status)
        if (unlocked) {
          challenge = { ...card, status: "aprendiendo", rank: 2 }
          break
        }
      }
      if (challenge) break
    }
  }

  return {
    maintain: maintain.filter((card) => card.id !== challenge?.id),
    challenge,
  }
}

export function upsertPoseEntry(saved, poseId, patch) {
  const progress = normalizePoseProgress(saved)
  const current = progress[poseId] || { status: "", name: "", last_practiced: "", source: "" }
  const status = Object.prototype.hasOwnProperty.call(patch, "status")
    ? normalizePoseStatus(patch.status)
    : current.status
  if (!status) {
    const copy = { ...progress }
    delete copy[poseId]
    return copy
  }
  return {
    ...progress,
    [poseId]: {
      ...current,
      ...patch,
      status,
    },
  }
}
