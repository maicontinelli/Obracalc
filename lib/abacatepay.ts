import { createClient } from '@supabase/supabase-js';

const ABACATEPAY_API_URL = 'https://api.abacatepay.com/v1';

export interface AbacatePayProduct {
    externalId: string;
    name: string;
    quantity: number;
    price: number; // In cents
    description?: string;
}

export interface AbacatePayCustomer {
    name: string;
    email: string;
    taxId: string; // CPF/CNPJ
    cellphone?: string;
}

export interface CreateBillingParams {
    frequency: 'ONE_TIME' | 'MULTIPLE_PAYMENTS';
    methods: ('PIX' | 'CARD')[];
    products: AbacatePayProduct[];
    returnUrl: string;
    completionUrl: string;
    customer?: AbacatePayCustomer;
    customerId?: string;
    metadata?: Record<string, any>;
}

export async function createAbacatePayBilling(params: CreateBillingParams) {
    const apiKey = process.env.ABACATEPAY_API_KEY || process.env.ABACATEPAY_DEV;
    if (!apiKey) {
        throw new Error('ABACATEPAY_API_KEY is not configured');
    }

    const response = await fetch(`${ABACATEPAY_API_URL}/billing/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AbacatePay Error:', errorData);
        throw new Error(`Failed to create billing: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
