import type { Timestamp } from 'firebase/firestore'

export interface Period {
  id: string
  label: string
  order: number
  durationMinutes: number
  formationKey: string
  assignments: Record<string, string | null>
  // False (or missing, for docs written before this field existed) means this
  // period hasn't been explicitly edited — it live-mirrors whichever period
  // before it was last customized, rather than storing its own lineup. The
  // first edit made while this period is active flips it to true and freezes
  // formationKey/assignments at whatever was being mirrored plus that edit.
  customized?: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type PeriodInput = Omit<Period, 'id' | 'createdAt' | 'updatedAt'>
