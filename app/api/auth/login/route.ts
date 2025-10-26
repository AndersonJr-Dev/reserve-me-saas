import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/login - Fazer login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Por enquanto, vamos simular o login
    // Depois que você implementar autenticação do Supabase, isso funcionará completamente
    if (email === 'admin@teste.com' && password === '123456') {
      const mockUser = {
        id: 'temp-user-id',
        name: 'Usuário Teste',
        email: 'admin@teste.com',
        role: 'owner',
        salonId: 'temp-salon-id'
      };

      return NextResponse.json({
        success: true,
        user: mockUser,
        message: 'Login realizado com sucesso! Configure autenticação do Supabase para funcionalidade completa.'
      });
    }

    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
