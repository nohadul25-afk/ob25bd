import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import GameCrash from "./pages/GameCrash";
import GameDice from "./pages/GameDice";
import GameMines from "./pages/GameMines";
import GameWheel from "./pages/GameWheel";
import GamePlinko from "./pages/GamePlinko";
import GameTower from "./pages/GameTower";
import GameKeno from "./pages/GameKeno";
import Slots from "./pages/Slots";
import Favorites from "./pages/Favorites";
import Bonus from "./pages/Bonus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/slots" element={<Slots />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/bonus" element={<Bonus />} />
            <Route path="/game/crash" element={<GameCrash />} />
            <Route path="/game/dice" element={<GameDice />} />
            <Route path="/game/mines" element={<GameMines />} />
            <Route path="/game/wheel" element={<GameWheel />} />
            <Route path="/game/plinko" element={<GamePlinko />} />
            <Route path="/game/tower" element={<GameTower />} />
            <Route path="/game/keno" element={<GameKeno />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
