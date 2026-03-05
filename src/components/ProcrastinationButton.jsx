import { useState, useEffect } from 'react'

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
    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)])
    setTotalWasted((w) => w + BASE_MINUTES)
    setCurrentStreak((s) => s + 1)
  }

  const hours = Math.floor(totalWasted / 60)
  const mins = totalWasted % 60
  const wastedDisplay = hours > 0 ? `${hours}h ${mins}m` : `${totalWasted}m`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-slate-300 mb-2">Procrastination Button</h1>
      <p className="text-slate-500 text-sm mb-8">Click. Regret. Repeat.</p>

      <button
        type="button"
        onClick={handleClick}
        className="w-72 h-72 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 transition-all duration-150 shadow-2xl shadow-red-900/50 border-4 border-red-400/30 text-white font-bold text-xl px-4 py-2 select-none cursor-pointer"
      >
        I'll start in {minutes} minutes
      </button>

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
    </div>
  )
}
