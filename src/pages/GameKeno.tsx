import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { toast } from "sonner";

const GRID = 40;
const MAX_PICKS = 10;

const GameKeno = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, placeBet } = useBalance();
  const [betAmount, setBetAmount] = useState(100);
  const [picks, setPicks] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<{ hits: number; multiplier: number; winAmount: number } | null>(null);

  const togglePick = (n: number) => {
    if (playing) return;
    if (picks.includes(n)) {
      setPicks(picks.filter(p => p !== n));
    } else if (picks.length < MAX_PICKS) {
      setPicks([...picks, n]);
    }
  };

  const play = async () => {
    if (!user) { navigate("/login"); return; }
    if (picks.length < 1) { toast.error("কমপক্ষে ১টি নম্বর বাছাই করুন"); return; }
    if (betAmount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }

    setPlaying(true);
    setResult(null);
    setDrawn([]);

    try {
      const data = await placeBet({ action: "keno", bet_amount: betAmount, picks });
      
      // Animate drawn numbers one by one
      const drawnNums: number[] = data.drawn;
      for (let i = 0; i < drawnNums.length; i++) {
        await new Promise(r => setTimeout(r, 150));
        setDrawn(prev => [...prev, drawnNums[i]]);
      }

      setResult({ hits: data.hits, multiplier: data.multiplier, winAmount: data.win_amount });
      if (data.win_amount > 0) toast.success(`+৳${data.win_amount} জিতেছেন!`);
    } catch (err: any) {
      toast.error(err.message);
    }
    setPlaying(false);
  };

  const reset = () => {
    setPicks([]);
    setDrawn([]);
    setResult(null);
  };

  const quickBets = [50, 100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-lg font-bold text-foreground">🎯 কেনো</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
          <Wallet size={14} className="text-primary" />
          <span className="font-display text-sm font-bold text-primary">৳{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">বাছাই: <span className="text-primary font-bold">{picks.length}/{MAX_PICKS}</span></p>
          {!playing && picks.length > 0 && (
            <button onClick={reset} className="text-xs text-destructive font-bold">রিসেট</button>
          )}
        </div>

        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: GRID }, (_, i) => i + 1).map(n => {
            const isPicked = picks.includes(n);
            const isDrawn = drawn.includes(n);
            const isHit = isPicked && isDrawn;
            const isMiss = isPicked && drawn.length > 0 && !isDrawn;
            
            return (
              <motion.button
                key={n}
                whileTap={!playing ? { scale: 0.9 } : {}}
                onClick={() => togglePick(n)}
                disabled={playing}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-display font-bold transition-all ${
                  isHit ? "bg-neon-green/30 border-2 border-neon-green text-neon-green"
                  : isDrawn ? "bg-primary/20 border border-primary/50 text-primary"
                  : isPicked ? "bg-primary text-primary-foreground border-2 border-primary"
                  : "bg-secondary border border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {n}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center rounded-xl p-4 border ${result.winAmount > 0 ? "bg-neon-green/10 border-neon-green/30" : "bg-neon-red/10 border-neon-red/30"}`}>
              <p className="text-sm text-muted-foreground mb-1">ম্যাচ: {result.hits}/{picks.length}</p>
              <p className={`font-display text-2xl font-black ${result.winAmount > 0 ? "text-neon-green" : "text-neon-red"}`}>
                {result.multiplier}x → {result.winAmount > 0 ? `+৳${result.winAmount}` : `-৳${betAmount}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={playing}>½</button>
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))} className="flex-1 bg-secondary rounded-lg px-3 py-2 text-foreground font-display text-center text-lg font-bold border-none outline-none" disabled={playing} />
            <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={playing}>2x</button>
          </div>
          <div className="flex gap-2">
            {quickBets.map((amt) => (
              <button key={amt} onClick={() => setBetAmount(amt)} disabled={playing} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${betAmount === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>৳{amt}</button>
            ))}
          </div>
          <Button onClick={play} disabled={playing || picks.length === 0} className="w-full h-14 text-xl font-display font-black bg-gradient-gold disabled:opacity-50">
            {playing ? "ড্র হচ্ছে..." : `খেলুন ৳${betAmount}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameKeno;
