/**
 * @file app/(public)/explore/page.tsx
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description Public explore/browse page. Allows searching by keyword,
 *   filtering by category and city, with pagination. Fetches active ads
 *   only via /api/ads. Shows AdCard grid with skeleton loader.
 */

'use client'

import { useState, useCallback } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { AdCard } from '@/components/ads/AdCard'
import { Pagination } from '@/components/ui/Pagination'
import { Spinner } from '@/components/ui/Spinner'
import { usePublicAds } from '@/hooks/useAds'
import { useCategories, useCities } from '@/hooks/usePackages'
import type { Ad } from '@/types'

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [page, setPage] = useState(1)
  const [inputVal, setInputVal] = useState('')

  const { data, isLoading } = usePublicAds({ search, category, city, page })
  const { data: categories = [] } = useCategories()
  const { data: cities = [] } = useCities()

  const handleSearch = useCallback(() => {
    setSearch(inputVal)
    setPage(1)
  }, [inputVal])

  const handleFilterChange = (type: 'category' | 'city', value: string) => {
    if (type === 'category') setCategory(value)
    else setCity(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search bar */}
      <div className="bg-white border-b border-gray-200 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ads..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select value={category} onChange={(e) => handleFilterChange('category', e.target.value)} className="h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">All Categories</option>
            {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={city} onChange={(e) => handleFilterChange('city', e.target.value)} className="h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">All Cities</option>
            {cities.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <button onClick={handleSearch} className="h-10 px-5 bg-brand-600 text-white font-medium text-sm rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${data?.total ?? 0} ads found`}
            {search && ` for "${search}"`}
          </p>
          {(category || city || search) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setCity(''); setInputVal(''); setPage(1) }}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" text="Loading ads..." /></div>
        ) : !data?.data?.length ? (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700">No ads found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((ad: Ad) => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <Pagination page={page} totalPages={data.total_pages} onPageChange={setPage} className="mt-8" />
        )}
      </div>
    </div>
  )
}
