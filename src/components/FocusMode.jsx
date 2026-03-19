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
const STORAGE_TOTAL_FOCUS_MINUTES = 'funapp_total_focus_minutes'

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

function loadTotalFocusMinutes() {
  try {
    const v = localStorage.getItem(STORAGE_TOTAL_FOCUS_MINUTES)
    return v != null ? Number(v) : 0
  } catch {
    return 0
  }
}

function saveTotalFocusMinutes(n) {
  try {
    localStorage.setItem(STORAGE_TOTAL_FOCUS_MINUTES, String(n))
  } catch (_) {}
}

const STORAGE_FOCUS_COMPLETE_SOUND_MUTED = 'funapp_focus_complete_sound_muted'

function loadCompleteSoundMuted() {
  try {
    const v = localStorage.getItem(STORAGE_FOCUS_COMPLETE_SOUND_MUTED)
    return v === 'true'
  } catch {
    return false
  }
}

function saveCompleteSoundMuted(muted) {
  try {
    localStorage.setItem(STORAGE_FOCUS_COMPLETE_SOUND_MUTED, String(muted))
  } catch (_) {}
}

function playFocusCompleteSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(523.25, ctx.currentTime)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.35)
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.connect(g2)
    g2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12)
    g2.gain.setValueAtTime(0, ctx.currentTime + 0.12)
    g2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.14)
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
    osc2.start(ctx.currentTime + 0.12)
    osc2.stop(ctx.currentTime + 0.45)
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
  const [taskLabel, setTaskLabel] = useState('')
  const [completeSoundMuted, setCompleteSoundMuted] = useState(loadCompleteSoundMuted)
  const [customMinutesDraft, setCustomMinutesDraft] = useState('')
  const intervalRef = useRef(null)
  const playedCompleteSoundRef = useRef(false)

  const totalSeconds = durationMinutes * 60
  const progress = secondsLeft != null ? 1 - secondsLeft / totalSeconds : 0

  useEffect(() => {
    if (!isRunning || secondsLeft == null) return
    if (secondsLeft <= 0) {
      setIsRunning(false)
      setCompleted(true)
      if (!playedCompleteSoundRef.current && !completeSoundMuted) {
        playedCompleteSoundRef.current = true
        playFocusCompleteSound()
      }
      const next = sessionsCompleted + 1
      setSessionsCompleted(next)
      saveFocusSessions(next)
      const totalFocus = loadTotalFocusMinutes() + durationMinutes
      saveTotalFocusMinutes(totalFocus)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, secondsLeft, totalSeconds, sessionsCompleted])

  function start() {
    playedCompleteSoundRef.current = false
    setSecondsLeft(durationMinutes * 60)
    setIsRunning(true)
    setCompleted(false)
  }

  function pause() {
    setIsRunning(false)
  }

  function reset() {
    playedCompleteSoundRef.current = false
    setIsRunning(false)
    setSecondsLeft(null)
    setCompleted(false)
  }

  function toggleCompleteSound() {
    setCompleteSoundMuted((m) => {
      const next = !m
      saveCompleteSoundMuted(next)
      return next
    })
  }

  function applyCustomMinutes() {
    const n = Math.round(Number(customMinutesDraft))
    if (Number.isNaN(n)) return
    const clamped = Math.min(120, Math.max(2, n))
    setDurationMinutes(clamped)
    setCustomMinutesDraft(String(clamped))
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
      <button
        type="button"
        onClick={toggleCompleteSound}
        className={`absolute top-4 right-4 text-sm transition-all px-2 py-1 rounded ${completeSoundMuted ? 'text-slate-600' : 'text-slate-400 hover:text-amber-400'}`}
        title={completeSoundMuted ? 'Unmute completion chime' : 'Mute completion chime'}
      >
        {completeSoundMuted ? '🔕' : '🔔'}
      </button>

      <h1 className="text-2xl font-bold text-slate-300 mb-1">Focus Mode</h1>
      <p className="text-slate-500 text-sm mb-8">
        Pick a duration. Start. Actually work. (We believe in you. Sort of.)
      </p>

      {!completed ? (
        <>
          <div className="w-full max-w-xs mb-4">
            <label className="block text-slate-500 text-xs mb-1 text-left">What are you focusing on? (optional)</label>
            <input
              type="text"
              value={taskLabel}
              onChange={(e) => setTaskLabel(e.target.value)}
              placeholder="e.g. Finish the report"
              disabled={!canChangeDuration}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                type="button"
                onClick={() => {
                  if (!canChangeDuration) return
                  setDurationMinutes(d.minutes)
                  setCustomMinutesDraft('')
                }}
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
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-xs mx-auto">
            <label htmlFor="focus-custom-min" className="text-slate-500 text-xs shrink-0">
              Or custom (2–120 min)
            </label>
            <input
              id="focus-custom-min"
              type="number"
              min={2}
              max={120}
              value={customMinutesDraft}
              onChange={(e) => setCustomMinutesDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomMinutes()}
              disabled={!canChangeDuration}
              placeholder={String(durationMinutes)}
              className="w-16 px-2 py-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={applyCustomMinutes}
              disabled={!canChangeDuration}
              className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Set
            </button>
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
            <div className="relative z-10 text-center">
              <span className="block text-5xl font-mono font-bold tabular-nums text-slate-200">
                {secondsLeft != null ? formatTime(secondsLeft) : formatTime(totalSeconds)}
              </span>
              {taskLabel.trim() && (
                <p className="mt-2 text-sm text-slate-400 max-w-[200px] truncate" title={taskLabel}>
                  {taskLabel}
                </p>
              )}
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
