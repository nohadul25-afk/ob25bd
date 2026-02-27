import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { toast } from "sonner";

// Draw a detailed airplane shape on canvas
function drawPlane(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, scale: number, crashed: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  // Engine glow / thrust
  if (!crashed) {
    const glowGrad = ctx.createRadialGradient(-28, 0, 2, -28, 0, 18);
    glowGrad.addColorStop(0, "hsla(30, 100%, 60%, 0.9)");
    glowGrad.addColorStop(0.4, "hsla(20, 100%, 50%, 0.5)");
    glowGrad.addColorStop(1, "hsla(0, 100%, 50%, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(-28, 0, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flame particles
    for (let i = 0; i < 3; i++) {
      const fx = -30 - Math.random() * 14;
      const fy = (Math.random() - 0.5) * 8;
      const fr = 1.5 + Math.random() * 2;
      ctx.fillStyle = `hsla(${30 + Math.random() * 20}, 100%, ${55 + Math.random() * 20}%, ${0.5 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fuselage
  const bodyGrad = ctx.createLinearGradient(0, -8, 0, 8);
  if (crashed) {
    bodyGrad.addColorStop(0, "hsl(0, 60%, 50%)");
    bodyGrad.addColorStop(1, "hsl(0, 50%, 35%)");
  } else {
    bodyGrad.addColorStop(0, "hsl(210, 20%, 95%)");
    bodyGrad.addColorStop(0.5, "hsl(210, 15%, 85%)");
    bodyGrad.addColorStop(1, "hsl(210, 10%, 70%)");
  }
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.quadraticCurveTo(26, -4, 20, -5);
  ctx.lineTo(-18, -5);
  ctx.quadraticCurveTo(-24, -4, -24, 0);
  ctx.quadraticCurveTo(-24, 4, -18, 5);
  ctx.lineTo(20, 5);
  ctx.quadraticCurveTo(26, 4, 24, 0);
  ctx.closePath();
  ctx.fill();

  // Cockpit window
  if (!crashed) {
    const cockpitGrad = ctx.createLinearGradient(18, -3, 22, 1);
    cockpitGrad.addColorStop(0, "hsl(200, 80%, 70%)");
    cockpitGrad.addColorStop(1, "hsl(200, 60%, 50%)");
    ctx.fillStyle = cockpitGrad;
    ctx.beginPath();
    ctx.moveTo(22, -1);
    ctx.quadraticCurveTo(20, -4, 16, -3);
    ctx.lineTo(16, 0);
    ctx.quadraticCurveTo(20, 1, 22, -1);
    ctx.closePath();
    ctx.fill();
  }

  // Wings
  const wingGrad = ctx.createLinearGradient(0, -20, 0, 20);
  if (crashed) {
    wingGrad.addColorStop(0, "hsl(0, 50%, 45%)");
    wingGrad.addColorStop(1, "hsl(0, 40%, 35%)");
  } else {
    wingGrad.addColorStop(0, "hsl(210, 15%, 80%)");
    wingGrad.addColorStop(1, "hsl(210, 10%, 65%)");
  }
  ctx.fillStyle = wingGrad;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(4, -5);
  ctx.lineTo(-6, -22);
  ctx.lineTo(-12, -20);
  ctx.lineTo(-8, -5);
  ctx.closePath();
  ctx.fill();
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(4, 5);
  ctx.lineTo(-6, 22);
  ctx.lineTo(-12, 20);
  ctx.lineTo(-8, 5);
  ctx.closePath();
  ctx.fill();

  // Tail fin
  ctx.fillStyle = crashed ? "hsl(0, 70%, 50%)" : "hsl(40, 90%, 55%)";
  ctx.beginPath();
  ctx.moveTo(-18, -5);
  ctx.lineTo(-24, -14);
  ctx.lineTo(-26, -13);
  ctx.lineTo(-22, -5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-18, 5);
  ctx.lineTo(-24, 14);
  ctx.lineTo(-26, 13);
  ctx.lineTo(-22, 5);
  ctx.closePath();
  ctx.fill();

  // Body stripe
  if (!crashed) {
    ctx.strokeStyle = "hsl(40, 90%, 55%)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-20, 0);
    ctx.stroke();
  }

  // Smoke/explosion on crash
  if (crashed) {
    for (let i = 0; i < 8; i++) {
      const sx = (Math.random() - 0.5) * 40;
      const sy = (Math.random() - 0.5) * 30;
      const sr = 3 + Math.random() * 6;
      ctx.fillStyle = `hsla(${Math.random() * 30}, 80%, ${40 + Math.random() * 20}%, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// Draw trail particles behind the plane
function drawTrail(ctx: CanvasRenderingContext2D, trail: { x: number; y: number; age: number }[]) {
  for (let i = 0; i < trail.length; i++) {
    const t = trail[i];
    const alpha = Math.max(0, 1 - t.age / 60);
    const size = Math.max(0.5, 3 * (1 - t.age / 60));
    ctx.fillStyle = `hsla(40, 90%, 55%, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const GameCrash = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, placeBet } = useBalance();
  const [betAmount, setBetAmount] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashOutAt, setCashOutAt] = useState(0);
  const [history, setHistory] = useState<{ mult: number; win: boolean }[]>([]);
  const [betLoading, setBetLoading] = useState(false);
  const animRef = useRef<number>(0);
  const startTime = useRef(0);
  const sessionId = useRef<string>("");
  const currentBet = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const frameCount = useRef(0);

  const getPlanePosition = useCallback((currentMult: number, w: number, h: number) => {
    const maxMult = Math.max(currentMult, 2);
    const progress = Math.min(1, (currentMult - 1) / (maxMult - 1 + 0.5));
    const x = 60 + progress * (w - 120);
    const y = h - 40 - progress * (h - 80);
    return { x, y };
  }, []);

  const drawScene = useCallback((currentMult: number, crashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = "hsla(220, 15%, 25%, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = h - (i / 5) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      // Grid labels
      ctx.fillStyle = "hsla(220, 15%, 50%, 0.5)";
      ctx.font = "20px sans-serif";
      ctx.fillText(`${(1 + i * 0.5).toFixed(1)}x`, 8, y - 4);
    }
    for (let i = 1; i < 6; i++) {
      const x = (i / 6) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Flight path curve
    const maxMult = Math.max(currentMult, 2);
    ctx.beginPath();
    ctx.strokeStyle = crashed ? "hsla(0, 85%, 55%, 0.6)" : "hsla(145, 80%, 50%, 0.4)";
    ctx.lineWidth = 3;
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const prog = i / steps;
      const t = prog * (currentMult - 1);
      const px = 60 + prog * (w - 120);
      const py = h - 40 - (t / (maxMult - 1 + 0.5)) * (h - 80);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Glow under curve
    if (!crashed && currentMult > 1.01) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const prog = i / steps;
        const t = prog * (currentMult - 1);
        const px = 60 + prog * (w - 120);
        const py = h - 40 - (t / (maxMult - 1 + 0.5)) * (h - 80);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const lastX = 60 + (w - 120);
      ctx.lineTo(lastX, h);
      ctx.lineTo(60, h);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, "hsla(145, 80%, 50%, 0.08)");
      gradient.addColorStop(1, "hsla(145, 80%, 50%, 0)");
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Trail
    drawTrail(ctx, trailRef.current);

    // Plane
    const pos = getPlanePosition(currentMult, w, h);
    const angle = crashed ? Math.PI * 0.4 : -Math.PI * 0.15 - Math.min(0.3, (currentMult - 1) * 0.05);
    const planeScale = Math.min(2.2, 1.6 + currentMult * 0.03);
    drawPlane(ctx, pos.x, pos.y, angle, planeScale, crashed);

    // Update trail
    frameCount.current++;
    if (!crashed && frameCount.current % 2 === 0) {
      trailRef.current.push({ x: pos.x - 20, y: pos.y + 5, age: 0 });
      if (trailRef.current.length > 40) trailRef.current.shift();
    }
    trailRef.current = trailRef.current.map(t => ({ ...t, age: t.age + 1 })).filter(t => t.age < 60);
  }, [getPlanePosition]);

  const maxVisualMult = 100;

  const animate = useCallback(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    const newMult = Math.floor(Math.pow(Math.E, elapsed * 0.15) * 100) / 100;

    if (newMult >= maxVisualMult) {
      setMultiplier(maxVisualMult);
      drawScene(maxVisualMult, false);
      return;
    }

    setMultiplier(newMult);
    drawScene(newMult, false);
    animRef.current = requestAnimationFrame(animate);
  }, [drawScene]);

  const startGame = async () => {
    if (!user) { navigate("/login"); return; }
    if (betAmount > balance) { toast.error("ব্যালেন্স পর্যাপ্ত নয়"); return; }

    setBetLoading(true);
    try {
      const data = await placeBet({ action: "crash_start", bet_amount: betAmount });
      sessionId.current = data.session_id;
      currentBet.current = betAmount;
      trailRef.current = [];
      frameCount.current = 0;
      setMultiplier(1.0);
      setIsPlaying(true);
      setIsCrashed(false);
      setCashedOut(false);
      setCashOutAt(0);
      startTime.current = Date.now();
      animRef.current = requestAnimationFrame(animate);
    } catch (err: any) {
      toast.error(err.message);
    }
    setBetLoading(false);
  };

  const cashOut = async () => {
    if (!isPlaying || isCrashed || cashedOut) return;
    cancelAnimationFrame(animRef.current);
    const mult = multiplier;
    setCashedOut(true);
    setCashOutAt(mult);
    setIsPlaying(false);
    try {
      const data = await placeBet({ action: "crash_cashout", session_id: sessionId.current, bet_amount: currentBet.current, multiplier: mult });
      setHistory((prev) => [{ mult, win: true }, ...prev.slice(0, 19)]);
      toast.success(`+৳${data.win_amount} জিতেছেন!`);
    } catch {
      setCashedOut(false);
      setIsCrashed(true);
      try {
        const lostData = await placeBet({ action: "crash_lost", session_id: sessionId.current, bet_amount: currentBet.current });
        if (lostData?.crash_point) {
          setMultiplier(lostData.crash_point);
          drawScene(lostData.crash_point, true);
          setHistory((prev) => [{ mult: lostData.crash_point, win: false }, ...prev.slice(0, 19)]);
        }
      } catch {}
      toast.error("ক্র্যাশ হয়ে গেছে!");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    }
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const quickBets = [50, 100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <h1 className="font-display text-lg font-bold text-foreground">Aviator</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg">
          <Wallet size={14} className="text-primary" />
          <span className="font-display text-sm font-bold text-primary">৳{balance.toFixed(2)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* History */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {history.map((h, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-xs font-display font-bold shrink-0 ${h.win ? "bg-neon-green/20 text-neon-green" : "bg-neon-red/20 text-neon-red"}`}>
              {h.mult.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Game canvas */}
        <div className="relative rounded-xl bg-card border border-border overflow-hidden" style={{ height: "300px" }}>
          <canvas ref={canvasRef} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              {isCrashed ? (
                <motion.div key="crashed" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  <p className="font-display text-5xl font-black text-neon-red drop-shadow-lg">{multiplier.toFixed(2)}x</p>
                  <p className="text-neon-red font-bold text-lg mt-1">ক্র্যাশ! 💥</p>
                </motion.div>
              ) : cashedOut ? (
                <motion.div key="cashed" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  <p className="font-display text-5xl font-black text-neon-green drop-shadow-lg">{cashOutAt.toFixed(2)}x</p>
                  <p className="text-neon-green font-bold text-lg mt-1">+৳{(currentBet.current * cashOutAt).toFixed(0)} ✅</p>
                </motion.div>
              ) : isPlaying ? (
                <motion.p key="playing" className="font-display text-6xl font-black text-foreground drop-shadow-lg" animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                  {multiplier.toFixed(2)}x
                </motion.p>
              ) : (
                <motion.div key="idle" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="text-5xl block mb-2">✈️</span>
                  <p className="text-muted-foreground font-body text-sm">বেট দিয়ে উড়ান শুরু করুন</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">বেটের পরিমাণ (৳)</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setBetAmount(Math.max(10, betAmount / 2))} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={isPlaying}>½</button>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))} className="flex-1 bg-secondary rounded-lg px-3 py-2 text-foreground font-display text-center text-lg font-bold border-none outline-none" disabled={isPlaying} />
              <button onClick={() => setBetAmount(betAmount * 2)} className="px-3 py-2 rounded-lg bg-secondary text-foreground font-bold text-sm" disabled={isPlaying}>2x</button>
            </div>
          </div>
          <div className="flex gap-2">
            {quickBets.map((amt) => (
              <button key={amt} onClick={() => setBetAmount(amt)} disabled={isPlaying} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${betAmount === amt ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>৳{amt}</button>
            ))}
          </div>
          {isPlaying ? (
            <Button onClick={cashOut} className="w-full h-14 text-xl font-display font-black bg-neon-green hover:bg-neon-green/90 text-primary-foreground">
              ক্যাশ আউট @ {multiplier.toFixed(2)}x
            </Button>
          ) : (
            <Button onClick={startGame} disabled={betLoading} className="w-full h-14 text-xl font-display font-black bg-gradient-gold disabled:opacity-50">
              {betLoading ? "লোডিং..." : `উড়ান শুরু ৳${betAmount}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCrash;
