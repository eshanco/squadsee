// Minutes each player has been assigned a slot across the given periods. A
// player who never appears in any period's assignments is omitted rather
// than reported as 0, since 0 minutes and "never considered" are different
// states. Callers pass each period's *effective* assignments (see
// resolveEffectivePeriods) so an uninitialized period still counts the
// lineup it's currently mirroring.
export function computePlayingTime(
  periods: { durationMinutes: number; assignments: Record<string, string | null> }[],
): Record<string, number> {
  const minutes: Record<string, number> = {}

  for (const period of periods) {
    for (const playerId of Object.values(period.assignments)) {
      if (!playerId) continue
      minutes[playerId] = (minutes[playerId] ?? 0) + period.durationMinutes
    }
  }

  return minutes
}
