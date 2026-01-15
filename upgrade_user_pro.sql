-- Upgrade user m_tinelli@icloud.com to 'pro' tier
UPDATE profiles
SET tier = 'pro'
WHERE email = 'm_tinelli@icloud.com';