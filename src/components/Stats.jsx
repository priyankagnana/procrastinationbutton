import { useState, useEffect } from 'react'

const STORAGE_KEYS = {
  totalWasted: 'procrastination_total_wasted_minutes',
  focusSessions: 'funapp_focus_sessions_completed',
  totalFocusMinutes: 'funapp_total_focus_minutes',
}

function load(key, fallback = 0) {
  try {
    const v = localStorage.getItem(key)
    return v != null ? Number(v) : fallback
  } catch {
    return fallback
  }
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const REDEMPTION_MESSAGES = [
  { minRatio: 0, maxRatio: 0.1, msg: "The button still has hope. So do we. (Barely.)", emoji: "🌱" },
  { minRatio: 0.1, maxRatio: 0.3, msg: "You've focused sometimes. The void is confused.", emoji: "🤔" },
  { minRatio: 0.3, maxRatio: 0.6, msg: "Almost balanced. Almost.", emoji: "⚖️" },
  { minRatio: 0.6, maxRatio: 1, msg: "More focus than procrastination? Who are you?", emoji: "✨" },
  { minRatio: 1, maxRatio: Infinity, msg: "You're in the wrong app. (Just kidding. Well done.)", emoji: "🏆" },
]

export default function Stats({ onBack }) {
  const [totalWasted, setTotalWasted] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [totalFocus, setTotalFocus] = useState(0)

  useEffect(() => {
    const sync = () => {
      setTotalWasted(load(STORAGE_KEYS.totalWasted))
      setSessions(load(STORAGE_KEYS.focusSessions))
      setTotalFocus(load(STORAGE_KEYS.totalFocusMinutes))
    }
    sync()
    const id = setInterval(sync, 2000)
    return () => clearInterval(id)
  }, [])

  const ratio = totalWasted > 0 ? totalFocus / totalWasted : (totalFocus > 0 ? 1 : 0)
  const redemption = REDEMPTION_MESSAGES.find((r) => ratio >= r.minRatio && ratio < r.maxRatio) || REDEMPTION_MESSAGES[0]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-500 hover:text-amber-400 text-sm transition-colors flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-slate-300 mb-1">Your stats</h1>
      <p className="text-slate-500 text-sm mb-8">The numbers don't lie. (Usually.)</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-8">
        <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Time procrastinated</p>
          <p className="text-2xl font-mono font-bold text-red-400">{formatDuration(totalWasted)}</p>
          <p className="text-slate-500 text-xs mt-1">Click. Regret. Repeat.</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Focus sessions</p>
          <p className="text-2xl font-mono font-bold text-amber-400">{sessions}</p>
          <p className="text-slate-500 text-xs mt-1">Rounds you actually finished.</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Time focused</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{formatDuration(totalFocus)}</p>
          <p className="text-slate-500 text-xs mt-1">Minutes you showed up.</p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-6 max-w-md w-full">
        <p className="text-4xl mb-2">{redemption.emoji}</p>
        <p className="text-slate-300 font-medium">{redemption.msg}</p>
        <p className="text-slate-500 text-xs mt-2">
          Focus vs procrastination ratio: <span className="text-amber-400 font-mono">{(ratio * 100).toFixed(0)}%</span>
        </p>
      </div>
    </div>
  )
}
