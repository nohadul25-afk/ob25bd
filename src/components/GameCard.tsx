import { motion } from "framer-motion";
import { Heart, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  name: string;
  image: string;
  provider: string;
  maxBet?: string;
  index: number;
}

const gameRouteMap: Record<string, string> = {
  "Aviator": "/game/crash", "Crash Rocket": "/game/crash", "Speed Crash": "/game/crash",
  "JetX": "/game/crash", "Spaceman": "/game/crash", "Balloon": "/game/crash",
  "Lucky Crumbling": "/game/crash", "Cappadocia": "/game/crash", "Hi-Lo Crash": "/game/crash", "Limbo": "/game/crash",
  "Lucky Dice": "/game/dice", "Golden Dice": "/game/dice", "Dice Roll": "/game/dice",
  "Dice Duel": "/game/dice", "Fire Joker": "/game/dice", "Sic Bo": "/game/dice", "Fan Tan": "/game/dice",
  "Mines Gold": "/game/mines", "Mine Strike": "/game/mines", "Treasure Mine": "/game/mines",
  "Fortune Wheel": "/game/wheel", "Mega Wheel": "/game/wheel", "Crazy Time": "/game/wheel",
  "Dream Catcher": "/game/wheel", "Monopoly Live": "/game/wheel", "Spin Wheel": "/game/wheel",
  "Crystal Ball": "/game/wheel", "Mega Fortune": "/game/wheel",
  "Plinko Ball": "/game/plinko",
  "Tower Rush": "/game/tower", "Gonzo's Quest": "/game/tower", "Rise of Merlin": "/game/tower", "Arabian Nights": "/game/tower",
  "Keno Classic": "/game/keno", "Lucky Leprechaun": "/game/keno",
  "Burning Hot": "/game/wheel", "Lucky Slot 777": "/game/wheel", "Fruit Bonanza": "/game/wheel",
  "Starburst": "/game/wheel", "Jackpot 6000": "/game/wheel", "Sweet Bonanza": "/game/wheel",
  "Gates of Olympus": "/game/wheel", "Book of Ra": "/game/wheel", "Mega Moolah": "/game/wheel",
  "Wolf Gold": "/game/wheel", "Dead or Alive": "/game/wheel", "Reactoonz": "/game/wheel",
  "Legacy of Dead": "/game/wheel", "Razor Shark": "/game/wheel", "Jammin Jars": "/game/wheel",
  "Big Bass Bonanza": "/game/wheel", "Eye of Horus": "/game/wheel",
  "Lightning Roulette": "/game/wheel", "Live Roulette": "/game/wheel",
  "Auto Roulette": "/game/wheel", "Instant Roulette": "/game/wheel",
  "Baccarat VIP": "/game/dice", "Speed Baccarat": "/game/dice", "Lightning Baccarat": "/game/dice",
  "Live Poker": "/game/dice", "Casino Hold'em": "/game/dice",
  "Hi-Lo Card": "/game/dice", "Andar Bahar": "/game/dice", "Teen Patti": "/game/dice",
  "Texas Poker": "/game/dice", "3 Card Poker": "/game/dice", "Brag Card": "/game/dice",
  "Red Dog": "/game/dice", "Pai Gow": "/game/dice", "War Card": "/game/dice",
  "Punto Banco": "/game/dice", "Caribbean Stud": "/game/dice", "Solitaire Bet": "/game/dice",
  "Blackjack VIP": "/game/dice", "Dragon Tiger": "/game/dice",
  "Golden Fish": "/game/mines", "Fishing War": "/game/mines", "Ocean King": "/game/mines",
  "Mega Fishing": "/game/mines", "All Star Fishing": "/game/mines", "Dragon Fishing": "/game/mines",
  "Treasure Fishing": "/game/mines", "Cai Shen Fishing": "/game/mines", "Shark Hunt": "/game/mines", "Fish Hunt Pro": "/game/mines",
  "Football Bet": "/game/crash", "Cricket Bet": "/game/crash", "Kabaddi Bet": "/game/crash",
  "Basketball Live": "/game/crash", "Tennis Match": "/game/crash", "IPL Betting": "/game/crash",
  "BPL Live": "/game/crash", "Horse Racing": "/game/crash", "E-Sports DOTA": "/game/crash", "Boxing Bet": "/game/crash",
  "Football Studio": "/game/crash",
  "Hall of Gods": "/game/tower", "Divine Fortune": "/game/wheel", "Pharaoh Gold": "/game/tower",
};

const GameCard = ({ name, image, provider, maxBet, index }: GameCardProps) => {
  const navigate = useNavigate();
  const route = gameRouteMap[name];

  const handleClick = () => {
    if (route) navigate(route);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      onClick={handleClick}
      className="group relative rounded-xl overflow-hidden bg-card cursor-pointer"
    >
      <div className="aspect-square relative overflow-hidden rounded-xl">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Favorite heart */}
        <div className="absolute top-1.5 right-1.5">
          <Heart size={16} className="text-primary/70 drop-shadow-md" />
        </div>
        {/* Provider badge */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-background/70 backdrop-blur-sm">
          <span className="text-[9px] font-bold text-foreground uppercase">{provider}</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <Play size={16} className="text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <div className="px-1.5 py-1.5">
        <h3 className="text-[11px] font-bold text-foreground truncate">{name}</h3>
        <p className="text-[9px] text-muted-foreground uppercase">{provider}</p>
      </div>
    </motion.div>
  );
};

export default GameCard;
