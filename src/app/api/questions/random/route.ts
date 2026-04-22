/**
 * @file app/api/questions/random/route.ts
 * @author AdFlow Pro Team
 * @date 2026-03-19
 * @description GET /api/questions/random — Returns a random active learning
 *   question for the homepage widget. Also used to keep Supabase DB active.
 */

import { supabaseServer } from '@/lib/supabase/server'
import { ok, err } from '@/lib/apiHelpers'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('learning_questions')
      .select('id, question, answer, topic, difficulty')
      .eq('is_active', true)

    if (error) throw error

    const questions = data ?? []
    if (!questions.length) return ok(null)

    const random = questions[Math.floor(Math.random() * questions.length)]
    return ok(random)
  } catch (e) {
    console.error('[QUESTIONS]', e)
    return err('Failed to fetch question', 500)
  }
}
