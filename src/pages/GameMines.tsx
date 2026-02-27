import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bomb, Gem, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { toast } from "sonner";

type CellState = "hidden" | "gem" | "mine";
const GRID_SIZE = 25;

const GameMines = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, placeBet } = useBalance();
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(5);
  const [grid, setGrid] = useState<CellState[]>(Array(GRID_SIZE).fill("hidden"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [betLoading, setBetLoading] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [revealing, setRevealing] = useState(false);

  const safeCount = GRID_SIZE - mineCount;
  const currentMultiplier = revealedCount === 0
    ? 1
    : Math.floor(Math.pow(GRID_SIZE / (GRID_SIZE - mineCount), revealedCount) * 0.97 * 100) / 100;
  const payout = Math.floor(currentBet * currentMultiplier);

  const startGame = async () => {
    if (!user) { navigate("/login"); return; }
    if (betAmount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }

    setBetLoading(true);
    try {
      const data = await placeBet({ action: "mines_start", bet_amount: betAmount, mine_count: mineCount });
      setSessionId(data.session_id);
      setGrid(Array(GRID_SIZE).fill("hidden"));
      setCurrentBet(betAmount);
      setIsPlaying(true);
      setGameOver(false);
      setCashedOut(false);
      setRevealedCount(0);
    } catch (err: any) {
      toast.error(err.message);
    }
    setBetLoading(false);
  };

  const revealCell = useCallback(
    async (index: number) => {
      if (!isPlaying || gameOver || revealing || grid[index] !== "hidden") return;

      setRevealing(true);
      try {
        // Send reveal request to server - server validates
        const data = await placeBet({ action: "mines_reveal", session_id: sessionId, cell_index: index });

        const newGrid = [...grid];
        if (data.is_mine) {
          // Hit a mine - server returns all mine positions
          newGrid[index] = "mine";
          const mines: number[] = data.mines || [];
          mines.forEach((m: number) => { newGrid[m] = "mine"; });
          setGrid(newGrid);
          setGameOver(true);
          setIsPlaying(false);
        } else {
          newGrid[index] = "gem";
          setGrid(newGrid);
          setRevealedCount(data.revealed_count);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
      setRevealing(false);
    },
    [grid, isPlaying, gameOver, placeBet, sessionId, revealing]
  );

  const cashOut = async () => {
    if (!isPlaying || revealedCount === 0) return;
    setCashedOut(true);
    setIsPlaying(false);
    try {
      const data = await placeBet({ action: "mines_cashout", session_id: sessionId });
      // Server returns mine positions on cashout
      const mines: number[] = data.mines || [];
      setGrid((prev) => {
        const newGrid = [...prev];
        mines.forEach((m: number) => { newGrid[m] = "mine"; });
        return newGrid;
      });
      toast.success(`+৳${data.win_amount} জিতেছেন!`);
    } catch (err: any) {
      toast.error(err.message);
      setCashedOut(false);
      setIsPlaying(true);
    }
  };

  const quickBets = [50, 100, 500, 1000, 5000];
  const mineOptions = [1, 3, 5, 10, 15];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2">
            <Bomb className="text-primary" size={20} />
            <h1 className="font-display text-lg font-bold text-foreground">মাইনস গেম</h1>
          </div>
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
              <p className="text-[10px] text-muted-foreground">মাল্টিপ্লায়ার</p>
              <p className="font-display font-bold text-primary">{currentMultiplier.toFixed(2)}x</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">জেমস পাওয়া</p>
              <p className="font-display font-bold text-foreground">{revealedCount}/{safeCount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">পেআউট</p>
              <p className="font-display font-bold text-neon-green">৳{payout}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
          {grid.map((cell, i) => (
            <motion.button
              key={i}
              whileTap={isPlaying && cell === "hidden" ? { scale: 0.9 } : {}}
              onClick={() => revealCell(i)}
              disabled={!isPlaying || cell !== "hidden" || revealing}
              className={`aspect-square rounded-xl flex items-center justify-center transition-all text-lg font-bold ${
                cell === "mine" ? "bg-neon-red/20 border-2 border-neon-red"
                : cell === "gem" ? "bg-neon-green/20 border-2 border-neon-green"
                : isPlaying ? "bg-secondary border border-border hover:border-primary/50 hover:bg-secondary/80 cursor-pointer"
                : "bg-secondary border border-border"
              }`}
            >
              <AnimatePresence mode="wait">
                {cell !== "hidden" ? (
                  <motion.div key="revealed" initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ type: "spring", stiffness: 300 }}>
                    {cell === "mine" ? <Bomb size={24} className="text-neon-red" /> : <Gem size={24} className="text-neon-green" />}
                  </motion.div>
                ) : isPlaying ? (
                  <motion.div key="hidden" className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                ) : null}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {gameOver && !cashedOut && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-neon-red/10 border border-neon-red/30 rounded-xl p-4">
              <Bomb className="text-neon-red mx-auto mb-1" size={28} />
              <p className="font-display font-bold text-neon-red text-lg">মাইন! -৳{currentBet}</p>
            </motion.div>
          )}
          {cashedOut && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-neon-green/10 border border-neon-green/30 rounded-xl p-4">
              <Shield className="text-neon-green mx-auto mb-1" size={28} />
              <p className="font-display font-bold text-neon-green text-lg">ক্যাশ আউট! +৳{payout}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          {!isPlaying && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">মাইন সংখ্যা</label>
              <div className="flex gap-2">
                {mineOptions.map((m) => (
                  <button key={m} onClick={() => setMineCount(m)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${mineCount === m ? "bg-neon-red/20 text-neon-red border border-neon-red/50" : "bg-secondary text-muted-foreground"}`}>{m}</button>
                ))}
              </div>
            </div>
          )}
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
            <Button onClick={cashOut} disabled={revealedCount === 0} className="w-full h-14 text-xl font-display font-black bg-neon-green hover:bg-neon-green/90 text-primary-foreground disabled:opacity-50">
              ক্যাশ আউট ৳{payout}
            </Button>
          ) : (
            <Button onClick={startGame} disabled={betLoading} className="w-full h-14 text-xl font-display font-black bg-gradient-gold disabled:opacity-50">
              {betLoading ? "লোডিং..." : `${gameOver || cashedOut ? "আবার খেলুন" : "খেলা শুরু"} ৳${betAmount}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameMines;
