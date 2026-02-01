-- Adicionar colunas de endereço na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cep text,
    ADD COLUMN IF NOT EXISTS address text;