
-- Fix the security definer view by making it security invoker
ALTER VIEW public.profiles_safe SET (security_invoker = on);
