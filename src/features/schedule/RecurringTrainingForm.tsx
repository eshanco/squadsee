import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { WEEKDAYS, type RecurringTraining, type RecurringTrainingInput } from '../../types/training'

export function RecurringTrainingForm({
  initial,
  onSave,
  onClose,
  onToggleActive,
}: {
  initial?: RecurringTraining
  onSave: (data: RecurringTrainingInput) => Promise<void>
  onClose: () => void
  onToggleActive?: () => Promise<void>
}) {
  const [dayOfWeek, setDayOfWeek] = useState<number>(initial?.dayOfWeek ?? 2)
  const [startTime, setStartTime] = useState(initial?.startTime ?? '18:00')
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.durationMinutes?.toString() ?? '60',
  )
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
        dayOfWeek: dayOfWeek as RecurringTraining['dayOfWeek'],
        startTime,
        durationMinutes: Number(durationMinutes),
        location: location.trim(),
        notes: notes.trim() || undefined,
        active: initial?.active ?? true,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save training.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={initial ? 'Edit recurring training' : 'Add recurring training'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <label className="block flex-1 text-sm font-medium text-gray-700">
            Day
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className={inputClass}
            >
              {WEEKDAYS.map((day, i) => (
                <option key={day} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className="block flex-1 text-sm font-medium text-gray-700">
            Start time *
            <input
              required
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Duration (minutes) *
          <input
            required
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
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
          {onToggleActive ? (
            <Button variant="danger" type="button" onClick={onToggleActive}>
              {initial?.active ? 'Deactivate' : 'Reactivate'}
            </Button>
          ) : (
            <span />
          )}
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

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none'
