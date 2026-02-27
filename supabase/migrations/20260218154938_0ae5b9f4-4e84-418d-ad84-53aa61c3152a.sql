
-- Daily bonuses table
CREATE TABLE public.daily_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  claimed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonuses" ON public.daily_bonuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bonuses" ON public.daily_bonuses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert bet_history (edge function uses service role)
-- Also allow users to view their own bet history (already exists)
-- Add INSERT policy for authenticated users on bet_history
CREATE POLICY "Users can insert own bets" ON public.bet_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add referral_bonus column to track referral earnings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_bonus numeric NOT NULL DEFAULT 0;

-- Index for daily bonus check
CREATE INDEX idx_daily_bonuses_user_claimed ON public.daily_bonuses (user_id, claimed_at DESC);
