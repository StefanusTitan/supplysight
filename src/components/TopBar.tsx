import type { Range } from '../types'
import { RANGES } from '../constants'

interface TopBarProps {
  range: Range
  setRange: (r: Range) => void
}

export default function TopBar({ range, setRange }: TopBarProps) {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm rounded-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-semibold">SupplySight</div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded cursor-pointer transition-colors duration-150 focus:outline-none ${range === '7d' ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-300 border border-transparent hover:bg-white/5 hover:text-white active:bg-white/10 active:scale-95'}`}
            onClick={() => setRange('7d')}
            aria-label={`Set range to ${RANGES['7d']}`}
          >
            {RANGES['7d']}
          </button>

          <button
            className={`px-3 py-1 rounded cursor-pointer transition-colors duration-150 focus:outline-none ${range === '14d' ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-300 border border-transparent hover:bg-white/5 hover:text-white active:bg-white/10 active:scale-95'}`}
            onClick={() => setRange('14d')}
            aria-label={`Set range to ${RANGES['14d']}`}
          >
            {RANGES['14d']}
          </button>

          <button
            className={`px-3 py-1 rounded cursor-pointer transition-colors duration-150 focus:outline-none ${range === '30d' ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-300 border border-transparent hover:bg-white/5 hover:text-white active:bg-white/10 active:scale-95'}`}
            onClick={() => setRange('30d')}
            aria-label={`Set range to ${RANGES['30d']}`}
          >
            {RANGES['30d']}
          </button>
        </div>
      </div>
    </header>
  )
}
