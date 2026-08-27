import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { GAME_FORMATS, type Game, type GameFormat } from '../../types/game'
import type { GameFormInput } from '../../hooks/useGames'

export function GameForm({
  initial,
  defaultFormat,
  onSave,
  onClose,
  onDelete,
  onAttendance,
  onLineup,
}: {
  initial?: Game
  defaultFormat?: GameFormat
  onSave: (data: GameFormInput) => Promise<void>
  onClose: () => void
  onDelete?: () => Promise<void>
  onAttendance?: () => void
  onLineup?: () => void
}) {
  const [opponent, setOpponent] = useState(initial?.opponent ?? '')
  const [date, setDate] = useState(initial ? toLocalInputValue(initial.date.toDate()) : '')
  const [format, setFormat] = useState<GameFormat | ''>(initial?.format ?? defaultFormat ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!format) {
      setError('Pick a format.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        type: 'game',
        opponent: opponent.trim() || undefined,
        format: format || undefined,
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
        <div>
          <p className="block text-sm font-medium text-gray-700">Format *</p>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {GAME_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                  format === f
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
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
            {onLineup && (
              <Button variant="secondary" type="button" onClick={onLineup}>
                Lineup
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
