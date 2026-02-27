import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Bonus = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="h-14 flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="font-display text-lg font-bold text-gradient-gold">Promotion</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Gift size={18} className="text-primary" />
          </div>
          <div>
            <div className="font-bold text-foreground">Daily Bonus</div>
            <div className="text-xs text-muted-foreground">Claim your daily reward from Profile → Daily Bonus</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy size={18} className="text-primary" />
          </div>
          <div>
            <div className="font-bold text-foreground">Events</div>
            <div className="text-xs text-muted-foreground">This page is ready for event banners & tasks.</div>
          </div>
        </div>

        <Button className="w-full" onClick={() => navigate("/slots")}>Browse Slots</Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Bonus;
