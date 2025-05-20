-- This SQL should be executed in the Supabase SQL Editor

-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS public.increment_referral_count;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS trigger_update_timestamp ON public.waitlist;

-- Drop the table if it exists (WARNING: This will delete all data)
DROP TABLE IF EXISTS public.waitlist CASCADE;

-- Create the waitlist table with explicit schema references
CREATE TABLE public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  email text NOT NULL,
  twitter_username text,
  discord_username text,
  referral_code text,
  referral_count integer DEFAULT 0 NOT NULL CHECK (referral_count >= 0),
  status text DEFAULT 'pending'::text NOT NULL CHECK (status IN ('pending', 'active', 'blocked')),
  CONSTRAINT waitlist_email_key UNIQUE (email),
  CONSTRAINT waitlist_referral_code_key UNIQUE (referral_code),
  CONSTRAINT waitlist_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add helpful indexes
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at);
CREATE INDEX idx_waitlist_referral_count ON public.waitlist(referral_count DESC);

-- Add table and column comments
COMMENT ON TABLE public.waitlist IS 'Stores user waitlist entries with referral tracking';
COMMENT ON COLUMN public.waitlist.id IS 'Unique identifier for the waitlist entry';
COMMENT ON COLUMN public.waitlist.created_at IS 'Timestamp when the entry was created';
COMMENT ON COLUMN public.waitlist.updated_at IS 'Timestamp when the entry was last updated';
COMMENT ON COLUMN public.waitlist.email IS 'User email address (unique)';
COMMENT ON COLUMN public.waitlist.twitter_username IS 'Optional Twitter/X username';
COMMENT ON COLUMN public.waitlist.discord_username IS 'Optional Discord username';
COMMENT ON COLUMN public.waitlist.referral_code IS 'Unique referral code for this user';
COMMENT ON COLUMN public.waitlist.referral_count IS 'Number of successful referrals';
COMMENT ON COLUMN public.waitlist.status IS 'Current status of the waitlist entry';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_timestamp
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable update for own entries" ON public.waitlist;

-- Create policies with explicit schema references
CREATE POLICY "Enable read access for all users" ON public.waitlist
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.waitlist
  FOR INSERT WITH CHECK (
    email IS NOT NULL 
    AND length(email) <= 255
    AND status = 'pending'
  );

CREATE POLICY "Enable update for own entries" ON public.waitlist
  FOR UPDATE USING (
    status <> 'blocked'
  )
  WITH CHECK (
    status <> 'blocked'
    AND referral_count >= 0
  );

-- Create function to increment referral count with proper error handling
CREATE OR REPLACE FUNCTION public.increment_referral_count(referral_code text)
RETURNS void AS $$
BEGIN
  IF referral_code IS NULL THEN
    RAISE EXCEPTION 'referral_code cannot be null';
  END IF;

  UPDATE public.waitlist
  SET referral_count = COALESCE(referral_count, 0) + 1,
      updated_at = timezone('utc'::text, now())
  WHERE waitlist.referral_code = increment_referral_count.referral_code
    AND status <> 'blocked';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active waitlist entry found with referral code: %', referral_code;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful function comments
COMMENT ON FUNCTION public.increment_referral_count IS 'Increments the referral count for a given referral code if the entry exists and is not blocked';
COMMENT ON FUNCTION public.update_timestamp IS 'Updates the updated_at timestamp to current UTC time';
