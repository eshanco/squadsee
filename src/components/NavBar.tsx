export type Screen = 'roster' | 'schedule' | 'lineup'

const TABS: { id: Screen; label: string }[] = [
  { id: 'roster', label: 'Squad' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'lineup', label: 'Lineup' },
]

export function NavBar({
  active,
  onChange,
}: {
  active: Screen
  onChange: (screen: Screen) => void
}) {
  return (
    <nav className="flex border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            active === tab.id
              ? 'text-green-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
