import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const secret = url.searchParams.get('secret');
        const envSecret = process.env.ABACATEPAY_WEBHOOK_SECRET || process.env.ABACATEPAY_WEBH;

        if (envSecret && secret !== envSecret) {
            return new NextResponse('Unauthorized: Invalid Secret', { status: 401 });
        }

        const body = await req.json();
        const { event, data } = body;

        console.log('AbacatePay Webhook Body:', JSON.stringify(body, null, 2));

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (event === 'billing.paid') {
            const billing = data.bill || data;
            const { metadata, customer } = billing;
            const userId = metadata?.userId;
            const plan = metadata?.plan;

            if (userId && plan) {
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

                // 14-day guarantee window starts from payment confirmation
                const guaranteeExpires = new Date();
                guaranteeExpires.setDate(guaranteeExpires.getDate() + 14);

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        tier: plan === 'Profissional' ? 'pro' : 'business',
                        current_period_end: oneYearFromNow.toISOString(),
                        guarantee_expires_at: guaranteeExpires.toISOString(),
                        payment_failures: 0,
                        abacatepay_customer_id: customer?.id,
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Error updating profile on billing.paid:', error);
                    return new NextResponse('Database Error', { status: 500 });
                }
            }
        }

        if (event === 'billing.failed') {
            const billing = data.bill || data;
            const { metadata } = billing;
            const userId = metadata?.userId;

            if (userId) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('payment_failures')
                    .eq('id', userId)
                    .single();

                const currentFailures = profile?.payment_failures ?? 0;
                const newFailures = currentFailures + 1;
                // Soft block at 1st failure, hard block (past_due) at 2nd
                const newStatus = newFailures >= 2 ? 'past_due' : 'active';

                const { error } = await supabase
                    .from('profiles')
                    .update({ payment_failures: newFailures, subscription_status: newStatus })
                    .eq('id', userId);

                if (error) {
                    console.error('Error updating profile on billing.failed:', error);
                    return new NextResponse('Database Error', { status: 500 });
                }
            }
        }

        if (event === 'billing.canceled') {
            const billing = data.bill || data;
            const userId = billing?.metadata?.userId;

            if (userId) {
                await supabase
                    .from('profiles')
                    .update({ subscription_status: 'canceled', tier: 'free' })
                    .eq('id', userId);
            }
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Webhook Error:', error);
        return new NextResponse('Error', { status: 400 });
    }
}
