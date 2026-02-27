import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(0); setLoading(false); return; }
    const { data } = await supabase.from("profiles").select("balance").eq("user_id", user.id).maybeSingle();
    setBalance(data?.balance || 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const placeBet = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("place-bet", { body: payload });
    if (error) throw new Error(error.message || "Bet failed");
    if (data?.error) throw new Error(data.error);
    if (data?.new_balance !== undefined) setBalance(data.new_balance);
    return data;
  };

  return { balance, loading, placeBet, refreshBalance: fetchBalance, setBalance };
};
