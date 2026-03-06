import { useState, useEffect, useRef, useMemo } from 'react'

const BASE_MINUTES = 5
const MESSAGES = [
  "Great. NASA delayed launch because of you.",
  "Your future self is crying.",
  "The deadline just moved. Again.",
  "5 more minutes. We both know that's a lie.",
  "Task successfully postponed.",
  "Your to-do list is judging you.",
  "The guilt is free. The productivity is not.",
  "Congratulations. You've invented a new form of procrastination.",
  "Your cat is more productive right now.",
  "The void appreciates your contribution.",
  "Einstein didn't procrastinate. Well, he did. You're in good company.",
  "This button has more commitment than my ex.",
  "Your productivity: 📉 Your excuses: 📈",
]

const MILESTONE_MESSAGES = {
  5: "5 clicks. Your ancestors felt a chill.",
  10: "Double digits. Your future self is filing for divorce.",
  25: "25 clicks. You could've learned a new language. You chose this.",
  50: "50. Half a century of regret. In clicks.",
  100: "100 CLICKS. We need to talk. (Just kidding, keep going.)",
}

const ACHIEVEMENTS = [
  { id: 'first', label: 'First step (backwards)', minClicks: 1 },
  { id: 'five', label: 'Warm-up procrastinator', minClicks: 5 },
  { id: 'ten', label: 'Dedicated avoider', minClicks: 10 },
  { id: 'thirty', label: '30 min club', minWasted: 30 },
  { id: 'hour', label: 'Hour of power (wasted)', minWasted: 60 },
  { id: 'twentyfive', label: 'Quarter century of shame', minClicks: 25 },
  { id: 'fifty', label: 'Fifty clicks, zero tasks', minClicks: 50 },
  { id: 'century', label: 'Century of regret', minClicks: 100 },
]

const TIPS = [
  "Tip: Have you tried closing this tab? (Just kidding, we know you won't.)",
  "Tip: Setting a timer helps. So does ignoring it.",
  "Tip: The best time to start was 20 minutes ago. The second best is never.",
  "Tip: Break tasks into smaller steps. Then procrastinate on each step.",
  "Tip: Research shows procrastinators are creative. You're basically Picasso.",
]

const RANKS = [
  { minWasted: 0, title: 'Innocent bystander', emoji: '😇' },
  { minWasted: 15, title: 'Casual delayer', emoji: '😏' },
  { minWasted: 30, title: 'Part-time avoider', emoji: '🙃' },
  { minWasted: 60, title: 'Dedicated procrastinator', emoji: '😎' },
  { minWasted: 120, title: 'Expert time-waster', emoji: '🔥' },
  { minWasted: 300, title: 'Legend of the void', emoji: '👑' },
  { minWasted: 600, title: 'Transcendent procrastinator', emoji: '🌀' },
]

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
const CONFETTI_COUNT = 40
const RUN_BUTTON_AFTER_CLICKS = 15

const STORAGE_KEYS = {
  totalWasted: 'procrastination_total_wasted_minutes',
  lifetimeStreak: 'procrastination_lifetime_streak',
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v != null ? Number(v) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch (_) {}
}

export default function ProcrastinationButton() {
  const [minutes, setMinutes] = useState(BASE_MINUTES)
  const [message, setMessage] = useState(null)
  const [totalWasted, setTotalWasted] = useState(() => load(STORAGE_KEYS.totalWasted, 0))
  const [lifetimeStreak, setLifetimeStreak] = useState(() => load(STORAGE_KEYS.lifetimeStreak, 0))
  const [currentStreak, setCurrentStreak] = useState(0)
  const [shake, setShake] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [countdown, setCountdown] = useState(null) // 3 | 2 | 1 | 'psych'
  const tipIndex = useRef(0)
  const confettiKey = useRef(0)
  const confettiParticles = useRef([])

  const totalClicks = totalWasted / BASE_MINUTES
  const currentRank = useMemo(() => {
    let r = RANKS[0]
    for (const rank of RANKS) {
      if (totalWasted >= rank.minWasted) r = rank
    }
    return r
  }, [totalWasted])
  const buttonRunsAway = totalClicks >= RUN_BUTTON_AFTER_CLICKS
  const unlocked = useMemo(() => {
    const set = new Set()
    for (const a of ACHIEVEMENTS) {
      const byClicks = a.minClicks != null && totalClicks >= a.minClicks
      const byWasted = a.minWasted != null && totalWasted >= a.minWasted
      if (byClicks || byWasted) set.add(a.id)
    }
    return set
  }, [totalWasted])

  useEffect(() => {
    save(STORAGE_KEYS.totalWasted, totalWasted)
  }, [totalWasted])

  useEffect(() => {
    if (currentStreak > lifetimeStreak) {
      const next = currentStreak
      setLifetimeStreak(next)
      save(STORAGE_KEYS.lifetimeStreak, next)
    }
  }, [currentStreak, lifetimeStreak])

  function handleClick() {
    setMinutes((m) => m + BASE_MINUTES)
    const nextStreak = currentStreak + 1
    const milestoneMsg = MILESTONE_MESSAGES[nextStreak]
    setMessage(milestoneMsg || MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
    setTotalWasted((w) => w + BASE_MINUTES)
    setCurrentStreak((s) => s + 1)
    setShake(true)
    setTimeout(() => setShake(false), 500)
    if (milestoneMsg) {
      confettiKey.current += 1
      confettiParticles.current = Array.from({ length: CONFETTI_COUNT }, () => ({
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
      }))
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2600)
    }
  }

  function handleActuallyStart() {
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown === null) return
    const delay = countdown === 'psych' ? 1500 : 1000
    const next = countdown === 3 ? 2 : countdown === 2 ? 1 : countdown === 1 ? 'psych' : null
    const t = setTimeout(() => setCountdown(next), delay)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleShare() {
    const hours = Math.floor(totalWasted / 60)
    const mins = totalWasted % 60
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${totalWasted}m`
    const text = `I've wasted ${timeStr} on the Procrastination Button. ${currentRank.emoji} Rank: ${currentRank.title}. No regrets. (Okay, some regrets.)`
    try {
      await navigator.clipboard.writeText(text)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch (_) {}
  }

  const [tip, setTip] = useState(TIPS[0])
  useEffect(() => {
    const id = setInterval(() => {
      tipIndex.current = (tipIndex.current + 1) % TIPS.length
      setTip(TIPS[tipIndex.current])
    }, 6000)
    return () => clearInterval(id)
  }, [])

  const hours = Math.floor(totalWasted / 60)
  const mins = totalWasted % 60
  const wastedDisplay = hours > 0 ? `${hours}h ${mins}m` : `${totalWasted}m`

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 text-center ${shake ? 'animate-shake' : ''}`}>
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={() => setShowAchievements((s) => !s)}
          className="text-slate-500 hover:text-amber-400 text-sm transition-colors"
        >
          🏆 {unlocked.size}/{ACHIEVEMENTS.length} achievements
        </button>
      </div>

      <h1 className="text-2xl font-bold text-slate-300 mb-2">Procrastination Button</h1>
      <p className="text-slate-500 text-sm mb-1">Click. Regret. Repeat.</p>
      <p className="text-slate-500 text-sm mb-6">
        <span className="text-amber-400/90">{currentRank.emoji}</span> {currentRank.title}
      </p>

      {showConfetti && confettiParticles.current.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
          {confettiParticles.current.map((p, i) => (
            <div
              key={`${confettiKey.current}-${i}`}
              className="absolute w-2 h-2 rounded-sm animate-confetti"
              style={{
                left: `${p.left}%`,
                bottom: '-10px',
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        className={`w-72 h-72 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-150 shadow-2xl shadow-red-900/50 border-4 border-red-400/30 text-white font-bold text-xl px-4 py-2 select-none cursor-pointer hover:scale-105 ${buttonRunsAway ? 'animate-float' : ''}`}
      >
        I'll start in {minutes} minutes
      </button>
      {buttonRunsAway && (
        <p className="mt-2 text-slate-500 text-xs">Even the button is trying to get away.</p>
      )}

      <button
        type="button"
        onClick={handleActuallyStart}
        disabled={countdown !== null}
        className="mt-4 px-5 py-2 rounded-full bg-emerald-700/60 hover:bg-emerald-600/80 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-200 text-sm font-medium border border-emerald-500/40 transition-colors"
      >
        I'll do it now
      </button>

      {countdown !== null && (
        <div className="fixed inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-30">
          <p className="text-8xl font-black text-slate-100 tabular-nums animate-pulse">
            {countdown === 'psych' ? '😏' : countdown}
          </p>
          <p className="mt-4 text-xl text-amber-300 font-medium">
            {countdown === 'psych' ? "Just kidding. Have another 5 minutes." : 'Starting in...'}
          </p>
        </div>
      )}

      {message && (
        <p className="mt-8 max-w-md text-lg text-amber-200 font-medium animate-pulse">
          {message}
        </p>
      )}

      <div className="mt-12 flex gap-8 text-slate-400 text-sm">
        <div>
          <span className="block text-slate-500 text-xs uppercase tracking-wider">Total wasted time</span>
          <span className="text-2xl font-mono text-slate-300">{wastedDisplay}</span>
        </div>
        <div>
          <span className="block text-slate-500 text-xs uppercase tracking-wider">Lifetime procrastination streak</span>
          <span className="text-2xl font-mono text-slate-300">{lifetimeStreak}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="mt-6 px-4 py-2 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-slate-300 text-sm transition-colors border border-slate-600"
      >
        {shareCopied ? '✓ Copied to clipboard!' : '📤 Share my shame'}
      </button>

      {showAchievements && (
        <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center p-6 z-10">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-600">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Achievements</h2>
            <ul className="space-y-2 text-left">
              {ACHIEVEMENTS.map((a) => (
                <li
                  key={a.id}
                  className={`flex items-center gap-2 text-sm ${unlocked.has(a.id) ? 'text-amber-300' : 'text-slate-500'}`}
                >
                  <span>{unlocked.has(a.id) ? '✅' : '🔒'}</span>
                  {a.label}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowAchievements(false)}
              className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <p className="absolute bottom-6 left-4 right-4 text-slate-500 text-xs max-w-md mx-auto transition-opacity duration-500">
        {tip}
      </p>
    </div>
  )
}
