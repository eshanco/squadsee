import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import type { AttendanceStatus, Game } from '../../types/game'
import type { Player } from '../../types/player'

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused']

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
}

const STATUS_ACTIVE_CLASSES: Record<AttendanceStatus, string> = {
  present: 'bg-green-700 text-white',
  absent: 'bg-red-600 text-white',
  late: 'bg-yellow-500 text-white',
  excused: 'bg-blue-600 text-white',
}

export function AttendanceModal({
  game,
  players,
  title,
  onClose,
  onSave,
}: {
  game: Game
  players: Player[]
  title: string
  onClose: () => void
  onSave: (attendance: Record<string, AttendanceStatus>) => Promise<void>
}) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(game.attendance)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave(attendance)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-2">
        {players.length === 0 && (
          <p className="text-sm text-gray-500">No active players on the roster yet.</p>
        )}
        {players.map((player) => (
          <div key={player.id} className="rounded-lg border border-gray-200 p-2">
            <p className="mb-2 text-sm font-medium text-gray-900">
              {player.firstName} {player.lastName}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setAttendance((prev) => ({ ...prev, [player.id]: status }))}
                  className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                    attendance[player.id] === status
                      ? STATUS_ACTIVE_CLASSES[status]
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Modal>
  )
}
