import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mx-4 mt-4 rounded-xl overflow-hidden"
    >
      <img
        src={heroBanner}
        alt="OSAMENDI BET 25 Casino Banner"
        className="w-full h-40 sm:h-52 object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <h2 className="font-display text-lg font-bold text-gradient-gold">
          স্বাগতম বোনাস ১০০%
        </h2>
        <p className="text-foreground/80 text-sm mt-1">
          প্রথম ডিপোজিটে ১০০% বোনাস পান!
        </p>
      </div>
      {/* Decorative dots */}
      <div className="absolute bottom-2 right-4 flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
      </div>
    </motion.div>
  );
};

export default HeroBanner;
