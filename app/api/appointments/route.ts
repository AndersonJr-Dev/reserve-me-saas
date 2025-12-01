import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type CreatePayload = {
  salon_id: string
  service_id: string
  professional_id?: string
  appointment_date: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  tz_offset_minutes?: number
  salon_timezone?: string
}

const WEEKDAY_KEYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

type WorkingHours = Record<string, { isOpen?: boolean; open?: string; close?: string; closed?: boolean } | undefined>

const isTimeWithinHours = (date: Date, working: WorkingHours): boolean => {
  if (!working) return false
  const dayKey = WEEKDAY_KEYS[date.getDay()]
  const config = working[dayKey]
  const closed = typeof config?.closed === 'boolean' ? config.closed : !config?.isOpen
  if (!config || closed) return false
  const [openH, openM] = (config.open || '09:00').split(':').map(Number)
  const [closeH, closeM] = (config.close || '18:00').split(':').map(Number)
  const current = new Date(date)
  const open = new Date(date); open.setHours(openH, openM, 0, 0)
  const close = new Date(date); close.setHours(closeH, closeM, 0, 0)
  return current >= open && current < close
}

declare global {
  var __rl_store__: Map<string, { count: number; reset: number }> | undefined
}

export async function POST(request: NextRequest) {
  try {
    const ipHeader = request.headers.get('x-forwarded-for') || ''
    const ip = ipHeader.split(',')[0].trim() || 'unknown'
    const key = `appointments:${ip}`
    const now = Date.now()
    const windowMs = 60_000
    const max = 10
    const current = globalThis.__rl_store__ || (globalThis.__rl_store__ = new Map<string, { count: number; reset: number }>())
    const entry = current.get(key)
    if (!entry || now > entry.reset) {
      current.set(key, { count: 1, reset: now + windowMs })
    } else {
      if (entry.count >= max) {
        return NextResponse.json({ error: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
      }
      entry.count += 1
      current.set(key, entry)
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = (await request.json()) as Partial<CreatePayload>

    const required: Array<keyof CreatePayload> = ['salon_id','service_id','appointment_date','customer_name','customer_phone']
    for (const f of required) {
      const v = (body as Record<string, unknown>)[f]
      if (typeof v !== 'string' || !v.trim()) {
        return NextResponse.json({ error: `Campo obrigatório ausente: ${f}` }, { status: 400 })
      }
    }

    const apptDate = new Date(String(body.appointment_date))
    if (isNaN(apptDate.getTime())) {
      return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
    }
    

    const { data: salon } = await supabase
      .from('salons')
      .select('id, working_hours, timezone')
      .eq('id', body.salon_id)
      .maybeSingle()

    if (!salon) return NextResponse.json({ error: 'Salão não encontrado' }, { status: 404 })

    const salonTz = (salon as { timezone?: string }).timezone || body.salon_timezone || 'America/Sao_Paulo'
    const parseOffsetFromTimeZone = (date: Date, timeZone: string): number => {
      try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date)
        const tz = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC'
        const m = tz.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/) // GMT-3 or GMT+5:30
        if (!m) return 0
        const sign = m[1] === '-' ? 1 : -1
        const h = parseInt(m[2] || '0', 10)
        const min = parseInt(m[3] || '0', 10)
        return sign * (h * 60 + min)
      } catch {
        return 0
      }
    }
    const offsetMin = typeof body.tz_offset_minutes === 'number' ? body.tz_offset_minutes : parseOffsetFromTimeZone(apptDate, salonTz)
    const localApptDate = new Date(apptDate.getTime() - offsetMin * 60_000)

    let working = (salon as { working_hours?: WorkingHours }).working_hours as WorkingHours | undefined
    if (body.professional_id && body.professional_id !== 'any') {
      const { data: prof } = await supabase
        .from('professionals')
        .select('id, working_hours, salon_id')
        .eq('id', body.professional_id)
        .maybeSingle()
      if (!prof || prof.salon_id !== body.salon_id) {
        return NextResponse.json({ error: 'Profissional inválido' }, { status: 400 })
      }
      working = (prof as { working_hours?: WorkingHours }).working_hours || working
    }

    if (!working || !isTimeWithinHours(localApptDate, working)) {
      return NextResponse.json({ error: 'Horário fora do expediente' }, { status: 400 })
    }

    const dayStartLocal = new Date(localApptDate); dayStartLocal.setHours(0,0,0,0)
    const dayEndLocal = new Date(localApptDate); dayEndLocal.setHours(23,59,59,999)
    const dayStartUTC = new Date(dayStartLocal.getTime() + offsetMin * 60_000)
    const dayEndUTC = new Date(dayEndLocal.getTime() + offsetMin * 60_000)

    let base = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', body.salon_id)
      .gte('appointment_date', dayStartUTC.toISOString())
      .lte('appointment_date', dayEndUTC.toISOString())
      .neq('status', 'cancelled')
    if (body.professional_id && body.professional_id !== 'any') {
      base = base.eq('professional_id', body.professional_id)
    }
    const { data: existing } = await base

    const conflict = (existing || []).some(a => {
      const dUTC = new Date(a.appointment_date)
      const dLocal = new Date(dUTC.getTime() - offsetMin * 60_000)
      return dLocal.getHours() === localApptDate.getHours() && dLocal.getMinutes() === localApptDate.getMinutes()
    })
    if (conflict) {
      return NextResponse.json({ error: 'Horário indisponível' }, { status: 409 })
    }

    const { data: created, error } = await supabase
      .from('appointments')
      .insert([{
        salon_id: body.salon_id,
        service_id: body.service_id,
        professional_id: body.professional_id && body.professional_id !== 'any' ? body.professional_id : null,
        appointment_date: new Date(localApptDate.getTime() + offsetMin * 60_000).toISOString(),
        customer_name: String(body.customer_name),
        customer_phone: String(body.customer_phone),
        customer_email: body.customer_email ? String(body.customer_email) : null,
        status: 'pending'
      }])
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
    return NextResponse.json({ appointment: created })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
