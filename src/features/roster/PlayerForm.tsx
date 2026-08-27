import { useState, type FormEvent, type ReactNode } from 'react'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { POSITIONS, type Player, type PlayerInput, type Position } from '../../types/player'

export function PlayerForm({
  initial,
  onSave,
  onClose,
  onToggleActive,
}: {
  initial?: Player
  onSave: (data: PlayerInput) => Promise<void>
  onClose: () => void
  onToggleActive?: () => Promise<void>
}) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? '')
  const [lastName, setLastName] = useState(initial?.lastName ?? '')
  const [jerseyNumber, setJerseyNumber] = useState(initial?.jerseyNumber?.toString() ?? '')
  const [primaryPosition, setPrimaryPosition] = useState<Position>(
    initial?.primaryPosition ?? 'MID',
  )
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [parentName, setParentName] = useState(initial?.parentName ?? '')
  const [parentPhone, setParentPhone] = useState(initial?.parentPhone ?? '')
  const [parentEmail, setParentEmail] = useState(initial?.parentEmail ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jerseyNumber: Number(jerseyNumber),
        primaryPosition,
        phone: phone.trim() || undefined,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        parentEmail: parentEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        active: initial?.active ?? true,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save player.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={initial ? 'Edit player' : 'Add player'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <Field label="First name" required>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Last name" required>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex gap-3">
          <Field label="Jersey #" required>
            <input
              required
              type="number"
              min={0}
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Position" required>
            <select
              value={primaryPosition}
              onChange={(e) => setPrimaryPosition(e.target.value as Position)}
              className={inputClass}
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Player phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Parent/guardian name">
          <input
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="flex gap-3">
          <Field label="Parent phone">
            <input
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Parent email">
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </Field>
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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block flex-1 text-sm font-medium text-gray-700">
      {label}
      {required ? ' *' : ''}
      {children}
    </label>
  )
}
