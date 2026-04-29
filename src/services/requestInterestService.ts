const STORAGE_KEY = 'studybuddy.requestApplicants'

export type RequestApplicant = {
  requestId: number
  userId: string
  createdAt: string
}

function readApplicants() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return [] as RequestApplicant[]
    }

    const parsed = JSON.parse(raw) as RequestApplicant[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return [] as RequestApplicant[]
  }
}

function writeApplicants(items: RequestApplicant[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addRequestApplicant(requestId: number, userId: string) {
  const current = readApplicants()
  const alreadyExists = current.some(
    (item) => item.requestId === requestId && item.userId === userId,
  )

  if (alreadyExists) {
    return
  }

  writeApplicants([
    ...current,
    {
      requestId,
      userId,
      createdAt: new Date().toISOString(),
    },
  ])
}

export function getRequestApplicantIds(requestId: number) {
  return readApplicants()
    .filter((item) => item.requestId === requestId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((item) => item.userId)
}
