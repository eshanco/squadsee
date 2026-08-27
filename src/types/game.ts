import type { Timestamp } from 'firebase/firestore'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export type GameFormat = '7v7' | '9v9' | '11v11'

export const GAME_FORMATS: GameFormat[] = ['7v7', '9v9', '11v11']

export interface Game {
  id: string
  type: 'game' | 'practice'
  opponent?: string
  // Only set on type 'game' entries — drives which formations are offered in the lineup builder.
  format?: GameFormat
  date: Timestamp
  location: string
  notes?: string
  attendance: Record<string, AttendanceStatus>
  // Set only on practice sessions materialized from a RecurringTraining rule.
  trainingId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type GameInput = Omit<Game, 'id' | 'createdAt' | 'updatedAt'>
