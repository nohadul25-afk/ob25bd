import { useEffect, useState } from "react";
import { User, Wallet, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("balance").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => setBalance(data?.balance || 0));
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
            <span className="font-display text-[10px] font-bold text-primary-foreground">OB</span>
          </div>
          <span className="font-display text-sm font-bold text-gradient-gold tracking-wider">OSAMENDI BET 25</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/deposit" className="flex items-center gap-1.5 bg-gradient-gold text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-gold">
              <span>৳</span>
              <span>{balance.toFixed(2)}</span>
              <RefreshCw size={12} />
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 bg-gradient-gold text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-gold">
              লগইন
            </Link>
          )}
          <Link to="/profile" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center border border-border">
            <User size={16} className="text-muted-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
