-- Database Optimization and Cleanup Script
-- Run this in the Supabase SQL Editor to support the new Contract features and clean up old data.
-- 1. Add new columns for Service Contract to 'profiles' table
-- These fields are used to auto-fill the "Provider" section of the generated contract.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS document_id text;
-- CPF or CNPJ
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pix_key text;
-- Pix Key
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_name text;
-- Bank Name
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_agency text;
-- Agency Number
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bank_account text;
-- Account Number
-- 2. Cleanup obsolete Gamification/Marketplace columns from 'profiles'
-- We are removing the old "points" system to focus on the SaaS Budgeting features.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS points;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS unlocked_leads;
-- 3. Cleanup obsolete Tables (Safe to run if they exist)
-- These tables were part of the old marketplace/gamification system and are no longer used.
DROP TABLE IF EXISTS public.marketplace_listings;
DROP TABLE IF EXISTS public.user_points_transactions;
DROP TABLE IF EXISTS public.gamification_rewards;
DROP TABLE IF EXISTS public.unlocked_assignments;
-- Note: 'anonymous_leads' table is PRESERVED as it is used for the new leads capture feature.