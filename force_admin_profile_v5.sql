-- ==============================================================================
-- DEBUG V5: FORÇAR CRIAÇÃO/ATUALIZAÇÃO DO PERFIL ADMIN
-- ==============================================================================
-- 1. Identificar o ID do usuário pelo email (Isso roda dentro do banco)
DO $$
DECLARE target_user_id uuid;
BEGIN
SELECT id INTO target_user_id
FROM auth.users
WHERE email = 'maicontinelli@gmail.com';
IF target_user_id IS NULL THEN RAISE EXCEPTION 'Usuário maicontinelli@gmail.com não encontrado na tabela auth.users. Verifique se o cadastro foi feito.';
END IF;
-- 2. Tentar inserir ou atualizar na tabela profiles
INSERT INTO public.profiles (
        id,
        email,
        full_name,
        company_name,
        phone,
        city,
        state,
        updated_at
    )
VALUES (
        target_user_id,
        'maicontinelli@gmail.com',
        'Maicon Tinelli (Admin)',
        'ObraPlana',
        '(00) 00000-0000',
        'São Paulo',
        'SP',
        now()
    ) ON CONFLICT (id) DO
UPDATE
SET full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    phone = EXCLUDED.phone,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    updated_at = now();
RAISE NOTICE 'Perfil do Admin atualizado com sucesso!';
END $$;