'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { PRICING_PLANS } from '@/lib/plans'
import { PlanTier } from '@/lib/types'

interface FeatureLockedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  requiredPlanId?: PlanTier
  currentPlanId?: PlanTier
  lang: 'ar' | 'en'
}

export function FeatureLockedModal({
  isOpen,
  onClose,
  title,
  titleAr,
  description,
  descriptionAr,
  requiredPlanId = 'growth',
  currentPlanId = 'free',
  lang,
}: FeatureLockedModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const targetPlan = PRICING_PLANS.find((p) => p.id === requiredPlanId) || PRICING_PLANS[2]
  const currentPlan = PRICING_PLANS.find((p) => p.id === currentPlanId) || PRICING_PLANS[0]

  const handleGoToUpgrade = () => {
    onClose()
    router.push(`/checkout?plan=${targetPlan.id}&billing=monthly`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 text-slate-900 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-center font-black text-lg text-slate-900">
          {lang === 'ar' ? titleAr : title}
        </h3>
        <p className="text-center text-xs text-slate-500 mt-1 mb-5">
          {lang === 'ar' ? descriptionAr : description}
        </p>

        {/* Plan Comparison Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{lang === 'ar' ? 'باقتك الحالية:' : 'Your Plan:'}</span>
            <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {lang === 'ar' ? currentPlan.nameAr : currentPlan.name} ({currentPlan.studentsLabelAr})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
            <span className="font-bold text-[#0f2c59] flex items-center gap-1">
              <span>{lang === 'ar' ? 'الباقة المطلوبة:' : 'Required Tier:'}</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-black">
                {lang === 'ar' ? 'لفترة محدودة' : 'Limited Time'}
              </span>
            </span>
            <span className="font-price font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded border border-emerald-300">
              {lang === 'ar' ? targetPlan.nameAr : targetPlan.name} ({targetPlan.monthlyPrice} ج.م / شهر)
            </span>
          </div>

          <div className="pt-2 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">{lang === 'ar' ? 'ما ستحصل عليه فور الترقية:' : 'Unlocks immediately:'}</p>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'ar' ? `سعة حتى ${targetPlan.studentsLimit} طالباً` : `Capacity for ${targetPlan.studentsLimit} students`}</span>
            </div>
            {targetPlan.featuresAr.slice(1, 4).map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'ar' ? f : targetPlan.features[i + 1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>

          <button
            type="button"
            onClick={handleGoToUpgrade}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0f2c59] to-[#1a3d6d] hover:from-[#1a3d6d] hover:to-[#0f2c59] text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 transition"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{lang === 'ar' ? 'ترقية الباقة الآن' : 'Upgrade Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
