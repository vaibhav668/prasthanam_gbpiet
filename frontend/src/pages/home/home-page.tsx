import { useState, useCallback, useEffect } from 'react'
import FancyCarousel from 'react-fancy-circular-carousel'
import 'react-fancy-circular-carousel/FancyCarousel.css'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Hash,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Menu,
  X,
  Bot
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useHomepage } from '../../hooks/use-homepage'
import { resolveAssetUrl } from '../../lib/utils'
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '../../components/ui/avatar'
import type { Announcement, Event, Achievement, HomepageData, TeamMember } from '../../types/api'

interface Report {
  title: string
  description: string
  date: string
  slug: string
  url: string
}

function stripEmojis(text: string) {
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim()
}

function parseSocialLinks(raw?: string | Record<string, string>) {
  if (typeof raw === 'object' && raw !== null) return raw
  try { return JSON.parse((raw as string) || '{}') as Record<string, string> } 
  catch { return {} }
}

function socialLabel(platform: string) {
  const labels: Record<string, string> = {
    github: 'GitHub', discord: 'Discord', twitter: 'X', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', website: 'Website',
  }
  return labels[platform] || platform
}

function StatCard({ icon, label, value, helper }: { icon: React.ReactNode, label: string, value: string, helper: string }) {
  return (
    <div className="bg-[#0A0A0A] p-6 rounded-none transition-colors hover:bg-[#111111] flex items-start gap-4 border border-[#161616]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-white rounded-full border border-[#222]">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="text-4xl font-black font-ginto-nord tracking-tight text-white">{value}</p>
        <p className="text-sm text-neutral-400">{helper}</p>
      </div>
    </div>
  )
}

