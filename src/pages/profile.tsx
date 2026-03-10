import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'
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

function ProfilePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(emptyProfileForm)
  const [userId, setUserId] = useState('')
  const [profileExists, setProfileExists] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
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

    if (profileExists) {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId)

      setIsSaving(false)

      if (error) {
        setErrorMessage(error.message)
        return
      }

      navigate('/dashboard')
      return
    }

    const { error } = await supabase.from('profiles').insert(profileData)

    setIsSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate('/dashboard')
  }

  if (isPageLoading) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
        <p className="text-sm text-slate-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Profile setup
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Complete your student profile
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Add your study details so the app can give you the right experience.
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Save your profile to continue to the dashboard
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Profile photo</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload a clear image for your student profile.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-400">Photo</span>
              )}
            </div>

            <div className="flex-1">
              <label
                htmlFor="profile-picture"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Profile Picture
              </label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
              />
              <p className="mt-2 text-sm text-slate-500">
                Your image will be uploaded to the public `avatars` bucket.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Basic information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Tell us about your academic background.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="university"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="education_level"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Education Level
            </label>
            <select
              id="education_level"
              name="education_level"
              value={formData.education_level}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Study Level
            </label>
            <select
              id="study_level"
              name="study_level"
              value={formData.study_level}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="field_of_study"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Study preferences
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select how you like to learn and communicate.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="preferred_study_style"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Preferred Study Style
            </label>
            <select
              id="preferred_study_style"
              name="preferred_study_style"
              value={formData.preferred_study_style}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Preferred Language
            </label>
            <select
              id="preferred_language"
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

        <div>
          <label
            htmlFor="bio"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Bio
          </label>
          <p className="mb-3 text-sm text-slate-500">
            Share a short summary about your study goals and interests.
          </p>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={5}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="I enjoy focused study sessions, group revision, and helping others with difficult topics."
            required
          />
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Your profile will be saved securely to your account.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSaving ? 'Saving profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ProfilePage
