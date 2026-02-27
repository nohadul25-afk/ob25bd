import gameSlots from "@/assets/game-slots.jpg";
import gameRoulette from "@/assets/game-roulette.jpg";
import gameCrash from "@/assets/game-crash.jpg";
import gameCards from "@/assets/game-cards.jpg";
import gameSports from "@/assets/game-sports.jpg";
import gameDice from "@/assets/game-dice.jpg";
import gameFishing from "@/assets/game-fishing.jpg";
import gameWheel from "@/assets/game-wheel.jpg";
import gameDragon from "@/assets/game-dragon.jpg";
import gamePoker from "@/assets/game-poker.jpg";
import gameBaccarat from "@/assets/game-baccarat.jpg";
import gameCricket from "@/assets/game-cricket.jpg";
import gameMines from "@/assets/game-mines.jpg";
import gameTower from "@/assets/game-tower.jpg";
import gamePlinko from "@/assets/game-plinko.jpg";
import gameKeno from "@/assets/game-keno.jpg";

export interface GameData {
  name: string;
  image: string;
  provider: string;
  category: string[];
  maxBet: string;
}

const imgs = {
  slots: gameSlots,
  roulette: gameRoulette,
  crash: gameCrash,
  cards: gameCards,
  sports: gameSports,
  dice: gameDice,
  fishing: gameFishing,
  wheel: gameWheel,
  dragon: gameDragon,
  poker: gamePoker,
  baccarat: gameBaccarat,
  cricket: gameCricket,
  mines: gameMines,
  tower: gameTower,
  plinko: gamePlinko,
  keno: gameKeno,
};

