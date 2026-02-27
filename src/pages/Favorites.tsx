import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { slotGames } from "@/data/slotGames";

const FAV_KEY = "osamendi:fav_slots";

function loadFavs(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveFavs(favs: Record<string, true>) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favs, setFavs] = useState<Record<string, true>>(() => loadFavs());

  const list = useMemo(() => slotGames.filter((g) => !!favs[g.id]), [favs]);

  const removeFav = (id: string) => {
    setFavs((prev) => {
      const next = { ...prev };
      delete next[id];
      saveFavs(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="h-14 flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="font-display text-lg font-bold text-gradient-gold">Favorites</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 pt-4">
        {list.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">No favorites yet</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((g, idx) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.2) }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="h-24 bg-gradient-to-br from-secondary to-background flex items-center justify-center px-2">
                  <div className="text-center">
                    <div className="text-xs font-extrabold text-foreground line-clamp-2">{g.name}</div>
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground">{g.provider}</div>
                  </div>
                </div>
                <div className="p-2 flex gap-2">
                  <Button className="flex-1 h-8 text-xs font-bold" variant="secondary" onClick={() => navigate("/slots")}>
                    Browse
                  </Button>
                  <Button className="w-10 h-8" variant="outline" onClick={() => removeFav(g.id)}>
                    <Heart size={16} className="fill-current" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Favorites;
