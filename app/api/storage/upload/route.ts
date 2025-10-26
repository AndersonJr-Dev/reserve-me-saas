import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/storage/upload - Recebe um arquivo via form-data e faz upload usando service role
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase admin credentials missing');
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const path = form.get('path') as string | null;

    if (!file || !path) {
      return NextResponse.json({ error: 'Arquivo e path são obrigatórios' }, { status: 400 });
    }

    // Ler conteúdo do arquivo como ArrayBuffer e converter para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fazer upload para o bucket 'avatars'
    const { error: uploadError } = await supabaseAdmin.storage.from('avatars').upload(path, buffer, { upsert: false });
    if (uploadError) {
      console.error('Erro ao enviar arquivo para Storage:', uploadError);
      return NextResponse.json({ error: 'Erro ao enviar arquivo' }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(path);
    const publicUrl = data?.publicUrl || null;

    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error('Erro no endpoint de upload:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
