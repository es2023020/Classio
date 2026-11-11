'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe, ArrowRight, UserCheck } from 'lucide-react'
import { ClassioLogo } from '@/components/ui/classio-logo'

interface NavbarProps {
  lang: 'en' | 'ar'
  onToggleLang: () => void
}

const content = {
  en: {
    logo: 'Classio',
    logoSub: 'Tutor & Student Success',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Student Success', href: '/#success-profile' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Pricing Plans', href: '/pricing' },
      { label: 'Partnerships & Investors', href: '/partnerships' },
      { label: 'FAQ', href: '/#faq' },
    ],
    cta: 'Start Free Trial',
    login: 'Log In',
    demo: 'Live Demo',
  },
  ar: {
    logo: 'Classio',
    logoSub: 'منصة إدارة المدرس والنجاح',
    links: [
      { label: 'المميزات', href: '/#features' },
      { label: 'نجاح الطلاب', href: '/#success-profile' },
      { label: 'كيف يعمل', href: '/#how-it-works' },
      { label: 'باقات الأسعار', href: '/pricing' },
      { label: 'الشراكات والاستثمار', href: '/partnerships' },
      { label: 'الأسئلة الشائعة', href: '/#faq' },
    ],
    cta: 'ابدأ التجربة المجانية',
    login: 'تسجيل الدخول',
    demo: 'تجربة حية',
  },
}

export function LandingNavbar({ lang, onToggleLang }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const t = content[lang]
  const isRtl = lang === 'ar'

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
      dir={isRtl ? 'rtl' : 'ltr'}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <ClassioLogo size="md" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7">
            {t.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-600 hover:text-[#7047EB] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language toggle button */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
              title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-[#7047EB]" />
              <span>{lang === 'en' ? 'عربي' : 'English'}</span>
            </button>

            {/* Login Link */}
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-[#7047EB] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {t.login}
            </Link>

            {/* Start Free CTA */}
            <Link
              href="/login?mode=signup"
              className="flex items-center gap-2 text-xs font-bold bg-[#7047EB] text-white px-4 py-2.5 rounded-xl hover:bg-[#5D35D5] shadow-sm hover:shadow transition-all"
            >
              <span>{t.cta}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleLang}
              className="text-xs font-bold text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200"
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-5 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          {t.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-bold text-slate-700 hover:text-[#7047EB] py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-sm font-bold text-slate-700 py-2.5 border border-slate-200 rounded-xl"
            >
              {t.login}
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center text-sm font-bold bg-[#7047EB] text-white py-2.5 rounded-xl shadow-xs"
            >
              {t.cta}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
