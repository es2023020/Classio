'use client'

import Link from 'next/link'
import { Sparkles, Heart, ShieldAlert } from 'lucide-react'
import { ClassioLogo } from '@/components/ui/classio-logo'

interface FooterProps {
  lang: 'en' | 'ar'
}

const content = {
  en: {
    logo: 'Classio',
    tagline:
      'The modern Tutor Management & Student Success Platform built specifically for private tutors, educational centers, and academies.',
    product: {
      title: 'Platform Features',
      links: [
        { label: 'Student Success Profiles', href: '/#success-profile' },
        { label: 'Attendance & Homework', href: '/#features' },
        { label: 'InstaPay & Vodafone Cash', href: '/#features' },
        { label: 'WhatsApp Progress Reports', href: '/#features' },
        { label: 'Curriculum & Lesson Planner', href: '/#features' },
        { label: 'Pricing Plans', href: '/#pricing' },
      ],
    },
    navigation: {
      title: 'Quick Access',
      links: [
        { label: 'Tutor Dashboard', href: '/dashboard' },
        { label: 'Partnerships & Investors', href: '/partnerships' },
        { label: 'Tutor Sign In', href: '/login' },
        { label: 'Start Free Trial', href: '/login?mode=signup' },
        { label: 'Subscribe & Checkout', href: '/checkout' },
      ],
    },
    support: {
      title: 'Tutor Support & Guides',
      links: [
        { label: 'WhatsApp Tutor Helpdesk', href: 'https://wa.me/201299930937' },
        { label: 'Partner & Investor Desk', href: '/partnerships' },
        { label: 'Supabase Integration Guide', href: '#' },
        { label: 'Excel Import Template', href: '/dashboard' },
        { label: 'Frequently Asked Questions', href: '/#faq' },
      ],
    },
    copyright: `© ${new Date().getFullYear()} Classio Platform. All rights reserved.`,
    madeWith: 'Designed & built with excellence for independent tutors across Egypt.',
  },
  ar: {
    logo: 'Classio',
    tagline:
      'المنصة الرقمية المتكاملة لإدارة دروسك ومجموعاتك وقياس النجاح الأكاديمي لطلابك، مصممة للمدرسين المحترفين والسناتر.',
    product: {
      title: 'مميزات المنصة',
      links: [
        { label: 'ملفات نجاح الطلاب ومصفوفة الإتقان', href: '/#success-profile' },
        { label: 'الحضور والواجبات اليومية', href: '/#features' },
        { label: 'التحصيل عبر إنستاباي وفودافون كاش', href: '/#features' },
        { label: 'تقارير واتساب الدورية لأولياء الأمور', href: '/#features' },
        { label: 'تحضير الدروس والمنهج', href: '/#features' },
        { label: 'باقات الاشتراك والأسعار', href: '/#pricing' },
      ],
    },
    navigation: {
      title: 'روابط سريعة',
      links: [
        { label: 'لوحة تحكم المدرس', href: '/dashboard' },
        { label: 'الشراكات والمستثمرون', href: '/partnerships' },
        { label: 'تسجيل دخول المدرس', href: '/login' },
        { label: 'ابدأ التجربة المجانية', href: '/login?mode=signup' },
        { label: 'الاشتراك والدفع', href: '/checkout' },
      ],
    },
    support: {
      title: 'المساعدة والدعم',
      links: [
        { label: 'دعم المدرسين عبر واتساب', href: 'https://wa.me/201299930937' },
        { label: 'بوابة المستثمرين والشركاء', href: '/partnerships' },
        { label: 'دليل ربط قاعدة بيانات Supabase', href: '#' },
        { label: 'قالب استيراد الطلاب من Excel', href: '/dashboard' },
        { label: 'الأسئلة الشائعة والمساعدة', href: '/#faq' },
      ],
    },
    copyright: `© ${new Date().getFullYear()} منصة Classio. جميع الحقوق محفوظة.`,
    madeWith: 'صُممت وطُوّرت بأعلى درجات الاحترافية لمدرسي مصر.',
  },
}

export function LandingFooter({ lang }: FooterProps) {
  const t = content[lang]
  const isRtl = lang === 'ar'

  return (
    <footer className="bg-[#0b192c] text-white border-t border-slate-800" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <ClassioLogo size="lg" variant="dark" />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">{t.tagline}</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline-first & Cloud-ready</span>
            </div>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">{t.product.title}</h4>
            <ul className="space-y-2.5">
              {t.product.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-slate-400 hover:text-white text-xs font-semibold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Col */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">{t.navigation.title}</h4>
            <ul className="space-y-2.5">
              {t.navigation.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-white text-xs font-semibold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">{t.support.title}</h4>
            <ul className="space-y-2.5">
              {t.support.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-slate-400 hover:text-white text-xs font-semibold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <p>{t.copyright}</p>
            <Link
              href="/admin/gateway"
              className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded-md"
              title="Classio Master Root Gateway"
              aria-label="Admin Gateway"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>{t.madeWith}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
