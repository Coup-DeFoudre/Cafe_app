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
  const isOpen = (day: string): boolean => {
    const dayHours = businessHours[day]
    return dayHours ? !dayHours.closed : false
  }

  const getTodayIndex = (): number => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return DAYS_ORDER.indexOf(today)
  }

  const todayIndex = getTodayIndex()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS_ORDER.map((day, index) => {
          const dayHours = businessHours[day]
          if (!dayHours) return null

          const isToday = index === todayIndex
          const isClosed = dayHours.closed

          return (
            <Card
              key={day}
              className={`p-4 transition-all duration-300 ${
                isToday
                  ? 'ring-2 ring-primary bg-primary/5 border-primary'
                  : 'hover:shadow-md'
              } ${isClosed ? 'bg-slate-50 dark:bg-slate-900' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base">{DAY_LABELS[day]}</h4>
                      {isToday && (
                        <Badge variant="default" className="text-xs">
                          Today
                        </Badge>
                      )}
                    </div>

                    {isClosed ? (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Closed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">
                            {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>


    </div>
  )
}
