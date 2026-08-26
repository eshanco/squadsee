export interface FormationSlot {
  id: string
  label: string
  x: number // 0-100, percentage across the pitch
  y: number // 0-100, percentage down the pitch (0 = attacking end, 100 = goalkeeper)
}

export interface Formation {
  key: string
  name: string
  slots: FormationSlot[]
}
