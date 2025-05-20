-- This SQL should be executed in the Supabase SQL Editor

-- Create the waitlist table
CREATE TABLE public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text NOT NULL UNIQUE,
  twitter_username text,
  discord_username text,
  referral_code text UNIQUE,
  referral_count integer DEFAULT 0,
  status text DEFAULT 'pending'::text
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.waitlist
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for own entries" ON public.waitlist
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Create function to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count(referral_code text)
RETURNS void AS $$
BEGIN
  UPDATE public.waitlist
  SET referral_count = referral_count + 1
  WHERE waitlist.referral_code = increment_referral_count.referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
