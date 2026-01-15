import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Extract Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization Header' }, { status: 401 });
    }

    // 2. Create Authenticated Client
    // We inject the Authorization header directly so RLS works
    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
        auth: {
            persistSession: false,
        }
    });

    try {
        const { leadId, leadFee } = await request.json();

        // 3. Verify User (Double check valid token)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 4. Fetch Lead Data
        let leadOwnerId = null;
        let leadData = null;

        if (leadId.startsWith('mock-')) {
            leadData = {
                client_name: 'Cliente Exemplo (Desbloqueado)',
                client_phone: '(11) 99999-8888',
                client_email: 'cliente@exemplo.com'
            };
        } else {
            const { data: realLead, error: leadError } = await supabase
                .from('budgets')
                .select('user_id, client_name, client_phone, content, unlock_count')
                .eq('id', leadId)
                .maybeSingle();

            if (leadError || !realLead) {
                return NextResponse.json({ error: 'Lead não encontrado.' }, { status: 404 });
            }

            // CHECK LIMIT (Max 3)
            const currentUnlocks = realLead.unlock_count || 0;
            if (currentUnlocks >= 3) {
                return NextResponse.json({ error: 'Este lead já atingiu o limite máximo de compradores.' }, { status: 410 }); // 410 Gone
            }

            if (realLead.user_id === user.id) {
                return NextResponse.json({ error: 'Você não pode desbloquear seu próprio orçamento.' }, { status: 400 });
            }

            leadOwnerId = realLead.user_id;

            leadData = {
                client_name: realLead.client_name || 'Nome não informado',
                client_phone: realLead.client_phone || 'Telefone não informado',
                client_email: realLead.content?.clientEmail || ''
            };
        }

        // 5. Check Balance
        // Now this runs AS THE USER, respecting RLS
        const { data: profile } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single();

        console.log('--- DEBUG UNLOCK V2 ---');
        console.log('User:', user.id);
        console.log('Points:', profile?.points);

        const currentPoints = profile?.points || 0;
        const cost = Number(leadFee);

        if (currentPoints < cost) {
            return NextResponse.json({ error: 'Saldo de pontos insuficiente.' }, { status: 402 });
        }

        // 6. Transaction (Deduct)
        const { error: deductError } = await supabase.rpc('update_points', {
            target_user_id: user.id,
            amount: -cost
        });

        if (deductError) {
            console.error('RPC Error:', deductError);
            // Fallback
            await supabase.from('profiles').update({ points: currentPoints - cost }).eq('id', user.id);
        }

        // 7. INCREMENT UNLOCK COUNT (Atomic)
        await supabase.rpc('increment_unlock_count', { target_lead_id: leadId });

        // 8. Log Transaction
        await supabase.from('transactions').insert({
            user_id: user.id,
            amount: -cost,
            type: 'unlock',
            description: `Desbloqueio de Lead`,
            reference_id: leadId
        });

        // 8. Commission (Seller) - Needs Service Role?
        // Wait: The current user (Buyer) cannot update Seller's points via RLS usually.
        // The RPC 'update_points' is SECURITY DEFINER, so it SHOULD work using the Buyer's client.
        if (leadOwnerId) {
            const commission = Math.floor(cost * 0.40);
            if (commission > 0) {
                await supabase.rpc('update_points', { target_user_id: leadOwnerId, amount: commission });
                // Logging for seller might fail if RLS blocks inserting for another property
                // But let's try.
                await supabase.from('transactions').insert({
                    user_id: leadOwnerId,
                    amount: commission,
                    type: 'lead_sold',
                    description: `Comissão Venda`,
                    reference_id: leadId
                });
            }
        }

        return NextResponse.json({
            success: true,
            remainingPoints: currentPoints - cost,
            contact: leadData
        });

    } catch (error: any) {
        console.error('Unlock error:', error);
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
    }
}
