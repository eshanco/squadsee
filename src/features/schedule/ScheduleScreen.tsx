import { useEffect, useState } from 'react'
import {
  useGames,
  addGame,
  updateGame,
  deleteGame,
  createTrainingSession,
  updateAttendance,
} from '../../hooks/useGames'
import {
  useRecurringTrainings,
  addRecurringTraining,
  updateRecurringTraining,
} from '../../hooks/useRecurringTrainings'
import { usePlayers } from '../../hooks/usePlayers'
import { useSettings, setDefaultGameFormatIfUnset } from '../../hooks/useSettings'
import { GameForm } from './GameForm'
import { RecurringTrainingForm } from './RecurringTrainingForm'
import { AttendanceModal } from './AttendanceModal'
import { Button } from '../../components/Button'
import { Spinner } from '../../components/Spinner'
import { WEEKDAYS } from '../../types/training'
import { getTrainingOccurrences } from '../../lib/trainingOccurrences'
import type { Game } from '../../types/game'
import type { RecurringTraining } from '../../types/training'

const SESSION_WINDOW_FUTURE_DAYS = 56

// Sessions are generated back to the start of the season (August 1st) so the
// full season's history is available, not just a rolling few days.
function seasonStart(): Date {
  const now = new Date()
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return new Date(year, 7, 1)
}

