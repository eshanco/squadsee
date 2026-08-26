import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from './config'

// Only ever called from within the tree App.tsx mounts after confirming
// firebaseConfigured, so `auth` is guaranteed to be initialized here.

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth!, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth!, email, password)
}

export function logout() {
  return signOut(auth!)
}
