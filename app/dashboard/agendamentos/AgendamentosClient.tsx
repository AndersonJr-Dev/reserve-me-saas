'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';
import { db, Appointment, Professional } from '@/lib/supabase/client';

export default function AgendamentosClient() {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(new Date());
  const [monthApps, setMonthApps] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const search = useSearchParams();
  const statusFilter = (search.get('status') as Appointment['status'] | null);
  const initialScope = (search.get('scope') as 'upcoming' | 'all') || 'upcoming';
  const [scope, setScope] = useState<'upcoming' | 'all'>(initialScope);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [paged, setPaged] = useState<{ items: Appointment[]; total: number }>({ items: [], total: 0 });
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<Appointment['status']>(statusFilter || 'confirmed');
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' });
        const body = await me.json();
        const sid = body?.user?.salonId || null;
        if (!sid) return;

        if (statusFilter) {
          const res = await db.getAppointmentsByStatusPaginated(sid, selectedStatus, page, pageSize, scope);
          setPaged(res);
          const pros = await db.getProfessionalsBySalonId(sid);
          setProfessionals(pros || []);
        } else {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          startOfMonth.setHours(0,0,0,0);
          endOfMonth.setHours(23,59,59,999);
          const apps = await db.getAppointmentsRange(sid, startOfMonth.toISOString(), endOfMonth.toISOString());
          setMonthApps(apps);
          const pros = await db.getProfessionalsBySalonId(sid);
          setProfessionals(pros || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [today, selectedStatus, page, scope, statusFilter]);

  const daysInMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(), [today]);
  const byDay = useMemo(() => {
    const map = new Map<number, Appointment[]>();
    monthApps.forEach(a => {
      const d = new Date(a.appointment_date).getDate();
      const arr = map.get(d) || [];
      arr.push(a);
      map.set(d, arr);
    });
    return map;
  }, [monthApps]);
  const colorForId = (id?: string) => {
    if (!id) return 'bg-gray-300';
    const codes = ['bg-orange-500','bg-indigo-500','bg-green-500','bg-blue-500','bg-pink-500','bg-purple-500','bg-teal-500'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return codes[hash % codes.length];
  };

  const selectedApps = useMemo(() => {
    const s = new Date(selectedDate);
    s.setHours(0,0,0,0);
    const e = new Date(selectedDate);
    e.setHours(23,59,59,999);
    return monthApps.filter(a => {
      const t = new Date(a.appointment_date).getTime();
      return t >= s.getTime() && t <= e.getTime();
    });
  }, [monthApps, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Agendamentos</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!search.get('status') ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Calendário</h2>
              <div className="flex gap-2">
                <button onClick={() => setToday(new Date(today.getFullYear(), today.getMonth() - 1, 1))} className="px-3 py-1 rounded border">←</button>
                <button onClick={() => setToday(new Date(today.getFullYear(), today.getMonth() + 1, 1))} className="px-3 py-1 rounded border">→</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((w) => (
                <div key={w} className="text-xs font-semibold text-gray-800 px-2">{w}</div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const apps = byDay.get(day) || [];
                const isToday = day === new Date().getDate() && today.getMonth() === new Date().getMonth() && today.getFullYear() === new Date().getFullYear();
                return (
                  <button key={day} onClick={() => setSelectedDate(new Date(today.getFullYear(), today.getMonth(), day))} className={`text-sm rounded-xl border p-3 text-left bg-white ${isToday ? 'border-orange-500 ring-2 ring-orange-200' : 'hover:border-orange-300'} ${apps.length > 0 ? 'relative' : ''}`}>
                    <div className="font-semibold text-gray-900">{day}</div>
                    {apps.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        {apps.slice(0, 6).map(a => (
                          <span key={a.id} className={`inline-block w-2 h-2 rounded-full ${colorForId(a.professional_id)}`}></span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Agendamentos do dia</h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {Array.from(new Map(selectedApps.map(a => [a.professional_id, a.professional_id])).keys()).filter(Boolean).map(pid => (
                <span key={String(pid)} className="inline-flex items-center text-xs px-2 py-1 rounded-full border bg-white text-gray-900">
                  <span className={`w-2 h-2 rounded-full mr-1 ${colorForId(String(pid))}`}></span>
                  {professionals.find(p => p.id === pid)?.name || 'Profissional'}
                </span>
              ))}
            </div>
            {loading ? (
              <p>Carregando...</p>
            ) : selectedApps.length === 0 ? (
              <p>Nenhum agendamento para o dia selecionado.</p>
            ) : (
              <div className="space-y-3">
                {selectedApps.map(app => (
                  <div key={app.id} className="border rounded-xl p-3 flex items-center justify-between bg-white">
                    <div>
                      <div className="font-semibold text-black">{app.customer_name}</div>
                      <div className="text-sm text-black">{new Date(app.appointment_date).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${app.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : app.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{app.status}</span>
                      <button
                        disabled={app.status === 'confirmed'}
                        onClick={async () => {
                          if (app.status === 'confirmed') return;
                          try {
                            const res = await fetch('/api/dashboard/appointments', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ id: app.id, status: 'confirmed' })
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) throw new Error(json?.error || 'Erro ao confirmar');
                            const updated = json.appointment as Appointment;
                            setMonthApps(prev => prev.map(x => x.id === app.id ? { ...x, status: updated.status } : x));
                          } catch (err) {
                            alert(err instanceof Error ? err.message : String(err));
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full ${app.status === 'confirmed' ? 'bg-green-600 text-white cursor-default' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                      >
                        {app.status === 'confirmed' ? 'Confirmado' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Agendamentos</h2>
                <div className="flex items-center bg-white border border-gray-300 rounded-full p-1">
                  {(['pending','confirmed','completed','cancelled','no_show'] as Appointment['status'][]).map(st => (
                    <button
                      key={st}
                      onClick={() => { setSelectedStatus(st); setPage(0); router.replace(`/dashboard/agendamentos?status=${st}&scope=${scope}`); }}
                      className={`text-xs px-3 py-1 rounded-full ${selectedStatus === st ? 'bg-orange-500 text-white' : 'text-gray-900 hover:bg-gray-100'}`}
                    >
                      {st === 'pending' ? 'Pendentes' : st === 'confirmed' ? 'Confirmados' : st === 'completed' ? 'Concluídos' : st === 'cancelled' ? 'Cancelados' : 'No-show'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setScope('upcoming'); setPage(0); }} className={`text-xs px-3 py-1 rounded-full ${scope === 'upcoming' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>Próximos</button>
                <button onClick={() => { setScope('all'); setPage(0); }} className={`text-xs px-3 py-1 rounded-full ${scope === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>Todos</button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {Array.from(new Map(paged.items.map(a => [a.professional_id, a.professional_id])).keys()).filter(Boolean).map(pid => (
                <span key={String(pid)} className="inline-flex items-center text-xs px-2 py-1 rounded-full border bg-white text-gray-900">
                  <span className={`w-2 h-2 rounded-full mr-1 ${colorForId(String(pid))}`}></span>
                  {professionals.find(p => p.id === pid)?.name || 'Profissional'}
                </span>
              ))}
            </div>
            {loading ? (
              <p>Carregando...</p>
            ) : paged.items.length === 0 ? (
              <p>Sem agendamentos.</p>
            ) : (
              <div className="space-y-3">
                {paged.items.map(app => (
                  <div key={app.id} className="border rounded-xl p-3 flex items-center justify-between bg-white">
                    <div>
                      <div className="font-semibold text-black">{app.customer_name}</div>
                      <div className="text-sm text-black">{new Date(app.appointment_date).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${app.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : app.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{app.status}</span>
                      <button
                        disabled={app.status === 'confirmed'}
                        onClick={async () => {
                          if (app.status === 'confirmed') return;
                          try {
                            const res = await fetch('/api/dashboard/appointments', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ id: app.id, status: 'confirmed' })
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) throw new Error(json?.error || 'Erro ao confirmar');
                            const updated = json.appointment as Appointment;
                            setPaged(prev => ({ items: prev.items.map(x => x.id === app.id ? { ...x, status: updated.status } : x), total: prev.total }));
                          } catch (err) {
                            alert(err instanceof Error ? err.message : String(err));
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full ${app.status === 'confirmed' ? 'bg-green-600 text-white cursor-default' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                      >
                        {app.status === 'confirmed' ? 'Confirmado' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <button disabled={page===0} onClick={() => setPage(p => Math.max(0, p-1))} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50">Anterior</button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(1, Math.ceil(paged.total / pageSize)) }, (_, i) => i).slice(Math.max(0, page-2), Math.max(0, page-2)+5).map(i => (
                  <button key={i} onClick={() => setPage(i)} className={`px-2 py-1 text-xs rounded-full ${i === page ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>{i+1}</button>
                ))}
              </div>
              <button disabled={(page+1) >= Math.ceil(paged.total / pageSize)} onClick={() => setPage(p => p+1)} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50">Próximo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
