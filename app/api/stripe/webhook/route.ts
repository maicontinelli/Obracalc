import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Helper to initialize Stripe lazily to avoid build-time errors if env vars are missing
const getStripe = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    return new Stripe(secretKey, {
        apiVersion: '2024-12-18.acacia' as any,
    });
};

// Helper for Supabase Admin
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase URL or Service Role Key not defined');
    }
    return createClient(url, key);
};

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }

        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.userId || session.client_reference_id;

        // Retrieve subscription details to verify which product was bought
        const stripe = getStripe();
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Map price IDs to Tiers (This should match what is in app/planos/page.tsx)
        let newTier = 'free';
        if (priceId === 'price_1Sl8fkGZfnvqYwvYTdmFAUM4') {
            newTier = 'pro';
        } else if (priceId === 'price_1Sl8gZGZfnvqYwvYSqt716Vm') {
            newTier = 'business';
        }

        if (userId) {
            console.log(`✅ Payment received for user ${userId}. Updating tier to ${newTier}...`);

            // Update User Profile in Supabase
            const supabaseAdmin = getSupabaseAdmin();

            // 1. Fetch current points to add monthly bonus
            const { data: profileData } = await supabaseAdmin.from('profiles').select('points').eq('id', userId).single();
            const currentPoints = profileData?.points || 0;
            const pointsBonus = 500; // Bonus for successful payment

            // 2. Update Profile with new Tier + Bonus Points
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({
                    tier: newTier,
                    subscription_status: 'active',
                    subscription_id: subscriptionId,
                    points: currentPoints + pointsBonus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                console.error('❌ Error updating profile:', error);
                return new NextResponse('Error updating profile', { status: 500 });
            }
            console.log(`🎉 User ${userId} upgraded to ${newTier} successfully!`);
        } else {
            console.error('❌ No user ID found in session metadata');
        }
    }

    return new NextResponse(null, { status: 200 });
}
