import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const paymentMethods = [
  { id: "bkash", name: "Bkash VIP", color: "bg-[hsl(330,80%,45%)]", number: "01648946140", logo: "b" },
  { id: "nagad", name: "NAGAD VIP", color: "bg-[hsl(25,90%,50%)]", number: "01648946140", logo: "N" },
];

const amounts = [100, 200, 500, 1000, 5000, 10000, 15000, 20000, 25000];

const Deposit = () => {
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const activeMethod = paymentMethods.find((m) => m.id === selectedMethod)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMethod.number);
    setCopied(true);
    toast.success("নম্বর কপি হয়েছে");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!user) { toast.error("প্রথমে লগইন করুন"); navigate("/login"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { toast.error("সর্বনিম্ন ৳100 ডিপোজিট করতে হবে"); return; }
    if (!txnId.trim()) { toast.error("ট্রানজেকশন আইডি দিন"); return; }
    setLoading(true);
    const { error } = await supabase.from("deposits").insert({
      user_id: user.id, amount: amt, payment_method: selectedMethod, transaction_id: txnId.trim(),
    });
    setLoading(false);
    if (error) { toast.error("ডিপোজিট রিকোয়েস্ট ব্যর্থ হয়েছে"); }
    else { toast.success("ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে!"); setAmount(""); setTxnId(""); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-50 bg-destructive">
        <div className="flex items-center justify-between h-12 px-4">
          <Link to="/" className="p-2 -ml-2"><ArrowLeft size={20} className="text-destructive-foreground" /></Link>
          <h1 className="font-display text-base font-bold text-destructive-foreground">Deposit</h1>
          <div className="w-8" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 mt-4 space-y-5">
        {/* Deposit Method */}
        <div>
          <p className="text-xs font-bold text-neon-green mb-3 flex items-center gap-1">● Deposit Method</p>
          <div className="flex gap-3">
            {paymentMethods.map((m) => (
              <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all flex-1 ${selectedMethod === m.id ? "border-primary bg-card shadow-gold" : "border-border bg-card/50 hover:border-muted-foreground/30"}`}>
                <div className={`w-12 h-12 rounded-lg ${m.color} flex items-center justify-center`}>
                  <span className="text-lg font-bold text-destructive-foreground">{m.logo}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Warning Note */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex gap-2">
            <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-destructive font-bold">NOTE:</span> অনুগ্রহ করে আপনার ডিপোজিট করার পরে অবশ্যই আপনার Trx-ID সাবমিট করবেন। তাহলে খুব দ্রুত আপনার একাউন্টের মধ্যে টাকা যোগ হয়ে যাবে। ⚠️⚠️⚠️
            </p>
          </div>
        </div>

        {/* Agent Number */}
        <div className="bg-card rounded-xl border border-primary/30 p-4">
          <p className="text-xs text-muted-foreground mb-2">{activeMethod.name} এজেন্ট নম্বর</p>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-primary">{activeMethod.number}</span>
            <button onClick={handleCopy} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              {copied ? <CheckCircle size={16} className="text-neon-green" /> : <Copy size={16} className="text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Deposit Amounts */}
        <div>
          <p className="text-xs font-bold text-neon-green mb-3 flex items-center gap-1">● Deposit Amounts</p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {amounts.map((a) => (
              <button key={a} onClick={() => setAmount(String(a))}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${amount === String(a) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}>
                {a.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-card rounded-lg border border-border px-3">
            <span className="text-sm font-bold text-muted-foreground">৳</span>
            <Input type="number" placeholder="100 - 25,000" value={amount} onChange={(e) => setAmount(e.target.value)} className="border-0 bg-transparent h-12 text-foreground font-bold px-0 focus-visible:ring-0" />
          </div>
        </div>

        {/* Transaction ID */}
        <div>
          <p className="text-xs font-bold text-neon-green mb-3 flex items-center gap-1">● Transaction ID</p>
          <Input placeholder="আপনার ট্রানজেকশন আইডি লিখুন" value={txnId} onChange={(e) => setTxnId(e.target.value)} className="bg-card border-border focus:border-primary h-12 text-foreground" />
        </div>

        <Button onClick={handleDeposit} disabled={loading} className="w-full h-14 bg-gradient-gold text-primary-foreground font-display font-black text-lg shadow-gold hover:opacity-90 transition-opacity rounded-xl">
          {loading ? "প্রসেসিং..." : "Next"}
        </Button>
      </motion.div>
      <BottomNav />
    </div>
  );
};

export default Deposit;
