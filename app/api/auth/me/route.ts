import { NextRequest, NextResponse } from 'next/server';

// GET /api/auth/me - Verificar usuário autenticado
export async function GET(_request: NextRequest) {
  try {
    // Por enquanto, vamos simular a verificação de autenticação
    // Depois que você implementar autenticação do Supabase, isso funcionará completamente
    
    // Simular usuário logado
    const mockUser = {
      id: 'temp-user-id',
      name: 'Usuário Teste',
      email: 'admin@teste.com',
      role: 'owner',
      salonId: 'temp-salon-id'
    };

    return NextResponse.json({
      user: mockUser,
      message: 'Autenticação simulada. Configure autenticação do Supabase para funcionalidade completa.'
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
