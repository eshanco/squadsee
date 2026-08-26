import type { Timestamp } from 'firebase/firestore'

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'

export const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'FWD']

export interface Player {
  id: string
  firstName: string
  lastName: string
  jerseyNumber: number
  primaryPosition: Position
  phone?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  notes?: string
  active: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type PlayerInput = Omit<Player, 'id' | 'createdAt' | 'updatedAt'>
