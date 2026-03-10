import { useEffect, useState } from 'react'
import supabase from '../../lib/supabase'
import { getProfileByUserId } from '../../services/profileService'

function DashboardPage() {
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [profilePictureUrl, setProfilePictureUrl] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data } = await getProfileByUserId(user.id)

      if (!data) {
        return
      }

      setName(data.name || '')
      setUniversity(data.university || '')
      setProfilePictureUrl(data.profile_picture_url || '')
    }

    loadProfile()
  }, [])

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 p-8 text-white shadow-md sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            Dashboard
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            {name ? `Welcome back, ${name}` : 'Welcome back'}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Your account is ready. Keep your profile updated and prepare to find
            better study matches.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
              Profile completed
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm backdrop-blur">
              Dashboard unlocked
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Account summary
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Profile picture</p>
              <div className="mt-3">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-500">
                    Photo
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Student name</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {name || 'Profile user'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">University</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {university || 'Not added yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Review and update your student profile any time.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-900">Study Matches</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Matching features will appear here as your app grows.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-900">Next Step</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep exploring the app and continue building the student experience.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
