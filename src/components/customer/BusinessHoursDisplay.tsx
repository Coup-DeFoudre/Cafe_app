'use client'

import { BusinessHours } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

interface BusinessHoursDisplayProps {
  businessHours: BusinessHours
}

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function BusinessHoursDisplay({ businessHours }: BusinessHoursDisplayProps) {
  const getTodayIndex = (): number => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return DAYS_ORDER.indexOf(today)
  }

  const todayIndex = getTodayIndex()

  return (
    <div className="space-y-2">
      {DAYS_ORDER.map((day, index) => {
        const dayHours = businessHours[day]
        if (!dayHours) return null

        const isToday = index === todayIndex
        const isClosed = dayHours.closed

        return (
          <div
            key={day}
            className="flex justify-between items-center text-sm"
          >
            <span className={isToday ? 'font-bold' : 'text-muted-foreground'}>
              {DAY_LABELS[day]}
            </span>
            {isClosed ? (
              <span className="text-muted-foreground">Closed</span>
            ) : (
              <span 
                className={isToday ? 'font-semibold' : 'text-muted-foreground'}
                style={isToday ? { color: 'hsl(80, 20%, 45%)' } : {}}
              >
                {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
