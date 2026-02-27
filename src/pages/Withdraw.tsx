import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const paymentMethods = [
  { id: "bkash", name: "bKash", color: "bg-[hsl(330,80%,45%)]", logo: "b" },
  { id: "nagad", name: "নগদ", color: "bg-[hsl(25,90%,50%)]", logo: "N" },
];

const Withdraw = () => {
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();
  const { balance, refreshBalance } = useBalance();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    }
  }, [user]);

  const handleWithdraw = async () => {
    if (!user) { toast.error("প্রথমে লগইন করুন"); navigate("/login"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt < 500) { toast.error("সর্বনিম্ন ৳৫০০ উইথড্র করতে হবে"); return; }
    if (!accountNumber.trim()) { toast.error("অ্যাকাউন্ট নম্বর দিন"); return; }
    setLoading(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id, amount: amt, payment_method: selectedMethod, account_number: accountNumber.trim(),
    });
    setLoading(false);
    if (error) { toast.error("উইথড্র রিকোয়েস্ট ব্যর্থ হয়েছে"); }
    else { toast.success("উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!"); setAmount(""); setAccountNumber(""); }
  };

  const turnoverRemaining = Math.max(0, (profile?.turnover_required || 0) - (profile?.turnover || 0));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-12 px-4">
          <Link to="/" className="p-2 -ml-2"><ArrowLeft size={20} className="text-foreground" /></Link>
          <h1 className="font-display text-base font-bold text-foreground">Withdrawal</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Method Tabs */}
      <div className="flex border-b border-border">
        {paymentMethods.map((m) => (
          <button key={m.id} onClick={() => setSelectedMethod(m.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all border-b-2 ${selectedMethod === m.id ? "border-destructive text-foreground" : "border-transparent text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded ${m.color} flex items-center justify-center`}>
              <span className="text-[10px] font-bold text-destructive-foreground">{m.logo}</span>
            </div>
            <span>{m.name} E wallet</span>
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 mt-4 space-y-4">
        {/* Bound Wallet */}
        {accountNumber && (
          <div className="bg-gradient-to-r from-[hsl(170,40%,30%)] to-[hsl(170,50%,40%)] rounded-2xl p-5">
            <p className="text-sm font-bold text-foreground">{paymentMethods.find(m => m.id === selectedMethod)?.name}</p>
            <p className="text-lg font-display font-bold text-foreground mt-1">********{accountNumber.slice(-4)}</p>
          </div>
        )}

        {/* Account Number Input */}
        <div>
          <p className="text-xs font-bold text-foreground mb-2">আপনার {paymentMethods.find(m => m.id === selectedMethod)?.name} নম্বর</p>
          <div className="flex gap-2">
            <Input type="tel" placeholder="01XXXXXXXXX" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="bg-card border-border focus:border-primary h-12 text-foreground flex-1" />
            <button className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
              <Plus size={20} className="text-destructive-foreground" />
            </button>
          </div>
        </div>

        {/* Balance Info */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Withdrawal time: 24 hours</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">Main Wallet: <span className="font-bold">৳ {balance.toFixed(2)}</span></p>
          </div>
          <p className="text-sm text-foreground">Available Amount: <span className="font-bold text-primary">৳ {balance.toFixed(2)}</span></p>
          <button onClick={refreshBalance} className="flex items-center gap-2 mx-auto py-2 px-4 rounded-full bg-secondary/50 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={12} />
            <span>Recall Balance</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <p className="text-xs font-bold text-foreground mb-2">পরিমাণ (৳)</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[500, 1000, 2000, 5000, 10000, 20000].map((a) => (
              <button key={a} onClick={() => setAmount(String(a))}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${amount === String(a) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}>
                ৳{a.toLocaleString()}
              </button>
            ))}
          </div>
          <Input type="number" placeholder="অন্য পরিমাণ লিখুন" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-card border-border focus:border-primary h-12 text-foreground" />
        </div>

        {/* Turnover Requirements */}
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-bold text-foreground mb-2">Withdrawal turnover requirements</p>
          {turnoverRemaining > 0 && (
            <p className="text-xs text-destructive font-bold mb-3">Please complete the required turnover for withdrawal.</p>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary">
                <th className="py-2 px-3 text-left text-muted-foreground font-bold">Game type</th>
                <th className="py-2 px-3 text-right text-muted-foreground font-bold">Remaining turnover</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="py-2 px-3 text-foreground">General</td>
                <td className="py-2 px-3 text-right text-primary font-bold">{turnoverRemaining.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button onClick={handleWithdraw} disabled={loading} className="w-full h-14 bg-destructive text-destructive-foreground font-display font-black text-lg hover:bg-destructive/90 transition-opacity rounded-xl">
          {loading ? "প্রসেসিং..." : "OK"}
        </Button>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Withdraw;
