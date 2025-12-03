import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST() {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient(supabaseUrl, supabaseServiceKey)
    const { error: updErr } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true })
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

