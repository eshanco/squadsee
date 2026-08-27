import type { Timestamp } from 'firebase/firestore'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface Game {
  id: string
  type: 'game' | 'practice'
  opponent?: string
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
