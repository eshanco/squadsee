import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AttendanceStatus, Game, GameInput } from '../types/game'
import type { RecurringTraining } from '../types/training'

function gamesCollection() {
  return collection(db!, 'games')
}

export type GameFormInput = Omit<GameInput, 'date' | 'attendance'> & { date: Date }

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(gamesCollection(), orderBy('date'))
    return onSnapshot(q, (snapshot) => {
      setGames(
        snapshot.docs.map((d) => {
          const data = d.data()
          return { id: d.id, ...data, attendance: data.attendance ?? {} } as Game
        }),
      )
      setLoading(false)
    })
  }, [])

  return { games, loading }
}

export function addGame(data: GameFormInput) {
  return addDoc(gamesCollection(), {
    ...data,
    date: Timestamp.fromDate(data.date),
    attendance: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateGame(id: string, data: Partial<GameFormInput>) {
  const { date, ...rest } = data
  return updateDoc(doc(gamesCollection(), id), {
    ...rest,
    ...(date ? { date: Timestamp.fromDate(date) } : {}),
    updatedAt: serverTimestamp(),
  })
}

export function deleteGame(id: string) {
  return deleteDoc(doc(gamesCollection(), id))
}

// Deterministic ID (trainingId + occurrence time) makes this an idempotent
// upsert, so calling it twice for the same slot (e.g. React StrictMode's
// double effect invocation) can never create a duplicate document.
// `attendance` is deliberately never written here — only updateAttendance()
// touches it, so a repeat call can't clobber attendance already recorded.
export function createTrainingSession(training: RecurringTraining, date: Date) {
  const id = `${training.id}_${date.getTime()}`
  return setDoc(
    doc(gamesCollection(), id),
    {
      type: 'practice',
      trainingId: training.id,
      date: Timestamp.fromDate(date),
      location: training.location,
      notes: training.notes,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export function updateAttendance(id: string, attendance: Record<string, AttendanceStatus>) {
  return updateDoc(doc(gamesCollection(), id), {
    attendance,
    updatedAt: serverTimestamp(),
  })
}
