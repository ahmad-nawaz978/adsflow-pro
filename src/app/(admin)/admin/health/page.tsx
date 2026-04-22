/**
 * @file app/(admin)/admin/health/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description System health monitoring page. Runs a live DB heartbeat check,
 *   shows recent system_health_logs entries, cron job status, and response
 *   times. Auto-refreshes every 30 seconds.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import api from '@/lib/axios'
import { formatDateTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/api/health/db')
      return res.data
    },
    refetchInterval: 30_000,
  })
}

function useRecentLogs() {
  return useQuery({
    queryKey: ['health-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_health_logs')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(20)
      return data ?? []
    },
    refetchInterval: 30_000,
  })
}

export default function SystemHealthPage() {
  const { data: health, isLoading: healthLoading, refetch } = useHealthCheck()
  const { data: logs, isLoading: logsLoading } = useRecentLogs()

  const statusIcon = {
    ok: <CheckCircle className="w-5 h-5 text-green-500" />,
    slow: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
  }

  const statusColor = {
    ok: 'text-green-600 bg-green-50 border-green-200',
    slow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
  }

  return (
    <DashboardLayout title="System Health">
      <div className="space-y-6 animate-fade-in">
        {/* Live DB check */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-brand-600" />
              <h2 className="font-semibold text-gray-900">Database Heartbeat</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
          </div>

          {healthLoading ? (
            <div className="text-sm text-gray-400">Checking...</div>
          ) : health ? (
            <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${statusColor[health.status as keyof typeof statusColor] ?? statusColor.ok}`}>
              {statusIcon[health.status as keyof typeof statusIcon]}
              <div>
                <p className="font-semibold capitalize">{health.status}</p>
                <p className="text-xs">{health.response_ms}ms response · Checked at {formatDateTime(health.checked_at)}</p>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Cron job status */}
        <Card>
          <CardHeader><CardTitle>Scheduled Jobs</CardTitle></CardHeader>
          <div className="space-y-3">
            {[
              { job: 'cron:publish-scheduled', schedule: 'Every hour', desc: 'Publishes scheduled ads when publish_at is reached' },
              { job: 'cron:expire-ads', schedule: 'Daily at 02:00 UTC', desc: 'Expires published ads past their expire_at date' },
            ].map((cron) => {
              const lastLog = logs?.find((l: any) => l.source === cron.job)
              return (
                <div key={cron.job} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-800">{cron.job}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cron.desc} · {cron.schedule}</p>
                    {lastLog && (
                      <p className="text-xs text-gray-400 mt-1">Last run: {formatDateTime(lastLog.checked_at)} · {lastLog.response_ms}ms</p>
                    )}
                  </div>
                  {lastLog ? (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColor[lastLog.status as keyof typeof statusColor]}`}>
                      {lastLog.status}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">No runs recorded</span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent health logs */}
        <Card>
          <CardHeader><CardTitle>Recent Health Logs</CardTitle></CardHeader>
          {logsLoading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-2 font-medium text-gray-500">Source</th>
                    <th className="pb-2 font-medium text-gray-500">Status</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Response</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs?.map((log: any) => (
                    <tr key={log.id}>
                      <td className="py-2.5 font-mono text-xs text-gray-700">{log.source}</td>
                      <td className="py-2.5">
                        <span className={`badge ${log.status === 'ok' ? 'bg-green-100 text-green-700' : log.status === 'slow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-600">{log.response_ms}ms</td>
                      <td className="py-2.5 text-right text-gray-400 text-xs">{formatDateTime(log.checked_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
