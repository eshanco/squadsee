import type { Player } from '../../types/player'
import { computePlayingTime } from '../../lib/playingTime'

export function PlayingTimeSummary({
  periods,
  players,
}: {
  periods: { durationMinutes: number; assignments: Record<string, string | null> }[]
  players: Player[]
}) {
  const minutes = computePlayingTime(periods)
  const totalMinutes = periods.reduce((sum, p) => sum + p.durationMinutes, 0)
  const sorted = [...players].sort((a, b) => (minutes[b.id] ?? 0) - (minutes[a.id] ?? 0))

  return (
    <div>
      <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        Playing time · {totalMinutes} min planned
      </p>
      <div className="space-y-1">
        {sorted.map((player) => {
          const played = minutes[player.id] ?? 0
          const pct = totalMinutes > 0 ? Math.round((played / totalMinutes) * 100) : 0
          return (
            <div key={player.id} className="flex items-center gap-2 text-sm">
              <span className="w-28 shrink-0 truncate text-gray-700">
                {player.firstName} {player.lastName}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-14 shrink-0 text-right text-xs text-gray-500">{played} min</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
