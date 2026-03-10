import { useState } from 'react'
import ProcrastinationButton from './components/ProcrastinationButton'
import FocusMode from './components/FocusMode'
import Stats from './components/Stats'

export default function App() {
  const [page, setPage] = useState('button') // 'button' | 'focus' | 'stats'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center gap-1 p-3 bg-slate-900/80 backdrop-blur border-b border-slate-700/50">
        <button
          type="button"
          onClick={() => setPage('button')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === 'button' ? 'bg-amber-500/80 text-slate-900' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/80'}`}
        >
          Procrastination Button
        </button>
        <button
          type="button"
          onClick={() => setPage('focus')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === 'focus' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'}`}
        >
          Focus Mode
        </button>
        <button
          type="button"
          onClick={() => setPage('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === 'stats' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/80'}`}
        >
          Stats
        </button>
      </nav>
      <div className="pt-14">
        {page === 'button' && <ProcrastinationButton onNavigateToFocus={() => setPage('focus')} />}
        {page === 'focus' && <FocusMode onBack={() => setPage('button')} />}
        {page === 'stats' && <Stats onBack={() => setPage('button')} />}
      </div>
    </>
  )
}
