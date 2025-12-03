import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    const admin = createClient(supabaseUrl, supabaseServiceKey)

    if (token) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
      const { data: { user }, error: authError } = await userClient.auth.getUser()
      if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      const { error: updErr } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true })
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    const body: { email?: string } = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email : null
    if (!email) return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 })

    let page = 1
    const perPage = 200
    let userId: string | null = null
    for (let i = 0; i < 10; i++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage })
      const hit = (data?.users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase())
      if (hit) { userId = hit.id; break }
      if (!data || (data.users || []).length < perPage) break
      page++
    }
    if (!userId) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, { email_confirm: true })
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
