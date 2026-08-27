import { useState } from 'react'
import { useGames, updateGame } from '../../hooks/useGames'
import { usePlayers } from '../../hooks/usePlayers'
import { usePeriods, addPeriod, updatePeriod, deletePeriod } from '../../hooks/usePeriods'
import { getFormationsForFormat, getFormation } from '../../lib/formations'
import { resolveEffectivePeriods } from '../../lib/periodInheritance'
import { Pitch } from './Pitch'
import { PlayingTimeSummary } from './PlayingTimeSummary'
import { Button } from '../../components/Button'
import { Spinner } from '../../components/Spinner'
import { GAME_FORMATS, type Game, type GameFormat } from '../../types/game'
import type { Player } from '../../types/player'

const DEFAULT_PERIOD_MINUTES = 15

export function LineupScreen({
  gameId,
  onSelectGame,
}: {
  gameId: string | null
  onSelectGame: (id: string) => void
}) {
  const { games, loading: gamesLoading } = useGames()
  const { players, loading: playersLoading } = usePlayers()

  if (gamesLoading || playersLoading) return <Spinner />

  const game = games.find((g) => g.id === gameId && g.type === 'game')

  if (!game) return <GamePicker games={games} onSelect={onSelectGame} />

  if (!game.format) return <FormatPrompt game={game} />

  return <LineupBuilder game={game} format={game.format} players={players.filter((p) => p.active)} />
}

function GamePicker({ games, onSelect }: { games: Game[]; onSelect: (id: string) => void }) {
  const now = Date.now()
  const upcoming = games
    .filter((g) => g.type === 'game' && g.date.toMillis() >= now)
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-semibold text-gray-900">Lineup</h1>
      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-500">
          No upcoming games. Add one from the Schedule tab to start building a lineup.
        </p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelect(game.id)}
              className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-green-300"
            >
              <span className="block font-medium text-gray-900">
                {game.opponent ? `vs ${game.opponent}` : 'Game'}
              </span>
              <span className="block text-xs text-gray-500">
                {game.date.toDate().toLocaleString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                · {game.location}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FormatPrompt({ game }: { game: Game }) {
  const [saving, setSaving] = useState<GameFormat | null>(null)

  async function pick(format: GameFormat) {
    setSaving(format)
    await updateGame(game.id, { format })
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-semibold text-gray-900">Lineup</h1>
      <p className="text-sm text-gray-500">
        This game was created before formats existed — pick one to start building a lineup for it.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {GAME_FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => pick(f)}
            disabled={saving !== null}
            className="rounded-md bg-gray-100 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {saving === f ? 'Saving...' : f}
          </button>
        ))}
      </div>
    </div>
  )
}

