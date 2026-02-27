import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ArrowDownToLine, ArrowUpFromLine, Trophy, BarChart3, DollarSign, FileText, ClipboardList, UserCircle, Shield, Users, Gift, Coins, MessageSquare, Headphones, LogOut, Copy, Check, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { balance, placeBet, refreshBalance } = useBalance();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [claimingReferral, setClaimingReferral] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        setProfile(data);
        if (data && !data.referral_code) {
          const code = user.id.slice(0, 8).toUpperCase();
          supabase.from("profiles").update({ referral_code: code }).eq("user_id", user.id).then(() => {
            setProfile((p: any) => ({ ...p, referral_code: code }));
          });
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast.success("লগআউট হয়েছে");
    navigate("/");
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      toast.success("রেফারেল কোড কপি হয়েছে!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const claimDailyBonus = async () => {
    setClaimingBonus(true);
    try {
      const data = await placeBet({ action: "daily_bonus", bet_amount: 0 });
      toast.success(`৳${data.bonus} ডেইলি বোনাস পেয়েছেন!`);
      refreshBalance();
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      setProfile(p);
    } catch (err: any) {
      toast.error(err.message);
    }
    setClaimingBonus(false);
  };

  // Claim referral bonus
  const claimReferral = async () => {
    setClaimingReferral(true);
    try {
      const data = await placeBet({ action: "claim_referral", bet_amount: 0 });
      // The referral bonus is credited to your referrer. Show a friendly message.
      toast.success(`রেফারেল বোনাস সফলভাবে দাবি করা হয়েছে! আপনার বন্ধুকে ৳${data.bonus} বোনাস প্রদান করা হবে।`);
      // Although the bonus goes to referrer, refresh profile/balance to reflect any updates
      refreshBalance();
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      setProfile(p);
    } catch (err: any) {
      toast.error(err.message);
    }
    setClaimingReferral(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">লগইন করুন</h2>
          <p className="text-muted-foreground text-sm mb-6">প্রোফাইল দেখতে লগইন করুন</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-gradient-gold text-primary-foreground font-display font-bold rounded-xl shadow-gold">লগইন</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const memberMenuItems = [
    { icon: Trophy, label: "Reward Center", path: "/bonus", color: "text-primary" },
    { icon: BarChart3, label: "Betting Record", path: "/profile", color: "text-foreground" },
    { icon: DollarSign, label: "Profit And Loss", path: "/profile", color: "text-foreground" },
    { icon: FileText, label: "Deposit Record", path: "/deposit", color: "text-foreground" },
    { icon: ClipboardList, label: "Withdrawal Record", path: "/withdraw", color: "text-foreground" },
    { icon: UserCircle, label: "My Account", path: "/profile", color: "text-foreground" },
    { icon: Shield, label: "Security Center", path: "/profile", color: "text-foreground" },
    { icon: Users, label: "Invite Friends", path: "/profile", color: "text-foreground" },
    { icon: Gift, label: "Mission", path: "/bonus", color: "text-foreground" },
    { icon: Coins, label: "Rebate", path: "/profile", color: "text-foreground" },
    { icon: MessageSquare, label: "Suggestion", path: "/profile", color: "text-foreground" },
    { icon: Headphones, label: "Customer Service", path: "/profile", color: "text-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Link to="/" className="p-2 -ml-2"><ArrowLeft size={20} className="text-foreground" /></Link>
            <h1 className="font-display text-base font-bold text-foreground ml-2">My Account</h1>
          </div>
          {isAdmin && (
            <Link to="/admin" className="px-3 py-1.5 bg-destructive/20 text-destructive text-xs font-display font-bold rounded-lg">অ্যাডমিন</Link>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 mt-4 space-y-4">
        {/* User Card */}
        <div className="bg-gradient-to-br from-card to-secondary rounded-2xl p-5 border border-border relative overflow-hidden">
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
            <span className="text-[10px] font-bold text-primary">⭐ VIP</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold border-2 border-primary/50">
              <span className="font-display text-xl font-bold text-primary-foreground">{profile?.full_name?.[0] || "U"}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{profile?.phone || user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Nickname: {profile?.full_name || "Player"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-display font-black text-foreground">৳ {balance.toFixed(2)}</p>
            </div>
            <button onClick={refreshBalance} className="p-2 rounded-full bg-secondary/50">
              <RefreshCw size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link to="/deposit" className="py-2.5 rounded-lg bg-card/80 border border-border text-center text-xs font-bold text-foreground hover:bg-card transition-colors">Deposit</Link>
            <Link to="/withdraw" className="py-2.5 rounded-lg bg-card/80 border border-border text-center text-xs font-bold text-foreground hover:bg-card transition-colors">Withdrawal</Link>
            <button onClick={copyReferralCode} className="py-2.5 rounded-lg bg-card/80 border border-border text-center text-xs font-bold text-foreground hover:bg-card transition-colors">
              {copied ? "Copied!" : "My Code"}
            </button>
          </div>
        </div>

        {/* Daily Bonus */}
        <div className="bg-card rounded-xl border border-primary/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Daily Bonus</h3>
                <p className="text-xs text-muted-foreground">প্রতিদিন ৳50 ফ্রি বোনাস!</p>
              </div>
            </div>
            <Button onClick={claimDailyBonus} disabled={claimingBonus} size="sm" className="bg-gradient-gold text-primary-foreground font-bold rounded-full px-5">
              {claimingBonus ? "..." : "Claim"}
            </Button>
          </div>
        </div>

        {/* Referral Bonus (only show if user was referred by someone) */}
        {profile?.referred_by && (
          <div className="bg-card rounded-xl border border-primary/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Referral Bonus</h3>
                  <p className="text-xs text-muted-foreground">বন্ধুর প্রথম ডিপোজিটের পর ৳100 বোনাস দাবি করুন</p>
                </div>
              </div>
              <Button onClick={claimReferral} disabled={claimingReferral} size="sm" className="bg-gradient-gold text-primary-foreground font-bold rounded-full px-5">
                {claimingReferral ? "..." : "Claim"}
              </Button>
            </div>
          </div>
        )}

        {/* Member Center */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-xs font-bold text-muted-foreground mb-4 border-b border-border pb-2">Member Center</h3>
          <div className="grid grid-cols-4 gap-4">
            {memberMenuItems.map((item) => (
              <Link key={item.label} to={item.path} className="flex flex-col items-center gap-1.5 group">
                <div className="w-11 h-11 rounded-full bg-secondary/80 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon size={18} className={`${item.color} group-hover:text-primary transition-colors`} />
                </div>
                <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm hover:bg-destructive/90 transition-colors">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Profile;
