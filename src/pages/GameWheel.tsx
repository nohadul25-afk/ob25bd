import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { toast } from "sonner";

const SEGMENTS = [
  { label: "0x", multiplier: 0, color: "hsl(0, 70%, 50%)" },
  { label: "1.5x", multiplier: 1.5, color: "hsl(45, 80%, 50%)" },
  { label: "0x", multiplier: 0, color: "hsl(0, 70%, 50%)" },
  { label: "2x", multiplier: 2, color: "hsl(145, 70%, 45%)" },
  { label: "0.5x", multiplier: 0.5, color: "hsl(220, 60%, 50%)" },
  { label: "3x", multiplier: 3, color: "hsl(280, 60%, 50%)" },
  { label: "0x", multiplier: 0, color: "hsl(0, 70%, 50%)" },
  { label: "1.2x", multiplier: 1.2, color: "hsl(30, 70%, 50%)" },
  { label: "5x", multiplier: 5, color: "hsl(50, 90%, 50%)" },
  { label: "0x", multiplier: 0, color: "hsl(0, 70%, 50%)" },
  { label: "1.5x", multiplier: 1.5, color: "hsl(45, 80%, 50%)" },
  { label: "10x", multiplier: 10, color: "hsl(300, 80%, 55%)" },
];

const GameWheel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, placeBet } = useBalance();
  const [betAmount, setBetAmount] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ multiplier: number; winAmount: number } | null>(null);

  const spin = async () => {
    if (!user) { navigate("/login"); return; }
    if (betAmount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }

    setSpinning(true);
    setResult(null);

    try {
      const data = await placeBet({ action: "wheel", bet_amount: betAmount });
      const segIndex = data.segment_index;
      const segAngle = 360 / SEGMENTS.length;
      const targetAngle = 360 - (segIndex * segAngle + segAngle / 2);
      const spins = 5 + Math.floor(Math.random() * 3);
      const finalRotation = rotation + spins * 360 + targetAngle - (rotation % 360);
      
      setRotation(finalRotation);

      setTimeout(() => {
        setResult({ multiplier: data.multiplier, winAmount: data.win_amount });
        setSpinning(false);
        if (data.win_amount > 0) {
          toast.success(`+৳${data.win_amount} জিতেছেন!`);
        }
      }, 4000);
    } catch (err: any) {
      toast.error(err.message);
      setSpinning(false);
    }
  };

  const quickBets = [50, 100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-lg font-bold text-foreground">🎡 হুইল অফ ফরচুন</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
          <Wallet size={14} className="text-primary" />
          <span className="font-display text-sm font-bold text-primary">৳{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
          
          <motion.svg
            width={280} height={280} viewBox="0 0 280 280"
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="drop-shadow-lg"
          >
            {SEGMENTS.map((seg, i) => {
              const angle = (2 * Math.PI) / SEGMENTS.length;
              const startAngle = i * angle - Math.PI / 2;
              const endAngle = startAngle + angle;
              const r = 135;
              const cx = 140, cy = 140;
              const x1 = cx + r * Math.cos(startAngle);
              const y1 = cy + r * Math.sin(startAngle);
              const x2 = cx + r * Math.cos(endAngle);
              const y2 = cy + r * Math.sin(endAngle);
              const midAngle = startAngle + angle / 2;
              const tx = cx + r * 0.65 * Math.cos(midAngle);
              const ty = cy + r * 0.65 * Math.sin(midAngle);
              return (
                <g key={i}>
                  <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={seg.color} stroke="hsl(var(--background))" strokeWidth={2} />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight="bold" transform={`rotate(${(midAngle * 180) / Math.PI}, ${tx}, ${ty})`}>
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle cx={140} cy={140} r={25} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={2} />
          </motion.svg>
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
            <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={spinning}>½</button>
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))} className="flex-1 bg-secondary rounded-lg px-3 py-2 text-foreground font-display text-center text-lg font-bold border-none outline-none" disabled={spinning} />
            <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={spinning}>2x</button>
          </div>
          <div className="flex gap-2">
            {quickBets.map((amt) => (
              <button key={amt} onClick={() => setBetAmount(amt)} disabled={spinning} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${betAmount === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>৳{amt}</button>
            ))}
          </div>
          <Button onClick={spin} disabled={spinning} className="w-full h-14 text-xl font-display font-black bg-gradient-gold disabled:opacity-50">
            {spinning ? "ঘুরছে..." : `স্পিন ৳${betAmount}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameWheel;
