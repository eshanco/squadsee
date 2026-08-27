import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { GameFormat } from '../types/game'

export interface Settings {
  defaultGameFormat?: GameFormat
}

function settingsDoc() {
  return doc(db!, 'settings', 'app')
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onSnapshot(settingsDoc(), (snapshot) => {
      setSettings((snapshot.data() as Settings | undefined) ?? {})
      setLoading(false)
    })
  }, [])

  return { settings, loading }
}

// Only ever sets the default from a blank slate — once a default exists it's
// left alone, so overriding a single game's format never drifts the default.
export async function setDefaultGameFormatIfUnset(format: GameFormat) {
  const ref = settingsDoc()
  const snapshot = await getDoc(ref)
  if (snapshot.data()?.defaultGameFormat) return
  return setDoc(ref, { defaultGameFormat: format }, { merge: true })
}
