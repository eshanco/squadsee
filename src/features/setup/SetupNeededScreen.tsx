export function SetupNeededScreen() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50 p-6">
      <div className="max-w-sm space-y-3 text-center">
        <h1 className="text-xl font-bold text-green-800">SquadSee</h1>
        <p className="text-sm text-gray-600">
          Firebase isn't configured yet. Copy <code>.env.example</code> to{' '}
          <code>.env.local</code> and fill in your Firebase project's values, or (for a
          deployed build) set the <code>VITE_FIREBASE_*</code> repository variables in
          GitHub Actions.
        </p>
      </div>
    </div>
  )
}
