'use client'

import { storage } from './storage'
import { AttendanceRecord, PaymentRecord } from './types'

export type OfflineActionType = 'record_attendance' | 'record_payment'

export interface QueuedOfflineAction {
  id: string
  type: OfflineActionType
  timestamp: string
  payload: any
}

const OFFLINE_QUEUE_KEY = 'classio_offline_actions_queue_v1'

export const offlineSyncManager = {
  isOnline(): boolean {
    if (typeof window === 'undefined') return true
    return navigator.onLine
  },

  getQueue(): QueuedOfflineAction[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  getQueuedCount(): number {
    return this.getQueue().length
  },

  saveQueue(queue: QueuedOfflineAction[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
    } catch (e) {
      console.error('Failed to save offline queue:', e)
    }
  },

  // Queue an action when offline
  enqueueAction(type: OfflineActionType, payload: any): QueuedOfflineAction {
    const queue = this.getQueue()
    const action: QueuedOfflineAction = {
      id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    }
    queue.push(action)
    this.saveQueue(queue)
    return action
  },

  // Replay & sync all pending actions when internet restores
  async syncPendingActions(): Promise<{ syncedCount: number; errors: number }> {
    const queue = this.getQueue()
    if (queue.length === 0) return { syncedCount: 0, errors: 0 }

    let syncedCount = 0
    let errors = 0
    const remaining: QueuedOfflineAction[] = []

    for (const item of queue) {
      try {
        if (item.type === 'record_attendance') {
          await storage.saveAttendance(item.payload as AttendanceRecord)
          syncedCount++
        } else if (item.type === 'record_payment') {
          await storage.recordPayment(item.payload as PaymentRecord)
          syncedCount++
        }
      } catch (err) {
        console.error('Failed to sync offline item:', item, err)
        errors++
        remaining.push(item)
      }
    }

    this.saveQueue(remaining)
    return { syncedCount, errors }
  },

  // Register service worker if supported
  registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Classio PWA Service Worker registered:', reg.scope)
          })
          .catch((err) => {
            console.log('Classio Service Worker registration failed:', err)
          })
      })
    }
  },
}
