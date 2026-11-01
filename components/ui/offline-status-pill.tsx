'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { offlineSyncManager } from '@/lib/offline-sync'

interface OfflineStatusPillProps {
  lang: 'ar' | 'en'
  onSynced?: (count: number) => void
}

export function OfflineStatusPill({ lang, onSynced }: OfflineStatusPillProps) {
  const [online, setOnline] = useState(true)
  const [queuedCount, setQueuedCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    // Initial PWA registration
    offlineSyncManager.registerServiceWorker()

    const updateStatus = () => {
      const isOnline = navigator.onLine
      setOnline(isOnline)
      const count = offlineSyncManager.getQueuedCount()
      setQueuedCount(count)

      // Auto-sync when reconnecting online
      if (isOnline && count > 0) {
        handleSync()
      }
    }

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    const interval = setInterval(() => {
      setQueuedCount(offlineSyncManager.getQueuedCount())
    }, 5000)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    const res = await offlineSyncManager.syncPendingActions()
    setQueuedCount(offlineSyncManager.getQueuedCount())
    setSyncing(false)
    if (res.syncedCount > 0 && onSynced) {
      onSynced(res.syncedCount)
    }
  }

  if (online && queuedCount === 0) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Wifi className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden md:inline">{lang === 'ar' ? 'متصل بالشبكة' : 'Online'}</span>
      </div>
    )
  }

  if (!online) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-[11px] font-black border border-amber-600 shadow-sm animate-pulse">
        <WifiOff className="w-3.5 h-3.5" />
        <span>
          {lang === 'ar'
            ? `وضع بدون إنترنت (${queuedCount} محفوظ)`
            : `Offline (${queuedCount} saved)`}
        </span>
      </div>
    )
  }

  // Online with unsynced queue
  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow transition"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
      <span>
        {syncing
          ? lang === 'ar'
            ? 'جاري المزامنة...'
            : 'Syncing...'
          : lang === 'ar'
          ? `مزامنة المعاملات (${queuedCount})`
          : `Sync ${queuedCount} Items`}
      </span>
    </button>
  )
}
