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

        if (event === 'billing.paid') {
            const billing = data.bill || data;
            const { metadata, customer } = billing;
            const userId = metadata?.userId;
            const plan = metadata?.plan;

            if (userId && plan) {
                // Update User Subscription in Supabase
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
                const supabase = createClient(supabaseUrl, supabaseKey);

                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'active',
                        tier: plan === 'Profissional' ? 'pro' : 'business',
                        current_period_end: oneYearFromNow.toISOString(),
                        // Save abacatepay customer id if available
                        abacatepay_customer_id: customer?.id
                    })
                    .eq('id', userId);

                if (error) {
                    console.error('Error updating profile:', error);
                    return new NextResponse('Database Error', { status: 500 });
                }
            }
        }

        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Webhook Error:', error);
        return new NextResponse('Error', { status: 400 });
    }
}
