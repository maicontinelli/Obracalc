-- Add avatar_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
-- Policy to allow public viewing of avatars
CREATE POLICY "Avatar Public View" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
-- Policy to allow authenticated users to upload their own avatar
-- Note: Simplified policy. In prod, enforce folder structure like 'avatars/user_id/...'
CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );
-- Policy to allow users to update their own avatar
CREATE POLICY "Avatar Auth Update" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );