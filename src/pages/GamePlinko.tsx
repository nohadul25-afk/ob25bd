import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { toast } from "sonner";

const ROWS = 8;
const MULTIPLIERS = [8, 3, 1.5, 0.5, 0.3, 0.5, 1.5, 3, 8];

const GamePlinko = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, placeBet } = useBalance();
  const [betAmount, setBetAmount] = useState(100);
  const [dropping, setDropping] = useState(false);
  const [ballPath, setBallPath] = useState<{ x: number; y: number }[]>([]);
  const [result, setResult] = useState<{ multiplier: number; winAmount: number } | null>(null);
  const [animStep, setAnimStep] = useState(-1);
  const animRef = useRef<number>(0);

  const drop = async () => {
    if (!user) { navigate("/login"); return; }
    if (betAmount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }

    setDropping(true);
    setResult(null);
    setAnimStep(-1);

    try {
      const data = await placeBet({ action: "plinko", bet_amount: betAmount, rows: ROWS });
      const path: number[] = data.path; // array of 0/1 for left/right at each row
      
      // Build visual path
      const positions: { x: number; y: number }[] = [{ x: 0.5, y: 0 }];
      let xPos = 0.5;
      for (let i = 0; i < path.length; i++) {
        const offset = path[i] === 1 ? 0.04 : -0.04;
        xPos += offset;
        positions.push({ x: xPos, y: (i + 1) / ROWS });
      }
      setBallPath(positions);
      
      // Animate step by step
      let step = 0;
      const anim = () => {
        setAnimStep(step);
        step++;
        if (step < positions.length) {
          animRef.current = window.setTimeout(anim, 200);
        } else {
          setResult({ multiplier: data.multiplier, winAmount: data.win_amount });
          setDropping(false);
          if (data.win_amount > 0) toast.success(`+৳${data.win_amount} জিতেছেন!`);
        }
      };
      anim();
    } catch (err: any) {
      toast.error(err.message);
      setDropping(false);
    }
  };

  useEffect(() => {
    return () => clearTimeout(animRef.current);
  }, []);

  const quickBets = [50, 100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-lg font-bold text-foreground">📍 প্লিংকো</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
          <Wallet size={14} className="text-primary" />
          <span className="font-display text-sm font-bold text-primary">৳{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative bg-card rounded-xl border border-border overflow-hidden" style={{ height: 320 }}>
          <svg width="100%" height="100%" viewBox="0 0 300 300" className="block">
            {/* Pegs */}
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: row + 2 }).map((_, col) => {
                const x = 150 + (col - (row + 1) / 2) * 30;
                const y = 25 + row * 30;
                return <circle key={`${row}-${col}`} cx={x} cy={y} r={4} fill="hsl(var(--muted-foreground))" opacity={0.4} />;
              })
            )}
            {/* Multiplier slots */}
            {MULTIPLIERS.map((m, i) => {
              const x = 150 + (i - (MULTIPLIERS.length - 1) / 2) * 30;
              const isHigh = m >= 3;
              return (
                <g key={i}>
                  <rect x={x - 13} y={270} width={26} height={22} rx={4} fill={isHigh ? "hsl(145, 70%, 45%)" : m < 1 ? "hsl(0, 70%, 50%)" : "hsl(45, 80%, 50%)"} opacity={0.8} />
                  <text x={x} y={283} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight="bold">{m}x</text>
                </g>
              );
            })}
            {/* Ball */}
            {animStep >= 0 && animStep < ballPath.length && (
              <circle cx={ballPath[animStep].x * 300} cy={ballPath[animStep].y * 250 + 10} r={8} fill="hsl(var(--primary))" className="drop-shadow-lg">
                <animate attributeName="r" values="8;10;8" dur="0.3s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-center rounded-xl p-4 border ${result.winAmount > 0 ? "bg-neon-green/10 border-neon-green/30" : "bg-neon-red/10 border-neon-red/30"}`}>
              <p className={`font-display text-2xl font-black ${result.winAmount > 0 ? "text-neon-green" : "text-neon-red"}`}>
                {result.multiplier}x → {result.winAmount > 0 ? `+৳${result.winAmount}` : `-৳${betAmount}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={dropping}>½</button>
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))} className="flex-1 bg-secondary rounded-lg px-3 py-2 text-foreground font-display text-center text-lg font-bold border-none outline-none" disabled={dropping} />
            <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={dropping}>2x</button>
          </div>
          <div className="flex gap-2">
            {quickBets.map((amt) => (
              <button key={amt} onClick={() => setBetAmount(amt)} disabled={dropping} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${betAmount === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>৳{amt}</button>
            ))}
          </div>
          <Button onClick={drop} disabled={dropping} className="w-full h-14 text-xl font-display font-black bg-gradient-gold disabled:opacity-50">
            {dropping ? "পড়ছে..." : `ড্রপ ৳${betAmount}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamePlinko;
