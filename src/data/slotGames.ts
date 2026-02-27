export type SlotProvider =
  | "ALL"
  | "JILI"
  | "PG"
  | "SPRIBE"
  | "PRAGMATIC"
  | "BNG"
  | "JDB"
  | "SPADE"
  | "SMARTSOFT"
  | "MICROGAMING"
  | "BT"
  | "TRILUCK";

export type SlotGame = {
  id: string;
  name: string;
  provider: Exclude<SlotProvider, "ALL">;
  // Optional tags for search
  tags?: string[];
};

// NOTE: These are catalog entries only (UI list). No third‑party artwork is bundled.
export const slotGames: SlotGame[] = [
  { id: "gates-of-olympus", name: "Gates of Olympus", provider: "PRAGMATIC", tags: ["olympus", "zeus"] },
  { id: "3-coin-treasures", name: "3 Coin Treasures", provider: "TRILUCK", tags: ["coin"] },
  { id: "super-hot-chilli", name: "Super Hot Chilli", provider: "BNG", tags: ["chilli", "hot"] },
  { id: "40-sparkling", name: "40 Sparkling", provider: "JILI", tags: ["777", "jackpot"] },
  { id: "dragon-gems-wheel", name: "Dragon Gems Wheel", provider: "JILI", tags: ["dragon", "wheel"] },
  { id: "3-pots-of-egypt", name: "3 Pots of Egypt", provider: "BNG", tags: ["egypt"] },
  { id: "ganesha", name: "Ganesha", provider: "PG", tags: ["india"] },
  { id: "speed-winner", name: "Speed Winner", provider: "PG", tags: ["racing"] },
  { id: "lucky-jaguar", name: "Lucky Jaguar", provider: "JILI", tags: ["jaguar"] },
  { id: "chicken", name: "Chicken", provider: "JILI", tags: ["bird"] },
  { id: "fortune-coins", name: "Fortune Coins", provider: "JILI", tags: ["coins"] },
  { id: "dreams-of-macau", name: "Dreams of Macau", provider: "PG", tags: ["macau"] },
  { id: "flyx", name: "FlyX", provider: "MICROGAMING", tags: ["crash"] },
  { id: "christmas-surprises-3", name: "Christmas Surprises 3", provider: "BT", tags: ["xmas"] },
  { id: "pinata-wins", name: "Pinata Wins", provider: "PG" },
  { id: "clover-coins-3x3", name: "Clover Coins 3x3", provider: "JILI" },
  { id: "super-ace-ii", name: "SuperAce II", provider: "JILI" },
  { id: "anubis-wrath", name: "Anubis Wrath", provider: "PG", tags: ["egypt"] },
  { id: "777-classic-style", name: "777 Classic Style", provider: "BT", tags: ["777"] },
  { id: "golden-empire", name: "Golden Empire", provider: "JILI" },
  { id: "ali-baba", name: "Ali Baba", provider: "JILI" },
  { id: "wild-bandito", name: "Wild Bandito", provider: "PG" },
  { id: "7up7down", name: "7up7down", provider: "JILI", tags: ["dice"] },
  { id: "legacy-of-egypt", name: "Legacy of Egypt", provider: "JILI", tags: ["egypt"] },
  { id: "chick-run", name: "Chick Run", provider: "JILI" },
  { id: "coin-up", name: "Coin Up", provider: "JILI" },
  { id: "seven-777", name: "7 777", provider: "JILI", tags: ["777"] },
  { id: "pirate-queen-2", name: "Pirate Queen 2", provider: "JILI", tags: ["pirate"] },
  { id: "diamond", name: "Diamond", provider: "JILI" },
  { id: "wild-ape", name: "Wild Ape", provider: "PG" },
  { id: "cocktail-nights", name: "Cocktail Nights", provider: "PG" },
  { id: "coin-tree", name: "Coin Tree", provider: "JILI" },
  { id: "888", name: "888", provider: "SPADE" },
  { id: "fortune-rabbit", name: "Fortune Rabbit", provider: "PG" },
  { id: "mines-slot", name: "Mines", provider: "JILI" },
  { id: "master-tiger", name: "Master Tiger", provider: "JILI" },
  { id: "dice-drop", name: "Dice Drop", provider: "JILI" },
  { id: "double-fortune", name: "Double Fortune", provider: "PG" },
  { id: "blossom-of-wealth", name: "Blossom of Wealth", provider: "JDB" },
  { id: "yakuza", name: "Yakuza", provider: "PG" },
  { id: "songkran-splash", name: "Songkran Splash", provider: "PG" },
  { id: "3-coin-volcanoes", name: "3 Coin Volcanoes", provider: "TRILUCK" },
  { id: "jungle-king", name: "Jungle King", provider: "JILI" },
  { id: "jackpot-joker", name: "Jackpot Joker", provider: "JILI" },
  { id: "jetx", name: "JetX", provider: "SMARTSOFT", tags: ["crash"] },
  { id: "aztec-priestess", name: "Aztec Priestess", provider: "JILI", tags: ["aztec"] },
  { id: "money-rush", name: "Money Rush", provider: "BT" },
  { id: "royale-house", name: "Royale House", provider: "SPADE" },
  { id: "mafia-mayhem", name: "Mafia Mayhem", provider: "PG" },
  { id: "jack", name: "Jack", provider: "PG" },
  { id: "midas-fortune", name: "Midas Fortune", provider: "PG" },
  { id: "leprechaun-riches", name: "Leprechaun Riches", provider: "PG" },
  { id: "kraken-gold-rush", name: "Kraken Gold Rush", provider: "PG" },
  { id: "safari-wilds", name: "Safari Wilds", provider: "PG" },
  { id: "bangla-beauty", name: "Bangla Beauty", provider: "JILI" },
  { id: "coins-hold-and-win", name: "Coins (Hold and Win)", provider: "JILI" },
  { id: "zombie-outbreak", name: "Zombie Outbreak", provider: "PG" },
  { id: "lucky-neko", name: "Lucky Neko", provider: "PG" },
  { id: "mahjong-ways", name: "Mahjong Ways", provider: "PG" },
  { id: "asgardian-rising", name: "Asgardian Rising", provider: "PG" },
  { id: "piggy-bank", name: "Piggy Bank", provider: "JDB" },
  { id: "power-sun", name: "Power Sun", provider: "BNG" },
  { id: "money-o", name: "Money O", provider: "JILI" },
  { id: "mystic-dragon", name: "Mystic Dragon", provider: "PG" },
  { id: "legend-of-pegasus", name: "Legend of Pegasus", provider: "PG" },
  { id: "go-rush", name: "Go Rush", provider: "JILI" },
  { id: "oishi-delights", name: "Oishi Delights", provider: "PG" },
  { id: "sugar-bang-bang-2", name: "Sugar Bang Bang 2", provider: "PG" },
];
