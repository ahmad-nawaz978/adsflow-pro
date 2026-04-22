/**
 * @file app/(client)/dashboard/notifications/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Notifications page for the client dashboard. Lists all in-app
 *   notifications (info, success, warning, error) with read/unread state.
 *   Allows marking all as read. Fetches from Supabase directly via browser client.
 */

'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'
import type { Notification } from '@/types'

const typeConfig = {
  info:    { icon: Info,          color: 'text-blue-500',   bg: 'bg-blue-50' },
  success: { icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  error:   { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50' },
}

function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      return (data ?? []) as Notification[]
    },
    enabled: !!userId,
  })
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const setUnreadNotifications = useUiStore((s) => s.setUnreadNotifications)
  const qc = useQueryClient()
  const { data: notifications, isLoading } = useNotifications(user?.id ?? '')

  // Update unread count in store
  useEffect(() => {
    const unread = notifications?.filter((n) => !n.is_read).length ?? 0
    setUnreadNotifications(unread)
  }, [notifications, setUnreadNotifications])

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
      setUnreadNotifications(0)
    },
  })

  if (isLoading) return <DashboardLayout title="Notifications"><PageLoader /></DashboardLayout>

  const unread = notifications?.filter((n) => !n.is_read).length ?? 0

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {unread > 0 ? <span className="text-brand-600 font-medium">{unread} unread</span> : 'All caught up'}
            {' '}· {notifications?.length ?? 0} total
          </p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>

        {!notifications?.length ? (
          <Card className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">No notifications yet</h3>
            <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens with your ads.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? typeConfig.info
              const IconComp = cfg.icon
              return (
                <div
                  key={n.id}
                  className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                    n.is_read
                      ? 'bg-white border-gray-200'
                      : 'bg-brand-50 border-brand-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <IconComp className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                      {n.link && (
                        <Link href={n.link} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

