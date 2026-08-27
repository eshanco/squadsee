import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { RecurringTraining, RecurringTrainingInput } from '../types/training'

function recurringTrainingsCollection() {
  return collection(db!, 'recurringTrainings')
}

export function useRecurringTrainings() {
  const [trainings, setTrainings] = useState<RecurringTraining[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(recurringTrainingsCollection(), orderBy('dayOfWeek'))
    return onSnapshot(q, (snapshot) => {
      setTrainings(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as RecurringTraining))
      setLoading(false)
    })
  }, [])

  return { trainings, loading }
}

export function addRecurringTraining(data: RecurringTrainingInput) {
  return addDoc(recurringTrainingsCollection(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateRecurringTraining(id: string, data: Partial<RecurringTrainingInput>) {
  return updateDoc(doc(recurringTrainingsCollection(), id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