export function ScheduleScreen({
  onOpenLineup,
}: {
  onOpenLineup: (game: Game) => void
}) {
  const { games, loading: gamesLoading } = useGames()
  const { trainings, loading: trainingsLoading } = useRecurringTrainings()
  const { players } = usePlayers()
  const { settings } = useSettings()
  const [editingGame, setEditingGame] = useState<Game | 'new' | null>(null)
  const [editingTraining, setEditingTraining] = useState<RecurringTraining | 'new' | null>(null)
  const [attendanceFor, setAttendanceFor] = useState<Game | null>(null)
  const [showPastSessions, setShowPastSessions] = useState(false)
  const [showMoreSessions, setShowMoreSessions] = useState(false)

  // Materialize each active recurring training into concrete practice
  // sessions within a rolling window, so attendance can attach to a specific
  // date rather than just the rule.
  useEffect(() => {
    if (gamesLoading || trainingsLoading) return

    const rangeStart = seasonStart()
    const rangeEnd = new Date()
    rangeEnd.setDate(rangeEnd.getDate() + SESSION_WINDOW_FUTURE_DAYS)

    for (const training of trainings) {
      if (!training.active) continue
      const existing = new Set(
        games.filter((g) => g.trainingId === training.id).map((g) => g.date.toMillis()),
      )
      for (const occurrence of getTrainingOccurrences(training, rangeStart, rangeEnd)) {
        if (!existing.has(occurrence.getTime())) {
          createTrainingSession(training, occurrence)
        }
      }
    }
  }, [games, gamesLoading, trainings, trainingsLoading])

  // One-time self-heal for sessions created before createTrainingSession used
  // a deterministic ID: collapse any leftover duplicates for the same
  // training+date down to a single doc, preferring one that already has
  // attendance recorded.
  useEffect(() => {
    if (gamesLoading) return

    const groups = new Map<string, Game[]>()
    for (const g of games) {
      if (g.type !== 'practice' || !g.trainingId) continue
      const key = `${g.trainingId}_${g.date.toMillis()}`
      const list = groups.get(key)
      if (list) list.push(g)
      else groups.set(key, [g])
    }

    for (const [key, group] of groups) {
      if (group.length <= 1) continue
      const keeper =
        group.find((g) => g.id === key) ??
        group.find((g) => Object.keys(g.attendance).length > 0) ??
        group[0]
      for (const duplicate of group) {
        if (duplicate.id !== keeper.id) deleteGame(duplicate.id)
      }
    }
  }, [games, gamesLoading])

  const activePlayers = players.filter((p) => p.active)
  const activeTrainings = [...trainings]
    .filter((t) => t.active)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  const now = Date.now()
  const pastSessions = games
    .filter((g) => g.type === 'practice' && g.date.toMillis() < now)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis())
  const futureSessions = games
    .filter((g) => g.type === 'practice' && g.date.toMillis() >= now)
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())
  const [nextSession, ...laterSessions] = futureSessions
  const upcomingGames = games
    .filter((g) => g.type === 'game' && g.date.toMillis() >= now)
    .sort((a, b) => a.date.toMillis() - b.date.toMillis())

  function renderSessionButton(session: Game) {
    return (
      <button
        key={session.id}
        type="button"
        onClick={() => setAttendanceFor(session)}
        className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-green-300"
      >
        <span className="block font-medium text-gray-900">
          {formatDateTime(session.date.toDate())}
        </span>
        <span className="block text-xs text-gray-500">{session.location}</span>
      </button>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Training
          </h2>
          <Button onClick={() => setEditingTraining('new')}>Add</Button>
        </div>

        {trainingsLoading && <Spinner />}
        {!trainingsLoading && activeTrainings.length === 0 && (
          <p className="text-sm text-gray-500">No recurring training set up yet.</p>
        )}

        <div className="space-y-2">
          {activeTrainings.map((training) => (
            <button
              key={training.id}
              type="button"
              onClick={() => setEditingTraining(training)}
              className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-green-300"
            >
              <span className="block font-medium text-gray-900">
                {WEEKDAYS[training.dayOfWeek]}s, {formatTime(training.startTime)}
              </span>
              <span className="block text-xs text-gray-500">{training.location}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
          Sessions
        </h2>

        {activeTrainings.length === 0 && (
          <p className="text-sm text-gray-500">Add a recurring training to see sessions here.</p>
        )}

        {pastSessions.length > 0 && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setShowPastSessions((v) => !v)}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              {showPastSessions ? 'Hide past sessions' : `Show past sessions (${pastSessions.length})`}
            </button>
            {showPastSessions && (
              <div className="mt-2 space-y-2">{pastSessions.map(renderSessionButton)}</div>
            )}
          </div>
        )}

        {!trainingsLoading && activeTrainings.length > 0 && !nextSession && (
          <p className="text-sm text-gray-500">No upcoming sessions scheduled.</p>
        )}

        <div className="space-y-2">{nextSession && renderSessionButton(nextSession)}</div>

        {laterSessions.length > 0 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowMoreSessions((v) => !v)}
              className="text-sm text-green-700 underline hover:text-green-800"
            >
              {showMoreSessions ? 'Hide' : `Show ${laterSessions.length} more upcoming`}
            </button>
            {showMoreSessions && (
              <div className="mt-2 space-y-2">{laterSessions.map(renderSessionButton)}</div>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Games</h2>
          <Button onClick={() => setEditingGame('new')}>Add</Button>
        </div>

        {gamesLoading && <Spinner />}
        {!gamesLoading && upcomingGames.length === 0 && (
          <p className="text-sm text-gray-500">No upcoming games scheduled.</p>
        )}

        <div className="space-y-2">
          {upcomingGames.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setEditingGame(game)}
              className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm hover:border-green-300"
            >
              <span className="block font-medium text-gray-900">
                {game.opponent ? `vs ${game.opponent}` : 'Game'}
              </span>
              <span className="block text-xs text-gray-500">
                {formatDateTime(game.date.toDate())} · {game.location}
              </span>
            </button>
          ))}
        </div>
      </section>

      {editingTraining && (
        <RecurringTrainingForm
          initial={editingTraining === 'new' ? undefined : editingTraining}
          onClose={() => setEditingTraining(null)}
          onSave={async (data) => {
            if (editingTraining === 'new') {
              await addRecurringTraining(data)
            } else {
              await updateRecurringTraining(editingTraining.id, data)
            }
          }}
          onToggleActive={
            editingTraining === 'new'
              ? undefined
              : async () => {
                  await updateRecurringTraining(editingTraining.id, {
                    active: !editingTraining.active,
                  })
                  setEditingTraining(null)
                }
          }
        />
      )}

      {editingGame && (
        <GameForm
          initial={editingGame === 'new' ? undefined : editingGame}
          defaultFormat={settings.defaultGameFormat}
          onClose={() => setEditingGame(null)}
          onSave={async (data) => {
            if (editingGame === 'new') {
              await addGame(data)
              if (data.format) await setDefaultGameFormatIfUnset(data.format)
            } else {
              await updateGame(editingGame.id, data)
            }
          }}
          onDelete={
            editingGame === 'new'
              ? undefined
              : async () => {
                  await deleteGame(editingGame.id)
                  setEditingGame(null)
                }
          }
          onAttendance={
            editingGame === 'new'
              ? undefined
              : () => {
                  const game = editingGame
                  setEditingGame(null)
                  setAttendanceFor(game)
                }
          }
          onLineup={
            editingGame === 'new'
              ? undefined
              : () => {
                  const game = editingGame
                  setEditingGame(null)
                  onOpenLineup(game)
                }
          }
        />
      )}

      {attendanceFor && (
        <AttendanceModal
          game={attendanceFor}
          players={activePlayers}
          title={`Attendance · ${
            attendanceFor.type === 'game'
              ? attendanceFor.opponent
                ? `vs ${attendanceFor.opponent}`
                : 'Game'
              : `Training, ${formatDateTime(attendanceFor.date.toDate())}`
          }`}
          onClose={() => setAttendanceFor(null)}
          onSave={(attendance) => updateAttendance(attendanceFor.id, attendance)}
        />
      )}
    </div>
  )
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDateTime(date: Date) {
  return date.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
