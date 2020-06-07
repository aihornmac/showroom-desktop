import { format } from 'date-fns'

export function getDayStartTimstamp(date: number | Date) {
  return Date.parse(format(date, `yyyy-MM-dd 00:00:00`))
}
