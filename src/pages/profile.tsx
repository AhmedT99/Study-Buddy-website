import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../components/Toast'
import supabase from '../lib/supabase'
import { getProfileMeta, saveProfileMeta } from '../services/profileMetaService'
import { getProfileByUserId } from '../services/profileService'

type ProfileFormData = {
  name: string
  university: string
  education_level: string
  study_level: string
  major: string
  field_of_study: string
  preferred_study_style: string
  preferred_language: string
  timezone: string
  country: string
  gender: string
  bio: string
}

const emptyProfileForm: ProfileFormData = {
  name: '',
  university: '',
  education_level: '',
  study_level: '',
  major: '',
  field_of_study: '',
  preferred_study_style: '',
  preferred_language: '',
  timezone: '',
  country: '',
  gender: '',
  bio: '',
}

const educationLevelOptions = [
  'High School',
  'College',
  'University',
  'Graduate School',
]

const studyLevelOptions = ['Beginner', 'Intermediate', 'Advanced']

const studyStyleOptions = [
  'Solo Study',
  'Pair Study',
  'Group Study',
  'Mixed Style',
]

const languageOptions = ['English', 'Arabic', 'French', 'German']

const timezoneOptions = [
  'UTC',
  'UTC+1',
  'UTC+2',
  'UTC+3',
  'UTC+4',
  'UTC+5',
  'UTC-5',
]

const countryOptions = [
  'Egypt',
  'Saudi Arabia',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Canada',
]

const genderOptions = ['Male', 'Female', 'Prefer not to say']
const avatarBucketName = 'avatars'
const inputClassName =
  'w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none transition-colors duration-200 placeholder:text-text-tertiary focus:border-accent/40 focus:ring-1 focus:ring-accent/20'
const sectionCardClassName =
  'scroll-mt-28 rounded-2xl border border-border bg-surface-1 p-6'

function ProfilePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(emptyProfileForm)
  const [userId, setUserId] = useState('')
  const [profileExists, setProfileExists] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [skillsInput, setSkillsInput] = useState('')
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProfileData() {
      setIsPageLoading(true)
      setErrorMessage('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUserId(user.id)

      const { data, error } = await getProfileByUserId(user.id)
      const profileMeta = getProfileMeta(user.id)
      setSkillsInput(profileMeta.skills.join(', '))

      if (error) {
        setErrorMessage(error.message)
        setIsPageLoading(false)
        return
      }

      if (data) {
        setProfileExists(true)
        setProfilePictureUrl(data.profile_picture_url || '')
        setImagePreviewUrl(data.profile_picture_url || '')
        setFormData({
          name: data.name || '',
          university: data.university || '',
          education_level: data.education_level || '',
          study_level: data.study_level || '',
          major: data.major || '',
          field_of_study: data.field_of_study || '',
          preferred_study_style: data.preferred_study_style || '',
          preferred_language: data.preferred_language || '',
          timezone: data.timezone || '',
          country: data.country || '',
          gender: data.gender || '',
          bio: data.bio || '',
        })
      }

      setIsPageLoading(false)
    }

    loadProfileData()
  }, [navigate])

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)

    let savedProfilePictureUrl = profilePictureUrl

    if (selectedImageFile) {
      const safeFileName = selectedImageFile.name.replaceAll(' ', '-')
      const filePath = `${userId}/${Date.now()}-${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from(avatarBucketName)
        .upload(filePath, selectedImageFile, {
          upsert: true,
        })

      if (uploadError) {
        setIsSaving(false)
        setErrorMessage(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from(avatarBucketName)
        .getPublicUrl(filePath)

      savedProfilePictureUrl = data.publicUrl
      setProfilePictureUrl(data.publicUrl)
    }

    const profileData = {
      user_id: userId,
      name: formData.name,
      university: formData.university,
      education_level: formData.education_level,
      study_level: formData.study_level,
      major: formData.major,
      field_of_study: formData.field_of_study,
      preferred_study_style: formData.preferred_study_style,
      preferred_language: formData.preferred_language,
      timezone: formData.timezone,
      country: formData.country,
      gender: formData.gender,
      bio: formData.bio,
      profile_picture_url: savedProfilePictureUrl,
    }
    const parsedSkills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill !== '')

    saveProfileMeta(userId, { skills: parsedSkills })

    if (profileExists) {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId)

      setIsSaving(false)

      if (error) {
        setErrorMessage(error.message)
        showToast('Failed to save profile', 'error')
        return
      }

      showToast('Profile saved successfully', 'success')
      navigate('/dashboard')
      return
    }

    const { error } = await supabase.from('profiles').insert(profileData)

    setIsSaving(false)

    if (error) {
      setErrorMessage(error.message)
      showToast('Failed to create profile', 'error')
      return
    }

    showToast('Profile created successfully', 'success')
    navigate('/dashboard')
  }

  if (isPageLoading) {
    return (
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-surface-1 p-8 text-center">
        <div className="mx-auto mb-3 h-2 w-2 animate-pulse rounded-full bg-accent" />
        <p className="text-sm text-text-secondary">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[220px_minmax(0,1fr)]">
      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <div>
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">Profile</p>
          <h2 className="mt-2 font-display text-xl font-medium leading-snug text-text-primary">
            How you show up in the network.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Jump between sections — nothing about validation or save behavior changed.
          </p>
        </div>
        <nav className="hidden flex-col gap-1 border-t border-border pt-6 text-sm xl:flex">
          <a href="#section-photo" className="rounded-lg px-3 py-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
            Photo
          </a>
          <a href="#section-basic" className="rounded-lg px-3 py-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
            Basics
          </a>
          <a href="#section-preferences" className="rounded-lg px-3 py-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
            Study prefs
          </a>
          <a href="#section-bio" className="rounded-lg px-3 py-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary">
            Bio
          </a>
        </nav>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div id="section-photo" className={sectionCardClassName}>
          <div className="mb-5">
            <h3 className="font-display text-base font-semibold text-text-primary">Profile photo</h3>
            <p className="mt-1 text-sm text-text-tertiary">
              Upload a clear image that makes your profile feel personal.
            </p>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-xs font-medium text-text-tertiary">Photo</span>
              )}
            </div>

            <div className="flex-1">
              <label
                htmlFor="profile-picture"
                className="mb-1.5 block text-xs font-medium text-text-secondary"
              >
                Profile Picture
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-surface-0"
              />
            </div>
          </div>
        </div>

        <div id="section-basic" className={sectionCardClassName}>
          <div className="mb-5">
            <h3 className="font-display text-base font-semibold text-text-primary">Basic information</h3>
            <p className="mt-1 text-sm text-text-tertiary">
              Tell others about your academic background and current focus.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="university"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              University
            </label>
            <input
              id="university"
              name="university"
              type="text"
              value={formData.university}
              onChange={handleInputChange}
              placeholder="Your university"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="education_level"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Education Level
            </label>
            <select
              id="education_level"
              name="education_level"
              value={formData.education_level}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select education level</option>
              {educationLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="study_level"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Study Level
            </label>
            <select
              id="study_level"
              name="study_level"
              value={formData.study_level}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select study level</option>
              {studyLevelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="major"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Major
            </label>
            <input
              id="major"
              name="major"
              type="text"
              value={formData.major}
              onChange={handleInputChange}
              placeholder="Computer Science"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="field_of_study"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Field Of Study
            </label>
            <input
              id="field_of_study"
              name="field_of_study"
              type="text"
              value={formData.field_of_study}
              onChange={handleInputChange}
              placeholder="Software Engineering"
              className={inputClassName}
              required
            />
          </div>
        </div>
        </div>

        <div id="section-preferences" className={sectionCardClassName}>
          <div className="mb-5">
            <h3 className="font-display text-base font-semibold text-text-primary">Study preferences</h3>
            <p className="mt-1 text-sm text-text-tertiary">
              Choose the working style and communication settings that fit you.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="preferred_study_style"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Preferred Study Style
            </label>
            <select
              id="preferred_study_style"
              name="preferred_study_style"
              value={formData.preferred_study_style}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select study style</option>
              {studyStyleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="preferred_language"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Preferred Language
            </label>
            <select
              id="preferred_language"
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select language</option>
              {languageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select timezone</option>
              {timezoneOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select country</option>
              {countryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="gender"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        </div>

        <div id="section-bio" className={sectionCardClassName}>
          <label
            htmlFor="bio"
            className="mb-1.5 block text-xs font-medium text-text-secondary"
          >
            Bio
          </label>
          <p className="mb-3 text-xs text-text-tertiary">
            Share a short summary about your study goals and interests.
          </p>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className={inputClassName}
            placeholder="I enjoy focused study sessions, group revision, and helping others with difficult topics."
            required
          />
          <div className="mt-4">
            <label
              htmlFor="skills"
              className="mb-1.5 block text-xs font-medium text-text-secondary"
            >
              Skills
            </label>
            <p className="mb-2 text-xs text-text-tertiary">
              Comma-separated skills help others discover your profile.
            </p>
            <input
              id="skills"
              value={skillsInput}
              onChange={(event) => setSkillsInput(event.target.value)}
              placeholder="Calculus, Java, IELTS, Time management"
              className={inputClassName}
            />
          </div>
        </div>

        {errorMessage && (
          <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Your profile will be saved securely to your account.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-accent px-5 py-2.5 font-display text-sm font-medium text-surface-0 shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-200 hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
