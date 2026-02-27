import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NoticeBar = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from("notices").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setNotices(data || []));
  }, []);

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % notices.length), 4000);
    return () => clearInterval(timer);
  }, [notices.length]);

  if (notices.length === 0) return null;

  return (
    <div className="mx-4 mt-3 bg-secondary rounded-lg px-3 py-2 flex items-center gap-2 overflow-hidden">
      <Megaphone size={14} className="text-primary shrink-0" />
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-foreground truncate"
        >
          {notices[current]?.title}: {notices[current]?.content}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default NoticeBar;