function LineupBuilder({
  game,
  format,
  players,
}: {
  game: Game
  format: GameFormat
  players: Player[]
}) {
  const { periods, loading } = usePeriods(game.id)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
  const formations = getFormationsForFormat(format)
  const effectivePeriods = resolveEffectivePeriods(periods)
  const activeIndex = periods.findIndex((p) => p.id === selectedPeriodId)
  const activePeriod = (activeIndex >= 0 ? periods[activeIndex] : periods[0]) ?? null
  const effectiveIndex = activeIndex >= 0 ? activeIndex : 0
  const effective = activePeriod ? effectivePeriods[effectiveIndex] : null
  const activeFormation = effective ? getFormation(effective.formationKey) : undefined
  const isInherited = Boolean(activePeriod && effectiveIndex > 0 && !activePeriod.customized)

  async function handleAddPeriod() {
    const prev = periods[periods.length - 1]
    const ref = await addPeriod(game.id, {
      label: `Period ${periods.length + 1}`,
      order: periods.length,
      durationMinutes: prev?.durationMinutes ?? DEFAULT_PERIOD_MINUTES,
      formationKey: formations[0].key,
      assignments: Object.fromEntries(formations[0].slots.map((s) => [s.id, null])),
      customized: false,
    })
    setSelectedPeriodId(ref.id)
  }

  function handleFormationChange(key: string) {
    if (!activePeriod || !effective || key === effective.formationKey) return
    const formation = getFormation(key)
    if (!formation) return
    updatePeriod(game.id, activePeriod.id, {
      formationKey: key,
      assignments: Object.fromEntries(formation.slots.map((s) => [s.id, null])),
      customized: true,
    })
  }

  function handleAssign(slotId: string, playerId: string) {
    if (!activePeriod || !effective) return
    const next = { ...effective.assignments }
    for (const [sid, pid] of Object.entries(next)) {
      if (pid === playerId) next[sid] = null
    }
    next[slotId] = playerId
    updatePeriod(game.id, activePeriod.id, {
      formationKey: effective.formationKey,
      assignments: next,
      customized: true,
    })
  }

  function handleClear(slotId: string) {
    if (!activePeriod || !effective) return
    updatePeriod(game.id, activePeriod.id, {
      formationKey: effective.formationKey,
      assignments: { ...effective.assignments, [slotId]: null },
      customized: true,
    })
  }

  async function handleDeletePeriod(id: string) {
    await deletePeriod(game.id, id)
    if (selectedPeriodId === id) setSelectedPeriodId(null)
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {game.opponent ? `vs ${game.opponent}` : 'Game'} lineup
        </h1>
        <p className="text-xs text-gray-500">{format}</p>
      </div>

      {loading && <Spinner />}

      {!loading && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => setSelectedPeriodId(period.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activePeriod?.id === period.id
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
            <Button variant="secondary" onClick={handleAddPeriod}>
              + Period
            </Button>
          </div>

          {!activePeriod && (
            <p className="text-sm text-gray-500">Add a period to start building the lineup.</p>
          )}

          {activePeriod && effective && activeFormation && (
            <>
              <PeriodFields
                key={activePeriod.id}
                gameId={game.id}
                period={activePeriod}
                onDelete={periods.length > 1 ? () => handleDeletePeriod(activePeriod.id) : undefined}
              />

              {isInherited && (
                <p className="text-xs text-gray-400">
                  Matching an earlier period — assign a player or change formation here to
                  customize this period on its own.
                </p>
              )}

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Formation
                </p>
                <div className="flex flex-wrap gap-2">
                  {formations.map((formation) => (
                    <button
                      key={formation.key}
                      type="button"
                      onClick={() => handleFormationChange(formation.key)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeFormation.key === formation.key
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {formation.name}
                    </button>
                  ))}
                </div>
              </div>

              <Pitch
                formation={activeFormation}
                assignments={effective.assignments}
                players={players}
                onAssign={handleAssign}
                onClear={handleClear}
              />
            </>
          )}

          <PlayingTimeSummary
            periods={periods.map((p, i) => ({
              durationMinutes: p.durationMinutes,
              assignments: effectivePeriods[i].assignments,
            }))}
            players={players}
          />
        </>
      )}
    </div>
  )
}

function PeriodFields({
  gameId,
  period,
  onDelete,
}: {
  gameId: string
  period: { id: string; label: string; durationMinutes: number }
  onDelete?: () => void
}) {
  const [label, setLabel] = useState(period.label)
  const [duration, setDuration] = useState(String(period.durationMinutes))

  return (
    <div className="flex items-end gap-2">
      <label className="flex-1 text-sm font-medium text-gray-700">
        Label
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => label.trim() && updatePeriod(gameId, period.id, { label: label.trim() })}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
      </label>
      <label className="w-24 text-sm font-medium text-gray-700">
        Minutes
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          onBlur={() => {
            const n = Number(duration)
            if (n > 0) updatePeriod(gameId, period.id, { durationMinutes: n })
          }}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
      </label>
      {onDelete && (
        <Button variant="danger" type="button" onClick={onDelete}>
          Delete
        </Button>
      )}
    </div>
  )
}
