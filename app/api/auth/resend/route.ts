import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }

    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
    const admin = createClient(supabaseUrl, supabaseServiceKey)
    const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${origin}/login?verify=true` })
    if (error) {
      const msg = String(error.message || '').toLowerCase()
      const isAlready = msg.includes('already been registered') || msg.includes('already registered')
      if (!supabaseAnonKey) return NextResponse.json({ error: error.message }, { status: 500 })
      const anon = createClient(supabaseUrl, supabaseAnonKey)
      const { error: resendErr } = await anon.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${origin}/login?verify=true` } })
      if (resendErr) return NextResponse.json({ error: resendErr.message }, { status: 500 })
      return NextResponse.json({ success: true, method: isAlready ? 'resend' : 'resend_fallback' })
    }

    return NextResponse.json({ success: true, method: 'invite' })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
