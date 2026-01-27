import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAbacatePayBilling } from '@/lib/abacatepay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan } = await req.json();

        // Fetch user profile for details
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Determine Amount and Product
        let amount = 0;
        let productName = '';
        let description = '';

        if (plan === 'Profissional') {
            amount = 11000; // R$ 110,00
            productName = 'Plano Profissional (Anual)';
            description = 'Acesso a recursos avançados por 1 ano.';
        } else if (plan === 'Empresarial') {
            amount = 84000; // R$ 840,00
            productName = 'Plano Empresarial (Anual)';
            description = 'Acesso total corporativo por 1 ano.';
        } else {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }
        // Prepare Customer Data
        // Note: details must be valid. If document_id is missing, this might fail.
        const customerData = {
            name: profile.full_name || user.email || 'Cliente',
            email: user.email!,
            taxId: profile.document_id || '00000000000', // Warning: Needs valid CPF/CNPJ
            cellphone: profile.phone || '',
        };

        // Create Billing
        const billing = await createAbacatePayBilling({
            frequency: 'ONE_TIME',
            methods: ['PIX', 'CARD'],
            products: [
                {
                    externalId: plan.toLowerCase(),
                    name: productName,
                    quantity: 1,
                    price: amount,
                    description: description,
                }
            ],
            returnUrl: `https://obraplana.app/dashboard`,
            completionUrl: `https://obraplana.app/dashboard?success=true`,
            customer: customerData,
            metadata: {
                userId: user.id,
                plan: plan,
            }
        });

        console.log('AbacatePay Response:', JSON.stringify(billing, null, 2));

        if (!billing || !billing.data || !billing.data.url) {
            throw new Error(`Invalid AbacatePay response: ${JSON.stringify(billing)}`);
        }

        return NextResponse.json({ url: billing.data.url });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
}
