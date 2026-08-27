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
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Period, PeriodInput } from '../types/period'

function periodsCollection(gameId: string) {
  return collection(db!, 'games', gameId, 'periods')
}

export function usePeriods(gameId: string | undefined) {
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      setPeriods([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(periodsCollection(gameId), orderBy('order'))
    return onSnapshot(q, (snapshot) => {
      setPeriods(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Period))
      setLoading(false)
    })
  }, [gameId])

  return { periods, loading }
}

export function addPeriod(gameId: string, data: PeriodInput) {
  return addDoc(periodsCollection(gameId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updatePeriod(gameId: string, id: string, data: Partial<PeriodInput>) {
  return updateDoc(doc(periodsCollection(gameId), id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export function deletePeriod(gameId: string, id: string) {
  return deleteDoc(doc(periodsCollection(gameId), id))
}
