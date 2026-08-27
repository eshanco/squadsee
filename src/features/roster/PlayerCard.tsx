import type { AttendanceStats } from '../../lib/attendance'
import type { Player } from '../../types/player'

export function PlayerCard({
  player,
  stats,
  onClick,
}: {
  player: Player
  stats: AttendanceStats
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-green-300"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
        {player.jerseyNumber}
      </span>
      <span className="flex-1">
        <span className="block font-medium text-gray-900">
          {player.firstName} {player.lastName}
        </span>
        <span className="block text-xs text-gray-500">{player.primaryPosition}</span>
      </span>
      <span className="shrink-0 text-right text-xs text-gray-500">
        <span className="block font-medium text-gray-700">
          {stats.percentage !== null ? `${stats.percentage}% trained` : 'No data'}
        </span>
        {stats.recorded > 0 && <span className="block">{stats.missed} missed</span>}
      </span>
    </button>
  )
}