function TeamGrid({ team }: { team: TeamMember[] }) {
  const featured = team
  const [focusElement, setFocusElement] = useState(0)

  if (!featured || featured.length === 0) {
    return <div className="text-neutral-500">No team members to display.</div>
  }

  const images = featured.map(member => resolveAssetUrl(member.avatar_url))
  const activeMember = featured[focusElement] || featured[0]
  const socials = activeMember ? parseSocialLinks(activeMember.social_links) : {}

  const handlePrev = useCallback(() => {
    const btn = document.querySelectorAll('.fancy-carousel-navigation-button')[0] as HTMLButtonElement
    if (btn) btn.click()
  }, [])

  const handleNext = useCallback(() => {
    const btn = document.querySelectorAll('.fancy-carousel-navigation-button')[1] as HTMLButtonElement
    if (btn) btn.click()
  }, [])

  return (
    <div className="flex flex-col md:flex-row items-center gap-16 w-full mt-12">
      <style>{`
        .fancy-carousel-navigators {
          display: none !important;
          pointer-events: none;
        }
        .fancy-carousel-element img {
          object-fit: cover;
        }
        .central-img img {
          object-fit: cover;
        }
      `}</style>
      
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative min-h-[500px] overflow-hidden">
        {/* Custom Navigation */}
        <button onClick={handlePrev} className="absolute left-2 sm:left-0 z-10 p-3 sm:p-4 bg-[#0A0A0A] text-white hover:bg-white hover:text-black transition-all">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button onClick={handleNext} className="absolute right-2 sm:right-0 z-10 p-3 sm:p-4 bg-[#0A0A0A] text-white hover:bg-white hover:text-black transition-all">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="scale-[0.55] sm:scale-75 md:scale-100 origin-center flex items-center justify-center">
          <FancyCarousel 
            images={images}
            setFocusElement={setFocusElement}
            carouselRadius={180}
            peripheralImageRadius={32}
            centralImageRadius={65}
            focusElementStyling={{border: 'none', boxShadow: '0 0 40px rgba(255,255,255,0.1)'}}
            autoRotateTime={0}
            transitionTime={0.8}
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex justify-center md:justify-start">
        {activeMember && (
          <div className="w-full max-w-md bg-[#0A0A0A] p-6 sm:p-8 transition-all duration-300 shadow-2xl border border-[#161616]">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <Avatar className="size-16 sm:size-20 rounded-none bg-black border border-[#222]">
                  <AvatarImage src={resolveAssetUrl(activeMember.avatar_url)} alt={activeMember.name} />
                  <AvatarFallback className="rounded-none bg-black text-white font-black">{activeMember.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black font-ginto-nord uppercase tracking-tight text-white">{activeMember.name}</h3>
                  <p className="mt-1 text-base sm:text-lg font-medium text-neutral-400">{activeMember.role}</p>
                </div>
              </div>
              {Object.entries(socials).length > 0 && (
                <div className="pt-4 border-t border-[#1a1a1a] flex flex-wrap items-center gap-3">
                  {Object.entries(socials).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#111111] px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all hover:bg-white hover:text-black border border-[#222]"
                    >
                      <span>{socialLabel(platform)}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-4">
      {events.slice(0, 4).map((event) => {
        const eventDate = new Date(event.date)
        return (
          <div key={event.id} className="bg-[#0A0A0A] p-6 hover:bg-[#111111] transition-colors flex flex-col md:flex-row gap-6 border border-[#161616]">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center bg-black text-center border border-[#222]">
              <span className="text-3xl font-black font-ginto-nord leading-none text-white">{format(eventDate, 'd')}</span>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                {format(eventDate, 'MMM')}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-[#111111] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white border border-[#222]">
                  {event.event_type}
                </span>
                <span className="bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-black">
                  {event.status}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold font-ginto-nord tracking-tight text-white">{event.title}</h3>
              <p className="mt-2 line-clamp-2 text-base leading-relaxed text-neutral-400">{event.description}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
                <div className="flex flex-wrap items-center gap-5 text-sm text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {format(eventDate, 'EEE, MMM d')}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {format(eventDate, 'h:mm a')}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      {event.location}
                    </span>
                  )}
                </div>
                {event.registration_link && (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors border border-white"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  if (!achievements || achievements.length === 0) return null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {achievements.map((item) => (
        <div
          key={item.id}
          className="bg-[#0A0A0A] p-8 hover:bg-[#111111] transition-all border border-[#161616] flex flex-col justify-between group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="bg-white text-black px-3 py-1 text-[11px] font-black uppercase tracking-wider">
                {item.rank}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                {item.year}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                {item.category}
              </span>
              <h3 className="text-2xl font-black font-ginto-nord tracking-tight text-white uppercase group-hover:text-neutral-100">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-neutral-400">{item.competition}</p>
              <p className="mt-3 text-base leading-relaxed text-neutral-400">{item.description}</p>
            </div>
          </div>
          {item.badge && (
            <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                <Trophy className="h-4 w-4 text-white" />
                {item.badge}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="space-y-4">
      {announcements.slice(0, 4).map((announcement) => (
        <div key={announcement.id} className="bg-[#0A0A0A] p-8 hover:bg-[#111111] transition-colors border border-[#161616]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold font-ginto-nord tracking-tight text-white">
                  {stripEmojis(announcement.title)}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-neutral-400">
                  {stripEmojis(announcement.content)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-5 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </span>
            </div>
            {announcement.registration_link && (
              <a
                href={announcement.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-black px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors border border-white"
              >
                <span>Register Now</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportsList() {
  const [reports, setReports] = useState<Report[]>([])
  
  useEffect(() => {
    fetch('/reports/index.json')
      .then(res => {
        if (!res.ok) throw new Error(`Reports fetch failed: ${res.status}`)
        return res.json()
      })
      .then(data => {
        data.sort((a: Report, b: Report) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setReports(data)
      })
      .catch(console.error)
  }, [])

  if (reports.length === 0) return null;

  return (
    <div className="space-y-4">
      {reports.slice(0, 3).map((report) => (
        <div key={report.slug} className="bg-[#0A0A0A] p-6 hover:bg-[#111111] transition-colors flex flex-col md:flex-row gap-6 border border-[#161616]">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold font-ginto-nord tracking-tight text-white">{report.title}</h3>
            <div className="mt-2 text-sm text-neutral-500 font-bold uppercase tracking-widest">
              {format(new Date(report.date), 'MMMM d, yyyy')}
            </div>
            <p className="mt-3 text-base leading-relaxed text-neutral-400">{report.description}</p>
            <a href={report.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-neutral-300">
              Read Report <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ))}
      <div className="pt-4">
        <a href="/reports/events/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full bg-[#111111] text-white px-6 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-colors border border-[#222]">
          View All Past Events
        </a>
      </div>
    </div>
  )
}

function HomeShell({ data }: { data: HomepageData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden" style={{ WebkitTapHighlightColor: 'transparent' }}>
      {/* Ultra Minimal Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-black border border-[#222]">
              <img src="/new-logo.png" alt="Prasthanam Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-base font-extrabold font-ginto-nord uppercase tracking-tight text-white">{data.club.name}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Robotics Club • GBPIET</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#team" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Members</a>
            <a href="#events" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Events</a>
            <a href="#achievements" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Achievements</a>
            <a href="#reports" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Reports</a>
            <a href="#updates" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Updates</a>
          </div>
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md px-6 py-6 flex flex-col gap-6 border-t border-neutral-900 absolute top-full left-0 right-0 shadow-2xl z-50">
            <a href="#team" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Members</a>
            <a href="#events" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Events</a>
            <a href="#achievements" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Achievements</a>
            <a href="#reports" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Reports</a>
            <a href="#updates" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Updates</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative pt-36 pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <section className="max-w-4xl text-center lg:text-left">
            <h1 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white sm:text-7xl lg:text-8xl leading-[0.9]">
              THINK. BUILD.<br className="hidden sm:block" /> CONQUER.
            </h1>
            <p className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-neutral-400">
              {data.club.description}
            </p>
            <p className="mt-4 max-w-2xl text-base sm:text-lg italic text-neutral-500 font-medium">
              &ldquo;From imagination to innovation, our journey continues.&rdquo;
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
              <a href="#achievements" className="inline-flex justify-center items-center h-14 bg-white text-black px-10 font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
                Explore Achievements
                <ArrowRight className="ml-3 h-5 w-5" />
              </a>
              <a href="#events" className="inline-flex justify-center items-center h-14 bg-[#111] text-white px-8 font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors border border-[#222]">
                Upcoming Events
              </a>
            </div>
          </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-32 px-6 py-20 lg:px-10">
        {/* Stats Grid */}
        <section className="grid gap-1 md:grid-cols-2 xl:grid-cols-4 bg-black">
          <StatCard icon={<Bot className="h-5 w-5" />} label="Robots Built" value="15+" helper="combat, UAVs & rovers" />
          <StatCard icon={<Users className="h-5 w-5" />} label="Club Members" value={String(data.stats.total_members)} helper="engineers & builders" />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Trophies & Wins" value={String(data.achievements?.length || 6)} helper="national & state awards" />
          <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Bootcamps & Fests" value={String(data.stats.total_events)} helper="annual technical clashes" />
        </section>

        {/* Club Mission Banner */}
        <section className="bg-[#0A0A0A] p-12 md:p-16 flex flex-col md:flex-row items-center gap-16 border border-[#161616]">
          <div className="flex-1 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">About The Club</span>
            <h2 className="text-3xl md:text-5xl font-black font-ginto-nord uppercase text-white tracking-tighter leading-none">
              Engineering autonomous intelligence & hardware power.
            </h2>
            <p className="text-neutral-400 text-base md:text-lg leading-relaxed max-w-xl">
              From designing custom PCBs and machining combat chassis to programming autonomous computer vision algorithms, Prasthanam pushes the boundaries of collegiate robotics at GBPIET.
            </p>
          </div>
          <div className="w-full md:w-96 bg-black p-8 border border-[#222]">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Club Members</h4>
            <div className="flex items-center justify-between gap-4">
              <AvatarGroup>
                {data.team.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className="size-12 bg-[#111] border border-[#222]">
                    <AvatarImage src={resolveAssetUrl(member.avatar_url)} alt={member.name} />
                    <AvatarFallback className="bg-[#111] text-white font-bold">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="text-xs font-black text-black bg-white px-3 py-1.5 uppercase tracking-widest">
                {data.team.length} Members
              </span>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="space-y-12 scroll-mt-32">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Club Members</h2>
          </div>
          <TeamGrid team={data.team} />
        </section>

        {/* Events Section */}
        <section id="events" className="grid gap-12 lg:grid-cols-[300px_minmax(0,1fr)] scroll-mt-32">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Competitions & Camps</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Events</h2>
          </div>
          <EventList events={data.events} />
        </section>

        {/* Achievements Section */}
        <section id="achievements" className="space-y-12 scroll-mt-32">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Hall of Fame</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Achievements & Wins</h2>
            <p className="text-neutral-400 text-base">
              National robotics championships, track record timings, and innovation honors won by the Prasthanam team.
            </p>
          </div>
          <AchievementsList achievements={data.achievements || []} />
        </section>

        {/* Reports Section */}
        <section id="reports" className="grid gap-12 lg:grid-cols-[300px_minmax(0,1fr)] scroll-mt-32">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Documentation</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Event Reports</h2>
          </div>
          <ReportsList />
        </section>

        {/* Bulletins & Updates Section */}
        <section id="updates" className="grid gap-12 lg:grid-cols-[300px_minmax(0,1fr)] scroll-mt-32">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Notices</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Club Bulletin</h2>
          </div>
          <AnnouncementList announcements={data.announcements} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] mt-20 border-t border-[#1a1a1a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-black border border-[#222]">
              <img src="/new-logo.png" alt="Prasthanam Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-2xl font-black font-ginto-nord uppercase tracking-tighter text-white">{data.club.name}</p>
              <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest">{data.club.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href={`mailto:${data.club.contact_email}`} className="bg-[#111111] text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors text-center border border-[#222]">
              Contact Club
            </a>
            <a href="#achievements" className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-colors text-center">
              View Achievements
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-md bg-[#0A0A0A] p-12 text-center flex flex-col items-center gap-6 border border-[#222]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-white" />
        <div className="space-y-2">
          <h2 className="text-xl font-black font-ginto-nord tracking-tighter text-white uppercase">Loading</h2>
          <p className="text-sm text-neutral-500 uppercase tracking-widest">Pulling Prasthanam data</p>
        </div>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-lg bg-[#0A0A0A] p-12 text-center border border-[#222]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#111111] text-white mb-6 border border-[#222]">
          <Megaphone className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black font-ginto-nord tracking-tighter text-white uppercase">Unavailable</h2>
        <p className="mt-4 text-base text-neutral-500">
          The club data could not be loaded.
        </p>
      </div>
    </div>
  )
}

export function HomePage() {
  const { data, isLoading, error } = useHomepage()

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState />

  return <HomeShell data={data} />
}
