import { useState } from 'react'
import { NavBar, type Screen } from './components/NavBar'
import { RosterScreen } from './features/roster/RosterScreen'
import { ScheduleScreen } from './features/schedule/ScheduleScreen'
import { LineupScreen } from './features/lineup/LineupScreen'
import { LoginScreen } from './features/auth/LoginScreen'
import { SetupNeededScreen } from './features/setup/SetupNeededScreen'
import { Spinner } from './components/Spinner'
import { useAuth, logout } from './firebase/auth'
import { firebaseConfigured } from './firebase/config'
import { Button } from './components/Button'

function App() {
  if (!firebaseConfigured) return <SetupNeededScreen />
  return <AuthedApp />
}

function AuthedApp() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState<Screen>('roster')
  const [lineupGameId, setLineupGameId] = useState<string | null>(null)

  if (loading) return <Spinner />
  if (!user) return <LoginScreen />

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <h1 className="text-lg font-bold text-green-800">SquadSee</h1>
        <Button variant="secondary" onClick={() => logout()}>
          Sign out
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto">
        {screen === 'roster' && <RosterScreen />}
        {screen === 'schedule' && (
          <ScheduleScreen
            onOpenLineup={(game) => {
              setLineupGameId(game.id)
              setScreen('lineup')
            }}
          />
        )}
        {screen === 'lineup' && (
          <LineupScreen gameId={lineupGameId} onSelectGame={setLineupGameId} />
        )}
      </main>
      <NavBar active={screen} onChange={setScreen} />
    </div>
  )
}

export default App
