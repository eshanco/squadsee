import type { Game } from '../types/game'

export interface AttendanceStats {
  attended: number
  missed: number
  recorded: number
  // null until at least one past session has attendance recorded for this player
  percentage: number | null
}

// Training-only (not games), and only sessions that have already happened
// with attendance actually recorded — unmarked sessions are a data-entry gap,
// not a missed session, so they're excluded rather than counted against the
// player. 'excused' counts toward neither attended nor missed.
export function getPlayerAttendanceStats(sessions: Game[], playerId: string): AttendanceStats {
  const now = Date.now()
  let attended = 0
  let missed = 0
  let recorded = 0

  for (const session of sessions) {
    if (session.type !== 'practice' || session.date.toMillis() >= now) continue
    const status = session.attendance[playerId]
    if (!status) continue

    recorded += 1
    if (status === 'present' || status === 'late') attended += 1
    else if (status === 'absent') missed += 1
  }

  return {
    attended,
    missed,
    recorded,
    percentage: recorded > 0 ? Math.round((attended / recorded) * 100) : null,
  }
}
