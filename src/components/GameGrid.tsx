import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "./GameCard";
import { games } from "@/data/games";

interface GameGridProps {
  category: string;
}

const categoryLabels: Record<string, string> = {
  hot: "HOT GAMES",
  slots: "SLOTS",
  live: "LIVE CASINO",
  crash: "CRASH",
  sports: "SPORTS",
  cards: "CARD GAMES",
  fishing: "FISHING",
  popular: "POPULAR",
};

const GameGrid = ({ category }: GameGridProps) => {
  const filtered = games.filter((g) => g.category.includes(category));

  return (
    <div className="px-4 mt-4 pb-24">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-bold text-primary tracking-wide">
          {categoryLabels[category] || "GAMES"}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-bold px-2.5 py-1 rounded-md bg-card border border-border">See All</span>
          <button className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
            <ChevronLeft size={14} />
          </button>
          <button className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {filtered.map((game, i) => (
          <GameCard
            key={game.name + i}
            name={game.name}
            image={game.image}
            provider={game.provider}
            maxBet={game.maxBet}
            index={i}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No games in this category</p>
        </div>
      )}
    </div>
  );
};

export default GameGrid;
