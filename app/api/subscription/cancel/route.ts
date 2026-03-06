import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch { /* Server Component context — safe to ignore */ }
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use service role to read full profile (guarantee window check)
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('guarantee_expires_at, subscription_status, tier')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Only allow cancel during the 14-day guarantee window
        if (!profile.guarantee_expires_at) {
            return NextResponse.json(
                { error: 'Fora do período de garantia. Entre em contato com o suporte.' },
                { status: 403 }
            );
        }

        const guaranteeEnd = new Date(profile.guarantee_expires_at);
        if (new Date() > guaranteeEnd) {
            return NextResponse.json(
                { error: 'O período de garantia de 14 dias já expirou.' },
                { status: 403 }
            );
        }

        // Update profile: cancel subscription, revert to free
        const { error: updateError } = await adminSupabase
            .from('profiles')
            .update({
                subscription_status: 'canceled',
                tier: 'free',
                guarantee_expires_at: null,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Cancel subscription error:', updateError);
            return NextResponse.json({ error: 'Erro ao cancelar assinatura' }, { status: 500 });
        }

        console.log(`Subscription canceled for user ${user.id} within guarantee window.`);

        return NextResponse.json({
            success: true,
            message: 'Assinatura cancelada. O reembolso será processado em até 7 dias úteis.',
        });

    } catch (error: any) {
        console.error('Cancel route error:', error);
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
}
