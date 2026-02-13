export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
    city?: string;
    state?: string;
    // Subscription
    tier: SubscriptionTier;
    subscription_status: 'active' | 'past_due' | 'canceled' | 'trialing' | null;
    current_period_end?: string;
    // Banking/Professional Info
    company_name?: string;
    document_id?: string; // CPF or CNPJ
    pix_key?: string;
    bank_name?: string;
    bank_agency?: string;
    bank_account?: string;
    // Usage stats (could be counted dynamically or cached)
    saved_estimates_count: number;
    avatar_url?: string | null;
    logo_url?: string | null;
    address?: string;
    cep?: string;
}

export const PLAN_LIMITS = {
    free: {
        max_estimates: 5,
        max_items_per_estimate: 20,
        can_export_pdf: true,
        can_export_html: true,
        can_remove_watermark: false,
        can_edit_saved: true,
        can_delete_saved: true
    },
    pro: {
        max_estimates: Infinity,
        max_items_per_estimate: Infinity,
        can_export_pdf: true,
        can_export_html: true,
        can_remove_watermark: true,
        can_edit_saved: true,
        can_delete_saved: true
    },
    business: {
        max_estimates: Infinity,
        max_items_per_estimate: Infinity,
        can_export_pdf: true,
        can_export_html: true,
        can_remove_watermark: true,
        can_edit_saved: true,
        can_delete_saved: true
    }
};
