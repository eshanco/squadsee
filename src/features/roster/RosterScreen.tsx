import { useState } from 'react'
import { usePlayers, addPlayer, updatePlayer } from '../../hooks/usePlayers'
import { PlayerCard } from './PlayerCard'
import { PlayerForm } from './PlayerForm'
import { Button } from '../../components/Button'
import { Spinner } from '../../components/Spinner'
import type { Player } from '../../types/player'

export function RosterScreen() {
  const { players, loading } = usePlayers()
  const [editing, setEditing] = useState<Player | 'new' | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const visible = players.filter((p) => (showInactive ? true : p.active))

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Roster</h1>
        <Button onClick={() => setEditing('new')}>Add player</Button>
      </div>

      {loading && <Spinner />}

      {!loading && visible.length === 0 && (
        <p className="text-sm text-gray-500">No players yet. Add your first player above.</p>
      )}

      <div className="space-y-2">
        {visible.map((player) => (
          <PlayerCard key={player.id} player={player} onClick={() => setEditing(player)} />
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
        />
        Show inactive players
      </label>

      {editing && (
        <PlayerForm
          initial={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            if (editing === 'new') {
              await addPlayer(data)
            } else {
              await updatePlayer(editing.id, data)
            }
          }}
          onToggleActive={
            editing === 'new'
              ? undefined
              : async () => {
                  await updatePlayer(editing.id, { active: !editing.active })
                  setEditing(null)
                }
          }
        />
      )}
    </div>
  )
}
