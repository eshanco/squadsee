import type { Timestamp } from 'firebase/firestore'

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface RecurringTraining {
  id: string
  dayOfWeek: Weekday
  startTime: string // "HH:mm", 24-hour
  durationMinutes: number
  location: string
  notes?: string
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type RecurringTrainingInput = Omit<RecurringTraining, 'id' | 'createdAt' | 'updatedAt'>
