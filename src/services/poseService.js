import { api } from "./api"
import { normalizePoseProgress } from "../utils/poseLadder"

export async function getPoseProgress() {
  const { data } = await api.get("/profile/poses")
  return normalizePoseProgress(data?.data?.pose_progress)
}

export async function updatePoseProgress(pose_progress) {
  const { data } = await api.patch("/profile/poses", {
    pose_progress: normalizePoseProgress(pose_progress),
  })
  return normalizePoseProgress(data?.data?.pose_progress ?? pose_progress)
}
