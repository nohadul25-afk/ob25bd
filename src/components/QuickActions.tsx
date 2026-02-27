import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <div className="px-4 mt-3">
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/deposit"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-teal border border-border text-foreground font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <ArrowDownToLine size={18} className="text-primary" />
          <span>Deposit</span>
        </Link>
        <Link
          to="/withdraw"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-teal border border-border text-foreground font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <ArrowUpFromLine size={18} className="text-primary" />
          <span>Withdraw</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
