import { Home, Megaphone, Grid3X3, Trophy, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Megaphone, label: "Promotion", path: "/bonus" },
  { icon: Grid3X3, label: "Slots", path: "/slots" },
  { icon: Trophy, label: "Reward", path: "/deposit" },
  { icon: User, label: "Member", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item, i) => {
          const isActive = location.pathname === item.path && (i === 0 || location.pathname !== "/");
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={20} className={isActive ? "glow-gold" : ""} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
