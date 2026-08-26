import type { Timestamp } from 'firebase/firestore'

export interface Period {
  id: string
  label: string
  order: number
  durationMinutes: number
  formationKey: string
  assignments: Record<string, string | null>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type PeriodInput = Omit<Period, 'id' | 'createdAt' | 'updatedAt'>
