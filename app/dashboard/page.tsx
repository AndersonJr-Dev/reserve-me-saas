'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Calendar, Users, CheckCircle, BarChart3, Clock, Settings, PlusCircle, ArrowRight, LogOut, Phone } from 'lucide-react';

// CORREÇÃO DE IMPORTAÇÃO (ESTRUTURA: app/dashboard -> src/lib):
// ../.. volta para a raiz do projeto
// /src entra na pasta src
import { db, Appointment, Service, Professional } from '@/lib/supabase/client'; 

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    confirmedCount: 0,
    professionalsCount: 0,
    revenueDay: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    revenueWeekCount: 0,
    revenueMonthCount: 0,
    prevWeekRevenue: 0,
    prevMonthRevenue: 0
  });
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [salonSlug, setSalonSlug] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [waTemplate, setWaTemplate] = useState<string | null>(null);
  const [topServices, setTopServices] = useState<{ name: string; amount: number }[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<{ name: string; amount: number }[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const v = window.localStorage.getItem('monthly_goal');
    return v ? Number(v) : 0;
  });
  const [segPeriod, setSegPeriod] = useState<'7' | '30' | 'month'>(() => {
    if (typeof window === 'undefined') return 'month';
    return (window.localStorage.getItem('seg_period') as '7' | '30' | 'month') || 'month';
  });
  const [serviceGoals, setServiceGoals] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(window.localStorage.getItem('service_goals') || '{}'); } catch { return {}; }
  });
  const [professionalGoals, setProfessionalGoals] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(window.localStorage.getItem('professional_goals') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    const refetchBreakdown = async () => {
      if (!salonId) return;
      if (!(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active')) return;
      let breakdown;
      if (segPeriod === 'month') {
        breakdown = await db.getRevenueBreakdownMonthly(salonId);
      } else {
        const now = new Date();
        const endISO = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
        const start = new Date(now);
        start.setDate(start.getDate() - (segPeriod === '7' ? 6 : 29));
        start.setHours(0,0,0,0);
        breakdown = await db.getRevenueBreakdownRange(salonId, start.toISOString(), endISO);
      }
      setTopServices((breakdown?.services || []).slice(0, 5));
      setTopProfessionals((breakdown?.professionals || []).slice(0, 5));
    };
    refetchBreakdown();
  }, [segPeriod, planType, subscriptionStatus, salonId]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        // Buscar dados seguros via API (garante cookie e slug)
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!meRes.ok) {
          setLoading(false);
          return;
        }
        const meJson = await meRes.json();
        const finalSalonId: string | null = meJson?.user?.salonId ?? null;
        const finalSalonSlug: string | null = meJson?.user?.salonSlug ?? null;
        const finalPlanType: string | null = meJson?.user?.planType ?? null;
        const finalSubscriptionStatus: string | null = meJson?.user?.subscriptionStatus ?? null;
        const finalUserName: string | null = meJson?.user?.name ?? null;

        if (!finalSalonId) {
          console.error('ERRO: Salão não encontrado para este usuário.');
          setLoading(false);
          return;
        }

        setSalonId(finalSalonId);
        setSalonSlug(finalSalonSlug);
        setPlanType(finalPlanType);
        setSubscriptionStatus(finalSubscriptionStatus);
        setUserName(finalUserName);
        try {
          const res = await fetch('/api/dashboard/settings', { credentials: 'include' });
          const json = await res.json();
          if (res.ok && json?.salon?.whatsapp_template) {
            setWaTemplate(json.salon.whatsapp_template);
          }
        } catch {}

        // 3. Busca dados do banco em paralelo
        const [dashboardData, prosData, servicesData, revenue] = await Promise.all([
          db.getDashboardData(finalSalonId),
          db.getProfessionalsBySalonId(finalSalonId),
          db.getServicesBySalonId(finalSalonId),
          db.getRevenueStats(finalSalonId)
        ]);

        if (dashboardData) {
          setStats({
            todayCount: dashboardData.stats.todayCount || 0,
            confirmedCount: dashboardData.stats.confirmedCount || 0,
            professionalsCount: prosData ? prosData.length : 0,
            revenueDay: revenue?.day || 0,
            revenueWeek: revenue?.week || 0,
            revenueMonth: revenue?.month || 0,
            revenueWeekCount: revenue?.weekCount || 0,
            revenueMonthCount: revenue?.monthCount || 0,
            prevWeekRevenue: revenue?.prevWeek || 0,
            prevMonthRevenue: revenue?.prevMonth || 0
          });
          setUpcoming(dashboardData.upcoming || []);
          setProfessionals(prosData || []);
          setServices(servicesData || []);
        }

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [supabase]);

  // Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Carregando Reserve.me...</p>
        </div>

        {(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ticket Médio Semana</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.revenueWeekCount > 0 ? `R$ ${(stats.revenueWeek / stats.revenueWeekCount).toFixed(2)}` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.revenueWeekCount > 0 ? `${stats.revenueWeekCount} atendimentos` : 'Sem dados'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ticket Médio Mês</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.revenueMonthCount > 0 ? `R$ ${(stats.revenueMonth / stats.revenueMonthCount).toFixed(2)}` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.revenueMonthCount > 0 ? `${stats.revenueMonthCount} atendimentos` : 'Sem dados'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Variação Semanal</span>
              </div>
              <h3 className={`text-2xl font-bold ${stats.prevWeekRevenue > 0 && (stats.revenueWeek - stats.prevWeekRevenue) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{stats.prevWeekRevenue > 0 ? `${(((stats.revenueWeek - stats.prevWeekRevenue) / stats.prevWeekRevenue) * 100).toFixed(1)}%` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.prevWeekRevenue > 0 ? 'vs semana anterior' : 'Sem base anterior'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Variação Mensal</span>
              </div>
              <h3 className={`text-2xl font-bold ${stats.prevMonthRevenue > 0 && (stats.revenueMonth - stats.prevMonthRevenue) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{stats.prevMonthRevenue > 0 ? `${(((stats.revenueMonth - stats.prevMonthRevenue) / stats.prevMonthRevenue) * 100).toFixed(1)}%` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.prevMonthRevenue > 0 ? 'vs mês anterior' : 'Sem base anterior'}</p>
            </div>
          </div>
        )}

        {(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Top 5 Serviços</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Período</label>
                  <select
                    value={segPeriod}
                    onChange={async (e) => {
                      const val = e.target.value as '7'|'30'|'month';
                      setSegPeriod(val);
                      if (typeof window !== 'undefined') window.localStorage.setItem('seg_period', val);
                      // Recarregar breakdown
                      const now = new Date();
                      const endISO = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
                      let breakdown;
                      if (val === 'month') {
                        breakdown = await db.getRevenueBreakdownMonthly(salonId!);
                      } else {
                        const start = new Date(now);
                        start.setDate(start.getDate() - (val === '7' ? 6 : 29));
                        start.setHours(0,0,0,0);
                        breakdown = await db.getRevenueBreakdownRange(salonId!, start.toISOString(), endISO);
                      }
                      setTopServices((breakdown?.services || []).slice(0, 5));
                      setTopProfessionals((breakdown?.professionals || []).slice(0, 5));
                    }}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="7">7 dias</option>
                    <option value="30">30 dias</option>
                    <option value="month">Mês atual</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {topServices.length === 0 ? (
                  <p className="text-sm text-gray-500">Sem dados</p>
                ) : (
                  topServices.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-gray-800 flex-1">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-600">R$ {s.amount.toFixed(2)}</span>
                        <input
                          type="number"
                          value={serviceGoals[s.name] || ''}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            const next = { ...serviceGoals, [s.name]: v };
                            setServiceGoals(next);
                            if (typeof window !== 'undefined') window.localStorage.setItem('service_goals', JSON.stringify(next));
                          }}
                          placeholder="Meta R$"
                          className="w-28 border rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${serviceGoals[s.name] ? Math.min(100, (s.amount / serviceGoals[s.name]) * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ranking de Profissionais</h2>
              <div className="space-y-3">
                {topProfessionals.length === 0 ? (
                  <p className="text-sm text-gray-500">Sem dados</p>
                ) : (
                  topProfessionals.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-gray-800 flex-1">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-600">R$ {p.amount.toFixed(2)}</span>
                        <input
                          type="number"
                          value={professionalGoals[p.name] || ''}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            const next = { ...professionalGoals, [p.name]: v };
                            setProfessionalGoals(next);
                            if (typeof window !== 'undefined') window.localStorage.setItem('professional_goals', JSON.stringify(next));
                          }}
                          placeholder="Meta R$"
                          className="w-28 border rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${professionalGoals[p.name] ? Math.min(100, (p.amount / professionalGoals[p.name]) * 100) : 0}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Meta Mensal</h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={monthlyGoal || ''}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMonthlyGoal(v);
                    if (typeof window !== 'undefined') window.localStorage.setItem('monthly_goal', String(v));
                  }}
                  placeholder="R$"
                  className="w-40 border rounded-md px-3 py-2"
                />
                <span className="text-sm text-gray-600">Defina sua meta</span>
              </div>
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-orange-500 rounded-full"
                    style={{ width: `${monthlyGoal > 0 ? Math.min(100, (stats.revenueMonth / monthlyGoal) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Progresso: {monthlyGoal > 0 ? `${Math.min(100, ((stats.revenueMonth / monthlyGoal) * 100)).toFixed(1)}%` : '—'}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Projeção Mensal</h2>
              <p className="text-sm text-gray-600">Estimativa baseada na receita até hoje</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{
                (() => {
                  const now = new Date();
                  const elapsed = now.getDate();
                  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const base = stats.revenueMonth > 0 ? stats.revenueMonth : (stats.revenueWeek > 0 ? (stats.revenueWeek / 7) * elapsed : 0);
                  const proj = base > 0 ? (base / elapsed) * totalDays : 0;
                  return proj > 0 ? `R$ ${proj.toFixed(2)}` : '—';
                })()
              }</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Exportação</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const now = new Date();
                    const name = `financeiro_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
                    const rows = [
                      ['Total Mês', String(stats.revenueMonth.toFixed(2))],
                      ...topServices.map(s => [`Serviço: ${s.name}`, String(s.amount.toFixed(2))]),
                      ...topProfessionals.map(p => [`Profissional: ${p.name}`, String(p.amount.toFixed(2))])
                    ];
                    const csv = rows.map(r => r.join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = name;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={() => {
                    const w = window.open('', 'print');
                    if (!w) return;
                    const tableRowsServices = topServices.map(s => `<tr><td>${s.name}</td><td style="text-align:right">R$ ${s.amount.toFixed(2)}</td></tr>`).join('');
                    const tableRowsPros = topProfessionals.map(p => `<tr><td>${p.name}</td><td style="text-align:right">R$ ${p.amount.toFixed(2)}</td></tr>`).join('');
                    w.document.write(`
                      <html>
                        <head>
                          <title>Resumo Financeiro</title>
                          <style>
                            body { font-family: Arial, sans-serif; padding: 24px; }
                            h1 { color: #111; margin: 0 0 8px; }
                            h2 { color: #333; margin: 16px 0 8px; }
                            .brand { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
                            .badge { background:#f97316; color:#fff; padding:4px 8px; border-radius:999px; font-size:12px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                            th, td { border-bottom: 1px solid #eee; padding: 8px; }
                            th { text-align: left; background:#fafafa; }
                            .total { font-weight:bold; }
                          </style>
                        </head>
                        <body>
                          <div class="brand">
                            <div class="badge">Reserve.me</div>
                            <div>Resumo Financeiro</div>
                          </div>
                          <h1>Total do mês: R$ ${stats.revenueMonth.toFixed(2)}</h1>
                          <h2>Top Serviços</h2>
                          <table>
                            <thead><tr><th>Serviço</th><th style="text-align:right">Receita</th></tr></thead>
                            <tbody>${tableRowsServices}</tbody>
                          </table>
                          <h2>Ranking de Profissionais</h2>
                          <table>
                            <thead><tr><th>Profissional</th><th style="text-align:right">Receita</th></tr></thead>
                            <tbody>${tableRowsPros}</tbody>
                          </table>
                        </body>
                      </html>
                    `);
                    w.document.close();
                    w.focus();
                    w.print();
                    w.close();
                  }}
                  className="px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-black"
                >
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>
        )}
        {(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ticket Médio Semana</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.revenueWeekCount > 0 ? `R$ ${(stats.revenueWeek / stats.revenueWeekCount).toFixed(2)}` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.revenueWeekCount > 0 ? `${stats.revenueWeekCount} atendimentos` : 'Sem dados'}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ticket Médio Mês</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.revenueMonthCount > 0 ? `R$ ${(stats.revenueMonth / stats.revenueMonthCount).toFixed(2)}` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.revenueMonthCount > 0 ? `${stats.revenueMonthCount} atendimentos` : 'Sem dados'}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Variação Semanal</span>
              </div>
              <h3 className={`text-2xl font-bold ${stats.prevWeekRevenue > 0 && (stats.revenueWeek - stats.prevWeekRevenue) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{stats.prevWeekRevenue > 0 ? `${(((stats.revenueWeek - stats.prevWeekRevenue) / stats.prevWeekRevenue) * 100).toFixed(1)}%` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.prevWeekRevenue > 0 ? 'vs semana anterior' : 'Sem base anterior'}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-50 p-2 rounded-md">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Variação Mensal</span>
              </div>
              <h3 className={`text-2xl font-bold ${stats.prevMonthRevenue > 0 && (stats.revenueMonth - stats.prevMonthRevenue) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{stats.prevMonthRevenue > 0 ? `${(((stats.revenueMonth - stats.prevMonthRevenue) / stats.prevMonthRevenue) * 100).toFixed(1)}%` : '—'}</h3>
              <p className="text-sm text-gray-600 mt-1">{stats.prevMonthRevenue > 0 ? 'vs mês anterior' : 'Sem base anterior'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Bem-vindo{userName ? ',' : ''}</div>
                <div className="text-xl font-bold text-gray-900">{userName || 'Cliente'}</div>
              </div>
              <span className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                Cliente Plano {planType ? planType : 'free'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } finally {
                    window.location.href = '/login';
                  }
                }}
                className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hoje</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.todayCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Agendamentos</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.confirmedCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Confirmados</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Equipe</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.professionalsCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Profissionais ativos</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita Hoje</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? `R$ ${stats.revenueDay.toFixed(2)}` : '—'}</h3>
            <p className="text-sm text-gray-600 mt-1">{(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? 'Confirmados' : 'Disponível nos planos Avançado e Premium'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita Semana</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? `R$ ${stats.revenueWeek.toFixed(2)}` : '—'}</h3>
            <p className="text-sm text-gray-600 mt-1">{(['basic','advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? 'Confirmados' : 'Disponível nos planos pagos'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receita Mês</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? `R$ ${stats.revenueMonth.toFixed(2)}` : '—'}</h3>
            <p className="text-sm text-gray-600 mt-1">{(['advanced','premium'].includes((planType || '').toLowerCase()) && subscriptionStatus === 'active') ? 'Confirmados' : 'Disponível nos planos Avançado e Premium'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <Link href="/dashboard/servicos" className="w-full flex items-center p-4 rounded-xl border hover:border-orange-300 transition-colors text-gray-800">
                  <span className="mr-3 bg-orange-50 text-orange-600 p-2 rounded-md">
                    <PlusCircle className="w-5 h-5" />
                  </span>
                  Adicionar Serviço
                </Link>
                <Link href="/dashboard/profissionais" className="w-full flex items-center p-4 rounded-xl border hover:border-orange-300 transition-colors text-gray-800">
                  <span className="mr-3 bg-orange-50 text-orange-600 p-2 rounded-md">
                    <Users className="w-5 h-5" />
                  </span>
                  Adicionar Profissional
                </Link>
                <Link href="/dashboard/configuracoes" className="w-full flex items-center p-4 rounded-xl border hover:border-orange-300 transition-colors text-gray-800">
                  <span className="mr-3 bg-orange-50 text-orange-600 p-2 rounded-md">
                    <Settings className="w-5 h-5" />
                  </span>
                  Abrir Configurações
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Upgrade de Plano</h2>
              <Link href="/planos" className="w-full inline-flex items-center justify-center bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                Ver Planos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Lista de Próximos Agendamentos */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Próximos Agendamentos</h2>
              <span className="text-sm text-gray-500">Atualiza automaticamente</span>
            </div>
          
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Nenhum agendamento futuro</p>
                <p className="text-sm opacity-60">Sua agenda está livre por enquanto.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((app) => {
                  const date = new Date(app.appointment_date);
                  const service = services.find(s => s.id === app.service_id);
                  const professional = professionals.find(p => p.id === app.professional_id);
                  const toE164 = (raw: string | null | undefined) => {
                    const digits = String(raw || '').replace(/\D/g, '');
                    if (!digits) return '';
                    return digits.startsWith('55') ? digits : `55${digits}`;
                  };
                  const message = waTemplate
                    ? waTemplate
                        .replace('{data}', date.toLocaleDateString('pt-BR'))
                        .replace('{hora}', date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
                        .replace('{servico}', service ? service.name : '')
                    : `Olá, estou passando para confirmar seu agendamento para ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${service ? ` de ${service.name}` : ''}. Posso confirmar sua presença?`;
                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl border transition-all">
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-50 text-orange-700 font-bold p-3 rounded-xl text-center min-w-[60px] border">
                          <div className="text-xs uppercase tracking-wide">{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
                          <div className="text-xl leading-none mt-1">{date.getDate()}</div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{app.customer_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-600 flex items-center bg-gray-100 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 mr-1" />
                              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {professional && (
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {professional.name}
                                </span>
                              )}
                              {service && (
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {service.name}
                                </span>
                              )}
                              {service && (
                                <span className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                                  R$ {Number(service.price).toFixed(2)}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center justify-end gap-2">
                        {app.customer_phone && (
                          <a
                            href={`https://api.whatsapp.com/send?phone=${toE164(app.customer_phone)}&text=${encodeURIComponent(message)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                          </a>
                        )}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : app.status === 'completed' ? 'bg-blue-100 text-blue-700' : app.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${app.status === 'confirmed' ? 'bg-green-500' : app.status === 'completed' ? 'bg-blue-500' : app.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                          {app.status === 'confirmed' ? 'Confirmado' : app.status === 'completed' ? 'Concluído' : app.status === 'cancelled' ? 'Cancelado' : 'Não compareceu'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra inferior com link público de agendamento */}
      <div className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700">
            Link público para seus clientes:
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-gray-50 border text-gray-900 text-sm">
              {salonSlug ? `${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/agendar/${salonSlug}` : 'Configurar URL do salão nas Configurações'}
            </div>
            <button
              onClick={() => {
                const base = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                const url = salonSlug ? `${base}/agendar/${salonSlug}` : '';
                if (url) {
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
            >
              Copiar
            </button>
            {copied && <span className="text-sm text-green-600">Copiado!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}