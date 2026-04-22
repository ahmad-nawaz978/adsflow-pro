/**
 * @file app/(admin)/admin/categories/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Admin categories management. Lists all categories with slug
 *   and active state. Allows toggling active status and adding new categories.
 */

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase/client'
import { getApiError } from '@/lib/utils'
import type { Category } from '@/types'

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCategoriesPage() {
  const [newName, setNewName] = useState('')
  const qc = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('name')
      return (data ?? []) as Category[]
    },
  })

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('categories').insert({ name, slug: slugify(name) })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Category added!')
      setNewName('')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(getApiError(e)),
  })

  const toggleCategory = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('categories').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => toast.error(getApiError(e)),
  })

  if (isLoading) return <DashboardLayout title="Categories"><PageLoader /></DashboardLayout>

  return (
    <DashboardLayout title="Manage Categories">
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        {/* Add new */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Add New Category</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Category name e.g. Electronics"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && addCategory.mutate(newName.trim())}
              leftIcon={<Tag className="w-4 h-4" />}
              className="flex-1"
            />
            <Button
              onClick={() => newName.trim() && addCategory.mutate(newName.trim())}
              loading={addCategory.isPending}
              disabled={!newName.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>
        </Card>

        {/* List */}
        <Card padding="none">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Slug</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleCategory.mutate({ id: cat.id, is_active: !cat.is_active })}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${cat.is_active ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {cat.is_active
                        ? <ToggleRight className="w-5 h-5" />
                        : <ToggleLeft className="w-5 h-5" />}
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  )
}

