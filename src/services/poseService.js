import { api } from "./api"

export async function getPoseProgress() {
  const { data } = await api.get("/profile/poses")
  return data?.data?.pose_progress ?? {}
}

export async function updatePoseProgress(pose_progress) {
  const { data } = await api.patch("/profile/poses", { pose_progress })
  return data?.data?.pose_progress ?? pose_progress
}
