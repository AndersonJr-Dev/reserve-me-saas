-- Adicionar campos de pagamento na tabela appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Comentários para documentar os campos
COMMENT ON COLUMN public.appointments.payment_id IS 'ID do pagamento no Mercado Pago';
COMMENT ON COLUMN public.appointments.payment_status IS 'Status do pagamento (approved, pending, rejected, cancelled)';
COMMENT ON COLUMN public.appointments.payment_amount IS 'Valor pago pelo agendamento';
COMMENT ON COLUMN public.appointments.payment_method IS 'Método de pagamento utilizado';
COMMENT ON COLUMN public.appointments.status IS 'Status do agendamento (pending, confirmed, cancelled, completed)';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_payment_id ON public.appointments(payment_id);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON public.appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
