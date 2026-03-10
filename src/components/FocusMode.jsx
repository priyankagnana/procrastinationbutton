import { useState, useEffect, useRef } from 'react'

const DURATIONS = [
  { label: '1 min', minutes: 1 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
]

const COMPLETE_MESSAGES = [
  "You did it. We're shocked too.",
  "One small step for you, one giant 'I told you so' for productivity.",
  "The procrastination button is crying. Good.",
  "Look at you, actually doing things.",
  "Your future self is high-fiving your past self. Weird, but valid.",
]

const STORAGE_FOCUS_SESSIONS = 'funapp_focus_sessions_completed'

function loadFocusSessions() {
  try {
    const v = localStorage.getItem(STORAGE_FOCUS_SESSIONS)
    return v != null ? Number(v) : 0
  } catch {
    return 0
  }
}

function saveFocusSessions(n) {
  try {
    localStorage.setItem(STORAGE_FOCUS_SESSIONS, String(n))
  } catch (_) {}
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function FocusMode({ onBack }) {
  const [durationMinutes, setDurationMinutes] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(loadFocusSessions)
  const intervalRef = useRef(null)

  const totalSeconds = durationMinutes * 60
  const progress = secondsLeft != null ? 1 - secondsLeft / totalSeconds : 0

  useEffect(() => {
    if (!isRunning || secondsLeft == null) return
    if (secondsLeft <= 0) {
      setIsRunning(false)
      setCompleted(true)
      const next = sessionsCompleted + 1
      setSessionsCompleted(next)
      saveFocusSessions(next)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, secondsLeft, totalSeconds, sessionsCompleted])

  function start() {
    setSecondsLeft(durationMinutes * 60)
    setIsRunning(true)
    setCompleted(false)
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    setIsRunning(false)
    setSecondsLeft(null)
    setCompleted(false)
  }

  const canChangeDuration = !isRunning && secondsLeft == null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-4 left-4 text-slate-500 hover:text-amber-400 text-sm transition-colors flex items-center gap-1"
      >
        ← Back to procrastinating
      </button>

      <h1 className="text-2xl font-bold text-slate-300 mb-1">Focus Mode</h1>
      <p className="text-slate-500 text-sm mb-8">
        Pick a duration. Start. Actually work. (We believe in you. Sort of.)
      </p>

      {!completed ? (
        <>
          <div className="flex gap-2 mb-6">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                type="button"
                onClick={() => canChangeDuration && setDurationMinutes(d.minutes)}
                disabled={!canChangeDuration}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  durationMinutes === d.minutes
                    ? 'bg-amber-500/80 text-slate-900'
                    : canChangeDuration
                    ? 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-amber-500 transition-all duration-1000"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
              />
            </svg>
            <div className="relative z-10 text-5xl font-mono font-bold tabular-nums text-slate-200">
              {secondsLeft != null ? formatTime(secondsLeft) : formatTime(totalSeconds)}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            {secondsLeft == null ? (
              <button
                type="button"
                onClick={start}
                className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
              >
                Start focus
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={isRunning ? pause : () => setIsRunning(true)}
                  className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium transition-colors"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors border border-slate-600"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="animate-pulse">
          <p className="text-6xl mb-4">🎉</p>
          <p className="text-xl font-semibold text-amber-300 mb-2">
            {COMPLETE_MESSAGES[Math.floor(Math.random() * COMPLETE_MESSAGES.length)]}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            You focused for {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''}. That counts.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            Focus sessions completed: <span className="text-amber-400 font-mono">{sessionsCompleted}</span>
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setCompleted(false); start(); }}
              className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              Another round
            </button>
            <button
              type="button"
              onClick={() => { reset(); onBack?.(); }}
              className="px-6 py-3 rounded-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium transition-colors"
            >
              Back to the button
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
