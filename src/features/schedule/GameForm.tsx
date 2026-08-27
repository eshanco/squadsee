import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import type { Game } from '../../types/game'
import type { GameFormInput } from '../../hooks/useGames'

export function GameForm({
  initial,
  onSave,
  onClose,
  onDelete,
  onAttendance,
}: {
  initial?: Game
  onSave: (data: GameFormInput) => Promise<void>
  onClose: () => void
  onDelete?: () => Promise<void>
  onAttendance?: () => void
}) {
  const [opponent, setOpponent] = useState(initial?.opponent ?? '')
  const [date, setDate] = useState(initial ? toLocalInputValue(initial.date.toDate()) : '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({
        type: 'game',
        opponent: opponent.trim() || undefined,
        date: new Date(date),
        location: location.trim(),
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={initial ? 'Edit game' : 'Add game'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Opponent
          <input
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Date &amp; time *
          <input
            required
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Location *
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex gap-2">
            {onDelete && (
              <Button variant="danger" type="button" onClick={onDelete}>
                Delete
              </Button>
            )}
            {onAttendance && (
              <Button variant="secondary" type="button" onClick={onAttendance}>
                Attendance
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none'
