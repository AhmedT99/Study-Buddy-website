import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="relative">
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-20">
        <div className="relative z-10 lg:col-span-7">
          <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
            Study Buddy Finder
          </p>
          <h1 className="mt-5 font-display text-[2.35rem] font-medium leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem]">
            Find study partners who actually{' '}
            <span className="italic text-accent-text">show up.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">
            Publish what you need, filter the community feed, and move from request
            to private message without losing context.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 font-display text-sm font-semibold text-surface-0 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_24px_-8px_rgba(45,212,191,0.45)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-accent-deep"
            >
              Start free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-1/80 px-6 py-3 font-display text-sm font-semibold text-text-primary backdrop-blur-sm transition-all duration-200 hover:border-accent/35 hover:text-accent-text"
            >
              Log in
            </Link>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Requests</dt>
              <dd className="mt-1 font-display text-2xl font-medium text-text-primary">Live feed</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Messaging</dt>
              <dd className="mt-1 font-display text-2xl font-medium text-text-primary">1:1 chats</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Profiles</dt>
              <dd className="mt-1 font-display text-2xl font-medium text-text-primary">Rich context</dd>
            </div>
          </dl>
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:col-span-5 lg:pt-4">
          <div className="relative -rotate-1 rounded-2xl border border-border bg-surface-1/90 p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.65)] backdrop-blur-md transition-transform duration-300 hover:rotate-0 sm:p-7">
            <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-accent/15 blur-2xl" />
            <p className="font-display text-sm font-medium text-text-primary">Create requests</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Post goals, availability, and the role you need so the right people surface fast.
            </p>
          </div>
          <div className="relative ml-0 translate-y-0 rounded-2xl border border-border bg-surface-2/90 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.55)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:ml-8 sm:p-7">
            <p className="font-display text-sm font-medium text-text-primary">Message instantly</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Offer help from the feed and keep every thread in one calm inbox.
            </p>
          </div>
          <div className="relative -rotate-1 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-muted to-transparent p-6 sm:-ml-4 sm:p-7">
            <p className="font-display text-sm font-medium text-accent-text">Own your profile</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Share field of study, language, and style so matches feel intentional.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
