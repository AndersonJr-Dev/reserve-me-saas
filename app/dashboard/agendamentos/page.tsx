'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import { db, Appointment } from '@/lib/supabase/client';

export default function AgendamentosPage() {
  const [loading, setLoading] = useState(true);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [today, setToday] = useState(new Date());
  const [monthApps, setMonthApps] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' });
        const body = await me.json();
        const sid = body?.user?.salonId || null;
        setSalonId(sid);
        if (!sid) return;

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startOfMonth.setHours(0,0,0,0);
        endOfMonth.setHours(23,59,59,999);
        const apps = await db.getAppointmentsRange(sid, startOfMonth.toISOString(), endOfMonth.toISOString());
        setMonthApps(apps);
      } finally {
        setLoading(false);
      }
    })();
  }, [today]);

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
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Calendário</h2>
              <div className="flex gap-2">
                <button onClick={() => setToday(new Date(today.getFullYear(), today.getMonth() - 1, 1))} className="px-3 py-1 rounded border">←</button>
                <button onClick={() => setToday(new Date(today.getFullYear(), today.getMonth() + 1, 1))} className="px-3 py-1 rounded border">→</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const apps = byDay.get(day) || [];
                const isToday = day === new Date().getDate() && today.getMonth() === new Date().getMonth() && today.getFullYear() === new Date().getFullYear();
                return (
                  <button key={day} onClick={() => setSelectedDate(new Date(today.getFullYear(), today.getMonth(), day))} className={`text-sm rounded-lg border p-2 text-left ${isToday ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-300'} ${apps.length > 0 ? 'relative' : ''}`}>
                    <div className="font-semibold">{day}</div>
                    {apps.length > 0 && (
                      <div className="text-xs text-gray-600">{apps.length} agendamento(s)</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">Agendamentos do dia</h2>
            {loading ? (
              <p>Carregando...</p>
            ) : selectedApps.length === 0 ? (
              <p>Nenhum agendamento para o dia selecionado.</p>
            ) : (
              <div className="space-y-3">
                {selectedApps.map(app => (
                  <div key={app.id} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{app.customer_name}</div>
                      <div className="text-sm text-gray-600">{new Date(app.appointment_date).toLocaleString()}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded border">{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
