import { useState, useMemo, useRef } from 'react'
import {
  GraduationCap,
  Briefcase,
  Award,
  Linkedin,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Quote,
  MapPin,
  CheckCircle2,
  X,
  Share2,
  Send,
  Video,
  ChevronRight
} from 'lucide-react'
import { resolveAssetUrl } from '../../lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import type { AlumniMember, AlumniVideoSpotlight } from '../../types/api'

interface AlumniSectionProps {
  alumni: AlumniMember[]
  video?: AlumniVideoSpotlight
}

function parseSocialLinks(raw?: string | Record<string, string>) {
  if (typeof raw === 'object' && raw !== null) return raw
  try {
    return JSON.parse((raw as string) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}


export function AlumniSection({ alumni, video }: AlumniSectionProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeModalAlumni, setActiveModalAlumni] = useState<AlumniMember | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  // Video Player state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [videoStarted, setVideoStarted] = useState(false)

  // Batch options: 'all' plus unique batches from alumni
  const batchOptions = useMemo(() => {
    const batches = Array.from(new Set(alumni.map((member) => member.batch))).filter(Boolean)
    return ['all', ...batches]
  }, [alumni])

  // Filtered alumni
  const filteredAlumni = useMemo(() => {
    return alumni.filter((member) => {
      const matchesBatch = selectedBatch === 'all' || member.batch === selectedBatch
      const query = searchQuery.toLowerCase().trim()
      if (!query) return matchesBatch

      const matchesQuery =
        member.name.toLowerCase().includes(query) ||
        member.current_role.toLowerCase().includes(query) ||
        member.company_or_institution.toLowerCase().includes(query) ||
        member.former_role.toLowerCase().includes(query) ||
        member.degree_branch.toLowerCase().includes(query) ||
        member.key_contributions.some((c) => c.toLowerCase().includes(query))

      return matchesBatch && matchesQuery
    })
  }, [alumni, selectedBatch, searchQuery])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
      setVideoStarted(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleFullScreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <section id="alumni" className="space-y-16 scroll-mt-32">
      {/* Header & Impact Summary */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#111] border border-[#222] text-[11px] font-bold uppercase tracking-widest text-neutral-400">
          <GraduationCap className="w-4 h-4 text-white" />
          Legacy & Mentorship
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black font-ginto-nord uppercase tracking-tighter text-white">
              Alumni Hall of Fame
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
              Honoring the engineers, innovators, and leaders who built the bedrock of Prasthanam Robotics Club at GBPIET. Today, they push frontiers in autonomous vehicles, embedded systems, aerospace, and AI while actively mentoring the next generation of club members.
            </p>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#111] hover:bg-white text-white hover:text-black border border-[#222] px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Alumni Connect / Submit Video
          </button>
        </div>

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-[#0A0A0A] p-4 border border-[#161616]">
            <p className="text-2xl font-black font-ginto-nord text-white">{alumni.length}</p>
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mt-1">Featured Mentors</p>
          </div>
          <div className="bg-[#0A0A0A] p-4 border border-[#161616]">
            <p className="text-2xl font-black font-ginto-nord text-white">{new Set(alumni.map((a) => a.batch)).size}</p>
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mt-1">Active Batches</p>
          </div>
          <div className="bg-[#0A0A0A] p-4 border border-[#161616]">
            <p className="text-2xl font-black font-ginto-nord text-white">100%</p>
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mt-1">Hardware Driven</p>
          </div>
          <div className="bg-[#0A0A0A] p-4 border border-[#161616]">
            <p className="text-2xl font-black font-ginto-nord text-white">15+ Trophies</p>
            <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold mt-1">Founding Legacy</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {batchOptions.map((batch) => (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                selectedBatch === batch
                  ? 'bg-white text-black border-white'
                  : 'bg-black text-neutral-400 border-[#222] hover:border-neutral-500 hover:text-white'
              }`}
            >
              {batch === 'all' ? 'All Batches' : batch}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alumni by name, role, company..."
            className="w-full bg-[#0A0A0A] border border-[#222] pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alumni Cards Grid */}
      {filteredAlumni.length === 0 ? (
        <div className="bg-[#0A0A0A] p-12 text-center border border-[#161616] space-y-3">
          <p className="text-lg font-bold text-white">No alumni matching your filter.</p>
          <p className="text-sm text-neutral-500">Try changing the batch filter or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlumni.map((member) => {
            const socials = parseSocialLinks(member.social_links)
            return (
              <div
                key={member.id}
                className="bg-[#0A0A0A] border border-[#161616] hover:border-[#333] transition-all flex flex-col justify-between group p-6 sm:p-7 relative overflow-hidden"
              >
                {/* Top Badge: Batch & Former Role */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-white text-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
                      {member.batch}
                    </span>
                    {member.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        {member.location}
                      </span>
                    )}
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="size-16 rounded-none bg-black border border-[#222] shrink-0 overflow-hidden">
                      <AvatarImage src={resolveAssetUrl(member.avatar_url)} alt={member.name} className="object-cover object-top" />
                      <AvatarFallback className="rounded-none bg-[#111] text-white font-black text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold font-ginto-nord tracking-tight text-white uppercase group-hover:text-neutral-100 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-neutral-400 mt-0.5 line-clamp-1">
                        {member.former_role}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {member.degree_branch}
                      </p>
                    </div>
                  </div>

                  {/* Current Role & Company Badge */}
                  <div className="bg-[#111] p-3.5 border border-[#1e1e1e] flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-white shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{member.current_role}</p>
                      <p className="text-[11px] font-medium text-neutral-400 truncate">{member.company_or_institution}</p>
                    </div>
                  </div>
                </div>

                {/* Footer: Social Links & Detail Trigger */}
                <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {socials.linkedin && (
                      <a
                        href={socials.linkedin as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 inline-flex items-center justify-center bg-[#111] hover:bg-[#0077B5] text-[#0A66C2] hover:text-white transition-colors border border-[#222]"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4 fill-current" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveModalAlumni(member)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ALUMNI VIDEO SPOTLIGHT SECTION (AT THE END OF ALUMNI SECTION) */}
      {/* ──────────────────────────────────────────────────────────── */}
      {video && (
        <div className="mt-20 pt-16 border-t border-[#1a1a1a] space-y-10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#111] border border-[#222] text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              <Video className="w-4 h-4 text-white" />
              Featured Alumni Address
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black font-ginto-nord uppercase tracking-tight text-white">
              Senior Alumni Video Spotlight
            </h3>
            <p className="text-neutral-400 text-base leading-relaxed">
              Watch exclusive video messages, tech talks, and words of encouragement shared directly by our senior alumni.
            </p>
          </div>

          {/* Cinematic Video Showcase Container */}
          <div className="bg-[#0A0A0A] border border-[#161616] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Video Player Box (7 cols) */}
            <div className="lg:col-span-7 relative bg-black flex items-center justify-center min-h-[320px] sm:min-h-[420px] border-b lg:border-b-0 lg:border-r border-[#161616]">
              {/* Check if the URL is an embed link (like YouTube) or direct video */}
              {video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') || video.video_url.includes('vimeo.com') ? (
                <iframe
                  src={video.video_url}
                  title={video.title}
                  className="w-full h-full min-h-[360px] sm:min-h-[440px]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center group/player">
                  <video
                    ref={videoRef}
                    src={video.video_url}
                    poster={video.thumbnail_url}
                    className="w-full h-full object-cover max-h-[500px]"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls={videoStarted}
                  />

                  {/* Play Overlay when not yet started */}
                  {!videoStarted && (
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-black/40 transition-all p-6 text-center"
                    >
                      <div className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                        <Play className="w-8 h-8 ml-1 fill-black" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black font-ginto-nord uppercase text-white tracking-wide">
                          Play Alumni Address
                        </p>
                        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                          Duration: {video.duration}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Custom quick control strip (when playing without native controls) */}
                  {videoStarted && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/80 p-1.5 border border-[#333] opacity-0 group-hover/player:opacity-100 transition-opacity">
                      <button onClick={togglePlay} className="p-1.5 text-white hover:text-neutral-300">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={toggleMute} className="p-1.5 text-white hover:text-neutral-300">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <button onClick={handleFullScreen} className="p-1.5 text-white hover:text-neutral-300">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Metadata & Highlights (5 cols) */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="bg-white text-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider">
                    {video.speaker_batch || 'Batch of 2025'}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                    ⏱ {video.duration}
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl sm:text-3xl font-black font-ginto-nord tracking-tight text-white uppercase">
                    {video.title}
                  </h4>
                  <p className="mt-2 text-sm font-bold text-neutral-300">
                    Speaker: <span className="text-white">{video.speaker_name || 'Gyanendra Yadav'}</span>
                  </p>
                  <p className="text-xs text-neutral-400 font-medium">
                    {video.speaker_role || 'Club Founder (Batch of 2025) • Robotics Engineer @ HRL'}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-neutral-300">
                  {video.description}
                </p>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-[#1a1a1a]">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#111] hover:bg-white text-white hover:text-black border border-[#222] py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Have a Video to Share? Send Us Your Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* FULL STORY MODAL / POPUP DIALOG */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeModalAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-[#222] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setActiveModalAlumni(null)}
              className="absolute top-5 right-5 p-2 bg-[#111] text-neutral-400 hover:text-white border border-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Profile Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-[#1a1a1a]">
              <Avatar className="size-24 rounded-none bg-black border border-[#222] shrink-0 overflow-hidden">
                <AvatarImage src={resolveAssetUrl(activeModalAlumni.avatar_url)} alt={activeModalAlumni.name} className="object-cover object-top" />
                <AvatarFallback className="rounded-none bg-[#111] text-white font-black text-2xl">
                  {activeModalAlumni.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="bg-white text-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
                    {activeModalAlumni.batch}
                  </span>
                  {activeModalAlumni.location && (
                    <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {activeModalAlumni.location}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-ginto-nord uppercase text-white tracking-tight">
                  {activeModalAlumni.name}
                </h3>
                <p className="text-sm font-semibold text-neutral-300">{activeModalAlumni.former_role}</p>
                <p className="text-xs text-neutral-500 font-mono">{activeModalAlumni.degree_branch}</p>
              </div>
            </div>

            {/* Current Position */}
            <div className="bg-[#111] p-4 border border-[#222] flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Current Position</p>
                <p className="text-base font-bold text-white">
                  {activeModalAlumni.current_role} <span className="text-neutral-400 font-normal">@ {activeModalAlumni.company_or_institution}</span>
                </p>
              </div>
            </div>

            {/* Quote / Advice for Juniors */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                <Quote className="w-3.5 h-3.5 text-white" />
                Advice For Juniors & Club Legacy
              </p>
              <div className="bg-black/60 p-5 border border-[#1a1a1a] text-neutral-300 text-sm leading-relaxed italic">
                "{activeModalAlumni.bio_quote}"
              </div>
            </div>

            {/* Major Achievements in Club */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-white" />
                Key Contributions at Prasthanam
              </p>
              <div className="space-y-2">
                {activeModalAlumni.key_contributions.map((contribution, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-[#111] p-3 border border-[#1a1a1a]">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-neutral-300 font-medium">{contribution}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect Section */}
            <div className="pt-4 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {parseSocialLinks(activeModalAlumni.social_links).linkedin && (
                  <a
                    href={parseSocialLinks(activeModalAlumni.social_links).linkedin as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#111] hover:bg-[#0077B5] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest border border-[#222] transition-colors"
                  >
                    <Linkedin className="w-4 h-4 fill-current" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setActiveModalAlumni(null)}
                className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ALUMNI CONNECT / VIDEO SUBMISSION MODAL */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-[#222] max-w-lg w-full p-8 relative space-y-6 shadow-2xl">
            <button
              onClick={() => {
                setShowSubmitModal(false)
                setSubmitSuccess(false)
              }}
              className="absolute top-5 right-5 p-2 bg-[#111] text-neutral-400 hover:text-white border border-[#222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-16 w-16 bg-white text-black mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black font-ginto-nord uppercase text-white tracking-tight">
                  Thank You, Alumnus!
                </h3>
                <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                  Your message/video details have been submitted. Our club team will review and integrate it into the Alumni Hall of Fame.
                </p>
                <button
                  onClick={() => {
                    setShowSubmitModal(false)
                    setSubmitSuccess(false)
                  }}
                  className="bg-white text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubmitSuccess(true)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">
                    Alumni Network
                  </span>
                  <h3 className="text-2xl font-black font-ginto-nord uppercase text-white tracking-tight">
                    Share Your Journey or Video
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Are you a Prasthanam / GBPIET robotics alumnus? Submit your latest profile, words of advice, or video link to be featured.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#111] border border-[#222] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Graduation Batch *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Batch of 2023"
                        className="w-full bg-[#111] border border-[#222] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                        Current Company / Role *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Robotics Engineer @ Tesla"
                        className="w-full bg-[#111] border border-[#222] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Video Link / Drive / YouTube (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://youtu.be/... or Google Drive link"
                      className="w-full bg-[#111] border border-[#222] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      Message / Advice for Juniors
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share a memory or piece of guidance..."
                      className="w-full bg-[#111] border border-[#222] px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
