import type { RecurringTraining } from '../types/training'

// All dates matching a recurring training's day-of-week/time within
// [rangeStart, rangeEnd], inclusive.
export function getTrainingOccurrences(
  training: RecurringTraining,
  rangeStart: Date,
  rangeEnd: Date,
): Date[] {
  const [hours, minutes] = training.startTime.split(':').map(Number)
  const occurrences: Date[] = []

  const cursor = new Date(rangeStart)
  cursor.setHours(0, 0, 0, 0)
  const daysUntilFirst = (training.dayOfWeek - cursor.getDay() + 7) % 7
  cursor.setDate(cursor.getDate() + daysUntilFirst)
  cursor.setHours(hours, minutes, 0, 0)

  while (cursor <= rangeEnd) {
    occurrences.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }

  return occurrences
}
