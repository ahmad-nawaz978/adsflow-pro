/**
 * @file app/(admin)/admin/users/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Admin users management page. Lists all registered users with
 *   their role, status, and join date. Allows suspending/activating accounts
 *   and changing user roles.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import api from '@/lib/axios'
import { formatDate, getApiError, getInitials } from '@/lib/utils'
import type { User, Role } from '@/types'

const ROLE_COLORS: Record<string, string> = {
  client: 'bg-gray-100 text-gray-700',
  moderator: 'bg-yellow-100 text-yellow-700',
  admin: 'bg-blue-100 text-blue-700',
  super_admin: 'bg-purple-100 text-purple-700',
}

function useUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await import('@/lib/supabase/client').then(m => m.supabase.from('users').select('id, name, email, role, status, created_at').order('created_at', { ascending: false }))
      return (data ?? []) as User[]
    },
  })
}

export default function AdminUsersPage() {
  const { data: users, isLoading } = useUsers()
  const qc = useQueryClient()

  const updateUser = useMutation({
    mutationFn: async ({ id, ...body }: { id: string; status?: string; role?: Role }) => {
      const { error } = await (await import('@/lib/supabase/client')).supabase
        .from('users').update(body).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('User updated')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (e) => toast.error(getApiError(e)),
  })

  if (isLoading) return <DashboardLayout title="Users"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Manage Users">
      <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-gray-500">{users?.length ?? 0} total users</p>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Joined</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser.mutate({ id: u.id, role: e.target.value as Role })}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_COLORS[u.role]}`}
                      >
                        {['client', 'moderator', 'admin', 'super_admin'].map((r) => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateUser.mutate({
                          id: u.id,
                          status: u.status === 'active' ? 'suspended' : 'active',
                        })}
                        className={u.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
