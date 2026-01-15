-- Add visibility control for budgets/leads system
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'marketplace')),
    ADD COLUMN IF NOT EXISTS lead_status text DEFAULT 'open' CHECK (lead_status IN ('open', 'negotiating', 'closed')),
    ADD COLUMN IF NOT EXISTS lead_price numeric DEFAULT 0;
-- The potential commission value
-- Create a policy that allows Pro/Business users to view 'marketplace' budgets
-- Note: Logic for 'who is pro' is handled in the application layer or via profile joins, 
-- but for row level security, we generally allow reading if visibility is marketplace.
CREATE POLICY "Enable read access for marketplace budgets" ON budgets FOR
SELECT USING (visibility = 'marketplace');