export const games: GameData[] = [
  // HOT GAMES
  { name: "Burning Hot", image: imgs.slots, provider: "EGT", category: ["hot", "slots"], maxBet: "5000" },
  { name: "Aviator", image: imgs.crash, provider: "Spribe", category: ["hot", "crash", "popular"], maxBet: "5000" },
  { name: "Dragon Tiger", image: imgs.dragon, provider: "SA Gaming", category: ["hot", "live", "cards"], maxBet: "8000" },
  { name: "Live Roulette", image: imgs.roulette, provider: "Evolution", category: ["hot", "live"], maxBet: "10000" },
  { name: "Fortune Wheel", image: imgs.wheel, provider: "NetEnt", category: ["hot", "slots"], maxBet: "1000" },
  { name: "Crash Rocket", image: imgs.crash, provider: "Spribe", category: ["hot", "crash"], maxBet: "2000" },
  { name: "Blackjack VIP", image: imgs.cards, provider: "Pragmatic", category: ["hot", "cards"], maxBet: "8000" },
  { name: "Plinko Ball", image: imgs.plinko, provider: "BGaming", category: ["hot", "crash"], maxBet: "3000" },
  { name: "Lucky Dice", image: imgs.dice, provider: "BGaming", category: ["hot", "slots"], maxBet: "3000" },
  { name: "Mines Gold", image: imgs.mines, provider: "Spribe", category: ["hot", "crash"], maxBet: "2000" },

  // SLOTS
  { name: "Lucky Slot 777", image: imgs.slots, provider: "Novomatic", category: ["slots", "popular"], maxBet: "4000" },
  { name: "Fruit Bonanza", image: imgs.slots, provider: "Play'n Go", category: ["slots"], maxBet: "2000" },
  { name: "Golden Dice", image: imgs.dice, provider: "EGT", category: ["slots"], maxBet: "4500" },
  { name: "Spin Wheel", image: imgs.wheel, provider: "Red Tiger", category: ["slots"], maxBet: "1500" },
  { name: "Book of Ra", image: imgs.dragon, provider: "Novomatic", category: ["slots"], maxBet: "5000" },
  { name: "Starburst", image: imgs.wheel, provider: "NetEnt", category: ["slots"], maxBet: "2500" },
  { name: "Mega Moolah", image: imgs.dragon, provider: "Microgaming", category: ["slots", "popular"], maxBet: "6000" },
  { name: "Gonzo's Quest", image: imgs.tower, provider: "NetEnt", category: ["slots"], maxBet: "3000" },
  { name: "Dead or Alive", image: imgs.cards, provider: "NetEnt", category: ["slots"], maxBet: "4000" },
  { name: "Sweet Bonanza", image: imgs.wheel, provider: "Pragmatic", category: ["slots", "popular"], maxBet: "5000" },
  { name: "Gates of Olympus", image: imgs.tower, provider: "Pragmatic", category: ["slots", "popular"], maxBet: "5000" },
  { name: "Wolf Gold", image: imgs.dragon, provider: "Pragmatic", category: ["slots"], maxBet: "3500" },
  { name: "Big Bass Bonanza", image: imgs.fishing, provider: "Pragmatic", category: ["slots"], maxBet: "2500" },
  { name: "Eye of Horus", image: imgs.dragon, provider: "Blueprint", category: ["slots"], maxBet: "4000" },
  { name: "Reactoonz", image: imgs.wheel, provider: "Play'n Go", category: ["slots"], maxBet: "3000" },
  { name: "Rise of Merlin", image: imgs.tower, provider: "Play'n Go", category: ["slots"], maxBet: "2000" },
  { name: "Legacy of Dead", image: imgs.dragon, provider: "Play'n Go", category: ["slots"], maxBet: "4500" },
  { name: "Fire Joker", image: imgs.dice, provider: "Play'n Go", category: ["slots"], maxBet: "1500" },
  { name: "Razor Shark", image: imgs.fishing, provider: "Push Gaming", category: ["slots"], maxBet: "5000" },
  { name: "Jammin Jars", image: imgs.wheel, provider: "Push Gaming", category: ["slots"], maxBet: "3000" },

  // LIVE CASINO
  { name: "Lightning Roulette", image: imgs.roulette, provider: "Evolution", category: ["live", "popular"], maxBet: "15000" },
  { name: "Baccarat VIP", image: imgs.baccarat, provider: "Evolution", category: ["live", "cards"], maxBet: "20000" },
  { name: "Mega Wheel", image: imgs.wheel, provider: "Pragmatic", category: ["live", "popular"], maxBet: "8000" },
  { name: "Live Poker", image: imgs.poker, provider: "Evolution", category: ["live", "cards"], maxBet: "12000" },
  { name: "Speed Baccarat", image: imgs.baccarat, provider: "Evolution", category: ["live"], maxBet: "10000" },
  { name: "Crazy Time", image: imgs.wheel, provider: "Evolution", category: ["live", "popular"], maxBet: "5000" },
  { name: "Dream Catcher", image: imgs.wheel, provider: "Evolution", category: ["live"], maxBet: "3000" },
  { name: "Auto Roulette", image: imgs.roulette, provider: "Evolution", category: ["live"], maxBet: "8000" },
  { name: "Casino Hold'em", image: imgs.poker, provider: "Evolution", category: ["live", "cards"], maxBet: "6000" },
  { name: "Sic Bo", image: imgs.dice, provider: "Evolution", category: ["live"], maxBet: "5000" },
  { name: "Monopoly Live", image: imgs.wheel, provider: "Evolution", category: ["live", "popular"], maxBet: "4000" },
  { name: "Football Studio", image: imgs.sports, provider: "Evolution", category: ["live", "sports"], maxBet: "3000" },
  { name: "Fan Tan", image: imgs.dice, provider: "Evolution", category: ["live"], maxBet: "5000" },
  { name: "Lightning Baccarat", image: imgs.baccarat, provider: "Evolution", category: ["live"], maxBet: "15000" },
  { name: "Instant Roulette", image: imgs.roulette, provider: "Evolution", category: ["live"], maxBet: "10000" },

  // CRASH GAMES
  { name: "Speed Crash", image: imgs.crash, provider: "Turbo Games", category: ["crash"], maxBet: "2500" },
  { name: "JetX", image: imgs.crash, provider: "SmartSoft", category: ["crash"], maxBet: "3000" },
  { name: "Spaceman", image: imgs.crash, provider: "Pragmatic", category: ["crash"], maxBet: "4000" },
  { name: "Balloon", image: imgs.crash, provider: "SmartSoft", category: ["crash"], maxBet: "2000" },
  { name: "Tower Rush", image: imgs.tower, provider: "EvoPlay", category: ["crash"], maxBet: "3500" },
  { name: "Lucky Crumbling", image: imgs.crash, provider: "EvoPlay", category: ["crash"], maxBet: "2000" },
  { name: "Cappadocia", image: imgs.crash, provider: "SmartSoft", category: ["crash"], maxBet: "3000" },
  { name: "Mine Strike", image: imgs.mines, provider: "Spribe", category: ["crash", "popular"], maxBet: "5000" },
  { name: "Dice Duel", image: imgs.dice, provider: "Spribe", category: ["crash"], maxBet: "2500" },
  { name: "Hi-Lo Crash", image: imgs.crash, provider: "Spribe", category: ["crash"], maxBet: "1500" },
  { name: "Keno Classic", image: imgs.keno, provider: "Spribe", category: ["crash"], maxBet: "2000" },
  { name: "Limbo", image: imgs.crash, provider: "Spribe", category: ["crash"], maxBet: "3000" },

  // SPORTS
  { name: "Football Bet", image: imgs.sports, provider: "BetRadar", category: ["sports"], maxBet: "15000" },
  { name: "Cricket Bet", image: imgs.cricket, provider: "BetRadar", category: ["sports", "popular"], maxBet: "20000" },
  { name: "Kabaddi Bet", image: imgs.sports, provider: "Betsoft", category: ["sports"], maxBet: "10000" },
  { name: "Basketball Live", image: imgs.sports, provider: "BetRadar", category: ["sports"], maxBet: "12000" },
  { name: "Tennis Match", image: imgs.sports, provider: "BetRadar", category: ["sports"], maxBet: "8000" },
  { name: "IPL Betting", image: imgs.cricket, provider: "BetRadar", category: ["sports", "popular"], maxBet: "25000" },
  { name: "BPL Live", image: imgs.cricket, provider: "BetRadar", category: ["sports"], maxBet: "15000" },
  { name: "Horse Racing", image: imgs.sports, provider: "BetRadar", category: ["sports"], maxBet: "10000" },
  { name: "E-Sports DOTA", image: imgs.sports, provider: "BetRadar", category: ["sports"], maxBet: "5000" },
  { name: "Boxing Bet", image: imgs.sports, provider: "BetRadar", category: ["sports"], maxBet: "8000" },

  // CARD GAMES
  { name: "Hi-Lo Card", image: imgs.cards, provider: "Microgaming", category: ["cards"], maxBet: "1500" },
  { name: "Andar Bahar", image: imgs.cards, provider: "Ezugi", category: ["cards", "live", "popular"], maxBet: "5000" },
  { name: "Teen Patti", image: imgs.cards, provider: "Ezugi", category: ["cards", "popular"], maxBet: "3000" },
  { name: "Texas Poker", image: imgs.poker, provider: "Microgaming", category: ["cards"], maxBet: "8000" },
  { name: "3 Card Poker", image: imgs.poker, provider: "Evolution", category: ["cards"], maxBet: "5000" },
  { name: "Brag Card", image: imgs.cards, provider: "Playtech", category: ["cards"], maxBet: "2000" },
  { name: "Red Dog", image: imgs.cards, provider: "Microgaming", category: ["cards"], maxBet: "3000" },
  { name: "Pai Gow", image: imgs.cards, provider: "Playtech", category: ["cards"], maxBet: "4000" },
  { name: "War Card", image: imgs.cards, provider: "Betsoft", category: ["cards"], maxBet: "2500" },
  { name: "Punto Banco", image: imgs.baccarat, provider: "NetEnt", category: ["cards"], maxBet: "10000" },
  { name: "Caribbean Stud", image: imgs.poker, provider: "NetEnt", category: ["cards"], maxBet: "6000" },
  { name: "Solitaire Bet", image: imgs.cards, provider: "BGaming", category: ["cards"], maxBet: "1000" },

  // FISHING
  { name: "Golden Fish", image: imgs.fishing, provider: "JDB", category: ["fishing"], maxBet: "5000" },
  { name: "Fishing War", image: imgs.fishing, provider: "Spadegaming", category: ["fishing"], maxBet: "3000" },
  { name: "Ocean King", image: imgs.fishing, provider: "JDB", category: ["fishing", "popular"], maxBet: "7000" },
  { name: "Mega Fishing", image: imgs.fishing, provider: "JDB", category: ["fishing"], maxBet: "4000" },
  { name: "All Star Fishing", image: imgs.fishing, provider: "JDB", category: ["fishing"], maxBet: "5000" },
  { name: "Dragon Fishing", image: imgs.fishing, provider: "Spadegaming", category: ["fishing"], maxBet: "6000" },
  { name: "Treasure Fishing", image: imgs.fishing, provider: "JDB", category: ["fishing"], maxBet: "3500" },
  { name: "Cai Shen Fishing", image: imgs.fishing, provider: "JDB", category: ["fishing"], maxBet: "4500" },
  { name: "Shark Hunt", image: imgs.fishing, provider: "Spadegaming", category: ["fishing"], maxBet: "8000" },
  { name: "Fish Hunt Pro", image: imgs.fishing, provider: "JDB", category: ["fishing"], maxBet: "5000" },

  // POPULAR
  { name: "Dice Roll", image: imgs.dice, provider: "Hacksaw", category: ["popular", "slots"], maxBet: "3500" },
  { name: "Jackpot 6000", image: imgs.slots, provider: "NetEnt", category: ["popular", "slots"], maxBet: "6000" },
  { name: "Mega Fortune", image: imgs.wheel, provider: "NetEnt", category: ["popular", "slots"], maxBet: "8000" },
  { name: "Hall of Gods", image: imgs.dragon, provider: "NetEnt", category: ["popular", "slots"], maxBet: "5000" },
  { name: "Arabian Nights", image: imgs.tower, provider: "NetEnt", category: ["popular", "slots"], maxBet: "4000" },
  { name: "Divine Fortune", image: imgs.dragon, provider: "NetEnt", category: ["popular", "slots"], maxBet: "5500" },
  { name: "Treasure Mine", image: imgs.mines, provider: "Red Tiger", category: ["popular", "slots"], maxBet: "3000" },
  { name: "Crystal Ball", image: imgs.wheel, provider: "Bally", category: ["popular", "slots"], maxBet: "2000" },
  { name: "Lucky Leprechaun", image: imgs.dice, provider: "iSoftBet", category: ["popular", "slots"], maxBet: "2500" },
  { name: "Pharaoh Gold", image: imgs.dragon, provider: "Pragmatic", category: ["popular", "slots"], maxBet: "4000" },
];
