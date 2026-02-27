import { Flame, Dice1, Tv, TrendingUp, Trophy, Gamepad2, Fish, Star } from "lucide-react";

const categories = [
  { id: "hot", label: "HOT GAMES", icon: Flame },
  { id: "slots", label: "SLOTS", icon: Dice1 },
  { id: "live", label: "LIVE", icon: Tv },
  { id: "crash", label: "CRASH", icon: TrendingUp },
  { id: "sports", label: "SPORTS", icon: Trophy },
  { id: "cards", label: "CARDS", icon: Gamepad2 },
  { id: "fishing", label: "FISHING", icon: Fish },
  { id: "popular", label: "POPULAR", icon: Star },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="px-4 mt-4">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-gold"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/50"
              }`}
            >
              <cat.icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
