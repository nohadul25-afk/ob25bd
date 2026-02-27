import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { SlotProvider, slotGames } from "@/data/slotGames";

const PROVIDER_TABS: { key: SlotProvider; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "JILI", label: "JILI" },
  { key: "PG", label: "PG" },
  { key: "SPRIBE", label: "SPRIBE" },
  { key: "PRAGMATIC", label: "PRAGMATIC" },
  { key: "BNG", label: "BNG" },
  { key: "JDB", label: "JDB" },
  { key: "SPADE", label: "SPADE" },
  { key: "SMARTSOFT", label: "SMARTSOFT" },
  { key: "MICROGAMING", label: "MG" },
  { key: "BT", label: "BT" },
  { key: "TRILUCK", label: "TRILUCK" },
];

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

const Slots = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState<SlotProvider>("ALL");
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<Record<string, true>>(() => loadFavs());

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return slotGames
      .filter((g) => (provider === "ALL" ? true : g.provider === provider))
      .filter((g) => {
        if (!qq) return true;
        const hay = `${g.name} ${g.provider} ${(g.tags || []).join(" ")}`.toLowerCase();
        return hay.includes(qq);
      });
  }, [provider, q]);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      saveFavs(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="h-14 flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="font-display text-lg font-bold text-gradient-gold">Slots</div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/favorites")}>
            <Heart size={18} />
          </Button>
        </div>

        {/* Provider tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {PROVIDER_TABS.map((t) => {
              const active = provider === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setProvider(t.key)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? "bg-gradient-gold text-primary-foreground border-transparent shadow-gold"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Game name"
              className="pl-9 bg-secondary border-border"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((g, idx) => {
            const isFav = !!favs[g.id];
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.01, 0.2) }}
                className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
              >
                {/* Faux artwork */}
                <div className="h-28 bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                  <div className="text-center px-2">
                    <div className="text-[11px] font-extrabold text-foreground line-clamp-2">
                      {g.name}
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground">
                      {g.provider}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleFav(g.id)}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    isFav
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-background/60 border-border text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Toggle favorite"
                >
                  <Heart size={16} className={isFav ? "fill-current" : ""} />
                </button>

                <div className="p-2">
                  <Button
                    variant="secondary"
                    className="w-full h-8 text-xs font-bold"
                    onClick={() => navigate("/" /* demo: open home / launcher */)}
                  >
                    Play
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">No games found</div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Slots;
