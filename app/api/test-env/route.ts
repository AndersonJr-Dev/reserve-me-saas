import { NextResponse } from 'next/server';

// Rota temporária para testar variáveis de ambiente
export async function GET() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    env_configured: hasSupabaseUrl && hasAnonKey && hasServiceKey,
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: hasSupabaseUrl ? '✅ Configurada' : '❌ Faltando',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnonKey ? '✅ Configurada' : '❌ Faltando',
      SUPABASE_SERVICE_ROLE_KEY: hasServiceKey ? '✅ Configurada' : '❌ Faltando'
    }
  });
}

