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
import type { Player, PlayerInput } from '../types/player'

// Computed lazily (not at module scope) so importing this module doesn't
// touch `db` before App.tsx has confirmed firebaseConfigured — `db` is only
// guaranteed to be initialized once these functions actually run.
function playersCollection() {
  return collection(db!, 'players')
}

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(playersCollection(), orderBy('jerseyNumber'))
    return onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Player))
      setLoading(false)
    })
  }, [])

  return { players, loading }
}

export function addPlayer(data: PlayerInput) {
  return addDoc(playersCollection(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updatePlayer(id: string, data: Partial<PlayerInput>) {
  return updateDoc(doc(playersCollection(), id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}
