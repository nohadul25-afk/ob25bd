import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import HeroBanner from "@/components/HeroBanner";
import QuickActions from "@/components/QuickActions";
import CategoryTabs from "@/components/CategoryTabs";
import GameGrid from "@/components/GameGrid";
import NoticeBar from "@/components/NoticeBar";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("hot");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <NoticeBar />
        <HeroBanner />
        <QuickActions />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <GameGrid category={activeCategory} />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
