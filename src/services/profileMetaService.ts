export type ProfileMeta = {
  skills: string[]
}

const STORAGE_KEY_PREFIX = 'studybuddy.profileMeta.'

export function getProfileMeta(userId: string): ProfileMeta {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`)
    if (!raw) {
      return { skills: [] }
    }

    const parsed = JSON.parse(raw) as ProfileMeta
    if (!parsed || !Array.isArray(parsed.skills)) {
      return { skills: [] }
    }

    return {
      skills: parsed.skills.filter((skill) => skill.trim() !== ''),
    }
  } catch {
    return { skills: [] }
  }
}

export function saveProfileMeta(userId: string, meta: ProfileMeta) {
  window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(meta))
}
