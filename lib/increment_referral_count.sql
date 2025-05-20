-- This SQL should be executed in the Supabase SQL Editor
CREATE OR REPLACE FUNCTION increment_referral_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE waitlist
  SET referrals_count = referrals_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
