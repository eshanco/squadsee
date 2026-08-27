import type { Period } from '../types/period'

export interface EffectivePeriod {
  formationKey: string
  assignments: Record<string, string | null>
}

// A period that hasn't been explicitly customized live-mirrors whichever
// period before it was last customized (chaining through any number of
// untouched periods in between), rather than storing a stale copy. The first
// period always uses its own stored values since there's nothing before it.
export function resolveEffectivePeriods(periods: Period[]): EffectivePeriod[] {
  const effective: EffectivePeriod[] = []
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    effective.push(
      i === 0 || period.customized
        ? { formationKey: period.formationKey, assignments: period.assignments }
        : effective[i - 1],
    )
  }
  return effective
}
