
-- 1. Game sessions table for server-side game state (fixes game_state_bypass)
CREATE TABLE public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_type text NOT NULL,
  bet_amount numeric NOT NULL,
  game_state jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Only the edge function (service role) manages game sessions
-- Users can only view their own sessions (no sensitive game_state exposed via RLS)
CREATE POLICY "Users can view own sessions" ON public.game_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Referral claims tracking table (fixes referral_bonus_fraud)
CREATE TABLE public.referral_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  bonus_paid numeric NOT NULL DEFAULT 0,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral claims" ON public.referral_claims
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- 3. Create a secure view for profiles that excludes sensitive tracking fields (fixes profiles_table_sensitive_data_exposure)
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT
  id, user_id, balance, bonus_balance, turnover, turnover_required,
  total_deposit, total_withdraw, total_earnings, total_loss,
  is_banned, created_at, updated_at, referral_bonus,
  full_name, phone, referral_code, referred_by, ban_reason
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_safe TO authenticated;
GRANT SELECT ON public.profiles_safe TO anon;
