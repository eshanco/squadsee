import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Formation } from '../../types/formation'
import type { Player } from '../../types/player'

// dnd-kit tracks draggables and droppables in the same id space internally,
// and slot ids ('gk', 'd1', ...) are short enough to collide with a player
// doc id in theory — prefixing keeps the two namespaces unambiguous.
const playerDragId = (playerId: string) => `player:${playerId}`
const slotDropId = (slotId: string) => `slot:${slotId}`

export function Pitch({
  formation,
  assignments,
  players,
  onAssign,
  onClear,
}: {
  formation: Formation
  assignments: Record<string, string | null>
  players: Player[]
  onAssign: (slotId: string, playerId: string) => void
  onClear: (slotId: string) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const playersById = new Map(players.map((p) => [p.id, p]))
  const assignedIds = new Set(Object.values(assignments).filter((id): id is string => !!id))
  const bench = players.filter((p) => !assignedIds.has(p.id))

  function handleDragEnd(event: DragEndEvent) {
    const overId = event.over?.id
    const activeId = event.active.id
    if (!overId || typeof overId !== 'string' || typeof activeId !== 'string') return
    if (!overId.startsWith('slot:') || !activeId.startsWith('player:')) return
    onAssign(overId.slice('slot:'.length), activeId.slice('player:'.length))
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative mx-auto aspect-[3/4] h-[36vh] max-h-96 overflow-hidden rounded-lg bg-green-700">
        {formation.slots.map((slot) => (
          <SlotDroppable
            key={slot.id}
            slot={slot}
            player={assignments[slot.id] ? (playersById.get(assignments[slot.id]!) ?? null) : null}
            onClear={() => onClear(slot.id)}
          />
        ))}
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">Bench</p>
        {bench.length === 0 ? (
          <p className="text-sm text-gray-500">Everyone's on the pitch.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bench.map((player) => (
              <PlayerChip key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </DndContext>
  )
}

function SlotDroppable({
  slot,
  player,
  onClear,
}: {
  slot: Formation['slots'][number]
  player: Player | null
  onClear: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slotDropId(slot.id) })

  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={player ? onClear : undefined}
      className={`absolute flex w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-md text-center transition-colors ${
        isOver ? 'bg-white/20' : ''
      }`}
      style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold shadow-sm ${
          player ? 'bg-white text-green-800' : 'border-2 border-dashed border-white/60 text-white/60'
        }`}
      >
        {player ? player.jerseyNumber : slot.label}
      </span>
      <span className="w-full truncate text-[9px] font-medium text-white">
        {player ? player.lastName : ''}
      </span>
    </button>
  )
}

function PlayerChip({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: playerDragId(player.id),
  })

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`flex touch-none items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1 pr-3 pl-1 text-sm shadow-sm ${
        isDragging ? 'z-10 opacity-70' : ''
      }`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
        {player.jerseyNumber}
      </span>
      {player.firstName} {player.lastName}
    </button>
  )
}
