-- Adicionar campo de foto para profissionais
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Comentário para documentar o campo
COMMENT ON COLUMN public.professionals.photo_url IS 'URL da foto do profissional para exibição aos clientes';
