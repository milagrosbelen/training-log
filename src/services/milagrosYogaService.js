import { api } from "./api"

export async function getMilagrosYogaProgress() {
  const { data } = await api.get("/profile/yoga-progressions")
  return data?.data?.items ?? []
}

export async function createMilagrosYogaExercise({ userId, name, description, image, stages }) {
  const formData = new FormData()
  formData.append("user_id", String(userId))
  formData.append("name", name)
  if (description) formData.append("description", description)
  if (image) formData.append("image", image)
  stages.forEach((stage, index) => {
    formData.append(`stages[${index}][title]`, stage.title)
    if (stage.description) {
      formData.append(`stages[${index}][description]`, stage.description)
    }
  })

  const { data } = await api.post("/coach/yoga-exercises", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data?.data ?? null
}

export async function recordMilagrosYogaAttempt(payload) {
  const { data } = await api.post("/profile/yoga-progressions/attempts", payload)
  return data?.data ?? null
}

export async function getCoachMilagrosYogaLibrary(userId) {
  const { data } = await api.get("/coach/yoga-exercises/library", { params: { user_id: userId } })
  return data?.data ?? []
}

export async function updateMilagrosYogaExercise(id, { name, description, image, stages }) {
  const formData = new FormData()
  formData.append("_method", "PUT")
  formData.append("name", name)
  formData.append("description", description || "")
  if (image) formData.append("image", image)
  stages.forEach((stage, index) => {
    formData.append(`stages[${index}][title]`, stage.title)
    formData.append(`stages[${index}][description]`, stage.description || "")
  })

  const { data } = await api.post(`/coach/yoga-exercises/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data?.data ?? null
}