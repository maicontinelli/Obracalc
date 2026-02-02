import { createClient } from '@/lib/supabase/client';
import { UserProfile, SubscriptionTier } from '@/lib/plan-limits';
import { useState, useEffect } from 'react';

export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            // Fetch profile data from Supabase
            // Note: In a real scenario, you'd ensure these columns exist in your DB table
            // For now, we will default missing fields to simulate the logic if columns aren't ready
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Count saved estimates
            const { count } = await supabase
                .from('budgets')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (data) {
                // Adapt DB response to our strict UserProfile type
                // Defaulting to 'free' if no tier is set
                setProfile({
                    ...data,
                    email: user.email!,
                    tier: user.email === 'maicontinelli@gmail.com' ? 'business' : (data.tier as SubscriptionTier) || 'free',
                    saved_estimates_count: count || 0
                });
            } else {
                // Fallback if profile row doesn't exist yet
                setProfile({
                    id: user.id,
                    email: user.email!,
                    tier: user.email === 'maicontinelli@gmail.com' ? 'business' : 'free',
                    subscription_status: null,
                    saved_estimates_count: 0
                });
            }
            setIsLoading(false);
        };

        fetchProfile();
    }, []);

    return { profile, isLoading, refreshProfile: () => window.location.reload() }; // Simple refresh for now
}
