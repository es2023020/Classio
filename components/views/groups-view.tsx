'use client'

import React from 'react'
import {
  Grid2X2,
  Plus,
  UsersRound,
  MapPin,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Group, Student } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { formatPrice } from '@/lib/localization'

interface GroupsViewProps {
  groups: Group[]
  students: Student[]
  onAddGroup: () => void
  onEditGroup: (group: Group) => void
  onDeleteGroup: (groupId: string) => void
  onSelectGroupStudents: (groupId: string) => void
}

export function GroupsView({
  groups,
  students,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onSelectGroupStudents,
}: GroupsViewProps) {
  const { lang, t, isRTL } = useLanguage()
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t.groups.title}</h2>
          <p className="text-xs text-slate-500">
            {t.groups.subtitle}
          </p>
        </div>

        <Button
          onClick={onAddGroup}
          className="rounded-xl bg-[#0f2c59] px-4 text-xs font-bold text-white hover:bg-[#1a3d6d] cursor-pointer"
        >
          <Plus className="size-4" />
          {t.groups.addGroup}
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card-glass p-8 text-center text-xs font-semibold text-slate-400">
          {t.groups.noGroups}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const groupStudents = students.filter((s) => s.group_id === group.id)
            const studentCount = groupStudents.length
            const maxCapacity = group.max_students || 35
            const percentFull = Math.min(100, Math.round((studentCount / maxCapacity) * 100))

            return (
              <div
                key={group.id}
                className="card-glass relative flex flex-col justify-between overflow-hidden p-5"
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#0f2c59]">
                      {group.stage_label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditGroup(group)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        title={t.groups.editGroup}
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGroup(group.id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title={t.groups.deleteGroup}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-800">{group.name}</h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{group.center_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-slate-400 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {group.schedule_days.map((day) => (
                          <span
                            key={day}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-slate-400 shrink-0" />
                      <span>{group.time_slot}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="size-3.5 text-slate-400 shrink-0" />
                      <span>
                        {t.groups.fee}: <b className="text-slate-900">{formatPrice(group.monthly_fee, lang)}</b> {t.groups.perMonth}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <UsersRound className="size-3.5" /> {t.groups.capacity}:
                      </span>
                      <span>
                        {studentCount} / {maxCapacity} ({percentFull}%)
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentFull >= 90
                            ? 'bg-rose-500'
                            : percentFull >= 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <button
                  onClick={() => onSelectGroupStudents(group.id)}
                  className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-[#0f2c59] transition hover:bg-slate-50 cursor-pointer"
                >
                  {t.groups.viewStudents} ({studentCount}) <ArrowIcon className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
