'use client'

import React from 'react'
import { CalendarDays, Clock, MapPin, UsersRound, Sparkles } from 'lucide-react'
import { Group } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

interface ScheduleViewProps {
  groups: Group[]
  onSelectGroup: (groupId: string) => void
  onAddGroup: () => void
}

const WEEKDAYS_DATA = [
  { keyAr: 'السبت', keyEn: 'Saturday', dayIndex: 6 },
  { keyAr: 'الأحد', keyEn: 'Sunday', dayIndex: 0 },
  { keyAr: 'الإثنين', keyEn: 'Monday', dayIndex: 1 },
  { keyAr: 'الثلاثاء', keyEn: 'Tuesday', dayIndex: 2 },
  { keyAr: 'الأربعاء', keyEn: 'Wednesday', dayIndex: 3 },
  { keyAr: 'الخميس', keyEn: 'Thursday', dayIndex: 4 },
  { keyAr: 'الجمعة', keyEn: 'Friday', dayIndex: 5 },
]

export function ScheduleView({ groups, onSelectGroup, onAddGroup }: ScheduleViewProps) {
  const { lang, t } = useLanguage()
  const todayIndex = new Date().getDay()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.schedule.title}</h2>
          <p className="text-xs text-slate-500">
            {t.schedule.subtitle}
          </p>
        </div>

        <Button
          onClick={onAddGroup}
          className="rounded-xl bg-[#7047EB] px-4 text-xs font-bold text-white hover:bg-[#5D35D5] cursor-pointer"
        >
          {t.schedule.addGroup}
        </Button>
      </div>

      {/* Timetable Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEKDAYS_DATA.map(({ keyAr, keyEn, dayIndex }) => {
          const isToday = dayIndex === todayIndex
          const label = lang === 'en' ? keyEn : keyAr
          const dayGroups = groups.filter((g) =>
            g.schedule_days.includes(keyAr) ||
            g.schedule_days.includes(keyEn) ||
            g.schedule_days.some((d) => d.toLowerCase() === keyEn.toLowerCase())
          )

          return (
            <div
              key={keyEn}
              className={`card-glass flex flex-col p-4 transition ${
                isToday ? 'border-2 border-[#7047EB] ring-2 ring-blue-100' : ''
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{label}</span>
                  {isToday && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#7047EB]">
                      {t.schedule.today}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {dayGroups.length} {lang === 'en' ? (dayGroups.length === 1 ? 'class' : 'classes') : (dayGroups.length === 1 ? 'حصة' : 'حصص')}
                </span>
              </div>

              {/* Day's Lessons */}
              <div className="mt-3 flex-1 space-y-2.5">
                {dayGroups.length === 0 ? (
                  <div className="flex h-28 items-center justify-center text-[11px] text-slate-400">
                    {t.schedule.noSessions}
                  </div>
                ) : (
                  dayGroups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => onSelectGroup(g.id)}
                      className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-[#7047EB]/30 hover:bg-white hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#7047EB]">
                          {g.stage_label}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700">
                          <Clock className="size-3 text-slate-400" /> {g.time_slot}
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-bold text-slate-800 group-hover:text-[#7047EB]">
                        {g.name}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-slate-400" /> {g.center_name}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <UsersRound className="size-3 text-slate-400" /> {g.student_count || 20} {lang === 'en' ? 'students' : 'طالب'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
