import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, Star, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { toast } from "sonner";

const COLS = 3;
const MAX_FLOORS = 8;

type FloorState = "hidden" | "safe" | "danger";

const GameTower = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, placeBet } = useBalance();
  const [betAmount, setBetAmount] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [floors, setFloors] = useState<FloorState[][]>(Array(MAX_FLOORS).fill(null).map(() => Array(COLS).fill("hidden")));
  const [currentFloor, setCurrentFloor] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [currentBet, setCurrentBet] = useState(0);
  const [loading, setLoading] = useState(false);

  const multiplier = currentFloor === 0 ? 1 : Math.floor(Math.pow(COLS / (COLS - 1), currentFloor) * 100) / 100;
  const payout = Math.floor(currentBet * multiplier);

  const startGame = async () => {
    if (!user) { navigate("/login"); return; }
    if (betAmount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }

    setLoading(true);
    try {
      const data = await placeBet({ action: "tower_start", bet_amount: betAmount });
      setSessionId(data.session_id);
      setFloors(Array(MAX_FLOORS).fill(null).map(() => Array(COLS).fill("hidden")));
      setCurrentBet(betAmount);
      setCurrentFloor(0);
      setIsPlaying(true);
      setGameOver(false);
      setCashedOut(false);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const selectTile = async (col: number) => {
    if (!isPlaying || currentFloor >= MAX_FLOORS) return;

    setLoading(true);
    try {
      const data = await placeBet({ action: "tower_climb", session_id: sessionId, col_index: col, floor: currentFloor });
      const newFloors = floors.map(f => [...f]);

      if (data.is_safe) {
        newFloors[currentFloor][col] = "safe";
        // Show danger on this floor
        if (data.danger_col !== undefined) newFloors[currentFloor][data.danger_col] = "danger";
        setFloors(newFloors);
        setCurrentFloor(currentFloor + 1);
      } else {
        newFloors[currentFloor][col] = "danger";
        // Reveal safe tiles
        const safeCols = [0, 1, 2].filter(c => c !== col);
        safeCols.forEach(c => { newFloors[currentFloor][c] = "safe"; });
        setFloors(newFloors);
        setGameOver(true);
        setIsPlaying(false);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const cashOut = async () => {
    if (!isPlaying || currentFloor === 0) return;
    setLoading(true);
    try {
      const data = await placeBet({ action: "tower_cashout", session_id: sessionId });
      setCashedOut(true);
      setIsPlaying(false);
      toast.success(`+৳${data.win_amount} জিতেছেন!`);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const quickBets = [50, 100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-lg font-bold text-foreground">🗼 টাওয়ার গেম</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
          <Wallet size={14} className="text-primary" />
          <span className="font-display text-sm font-bold text-primary">৳{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {(isPlaying || gameOver || cashedOut) && (
          <div className="flex items-center justify-between bg-card rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-[10px] text-muted-foreground">ফ্লোর</p>
              <p className="font-display font-bold text-foreground">{currentFloor}/{MAX_FLOORS}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">মাল্টি</p>
              <p className="font-display font-bold text-primary">{multiplier.toFixed(2)}x</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">পেআউট</p>
              <p className="font-display font-bold text-neon-green">৳{payout}</p>
            </div>
          </div>
        )}

        <div className="max-w-xs mx-auto space-y-2">
          {[...Array(MAX_FLOORS)].map((_, floorIdx) => {
            const fi = MAX_FLOORS - 1 - floorIdx;
            const isActive = isPlaying && fi === currentFloor;
            return (
              <div key={fi} className="flex gap-2">
                <span className="w-6 text-right text-xs text-muted-foreground font-display font-bold self-center">{fi + 1}</span>
                {floors[fi].map((cell, col) => (
                  <motion.button
                    key={col}
                    whileTap={isActive ? { scale: 0.9 } : {}}
                    onClick={() => selectTile(col)}
                    disabled={!isActive || loading}
                    className={`flex-1 h-12 rounded-lg flex items-center justify-center transition-all ${
                      cell === "safe" ? "bg-neon-green/20 border-2 border-neon-green"
                      : cell === "danger" ? "bg-neon-red/20 border-2 border-neon-red"
                      : isActive ? "bg-secondary border-2 border-primary/50 cursor-pointer hover:border-primary"
                      : "bg-secondary/50 border border-border"
                    }`}
                  >
                    {cell === "safe" && <Star size={18} className="text-neon-green" />}
                    {cell === "danger" && <Skull size={18} className="text-neon-red" />}
                  </motion.button>
                ))}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {gameOver && !cashedOut && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center bg-neon-red/10 border border-neon-red/30 rounded-xl p-4">
              <p className="font-display font-bold text-neon-red text-lg">💀 ধ্বংস! -৳{currentBet}</p>
            </motion.div>
          )}
          {cashedOut && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center bg-neon-green/10 border border-neon-green/30 rounded-xl p-4">
              <p className="font-display font-bold text-neon-green text-lg">✅ ক্যাশ আউট! +৳{payout}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          {!isPlaying && (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm">½</button>
                <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))} className="flex-1 bg-secondary rounded-lg px-3 py-2 text-foreground font-display text-center text-lg font-bold border-none outline-none" />
                <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm">2x</button>
              </div>
              <div className="flex gap-2">
                {quickBets.map((amt) => (
                  <button key={amt} onClick={() => setBetAmount(amt)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${betAmount === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>৳{amt}</button>
                ))}
              </div>
            </>
          )}
          {isPlaying ? (
            <Button onClick={cashOut} disabled={currentFloor === 0 || loading} className="w-full h-14 text-xl font-display font-black bg-neon-green hover:bg-neon-green/90 text-primary-foreground disabled:opacity-50">
              ক্যাশ আউট ৳{payout}
            </Button>
          ) : (
            <Button onClick={startGame} disabled={loading} className="w-full h-14 text-xl font-display font-black bg-gradient-gold disabled:opacity-50">
              {loading ? "লোডিং..." : `${gameOver || cashedOut ? "আবার খেলুন" : "শুরু করুন"} ৳${betAmount}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTower;
