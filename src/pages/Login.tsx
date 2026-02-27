import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Smartphone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("ইমেইল এবং পাসওয়ার্ড দিন");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || "লগইন ব্যর্থ হয়েছে");
    } else {
      toast.success("সফলভাবে লগইন হয়েছে!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
            <span className="font-display text-xl font-bold text-primary-foreground">OB</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gradient-gold tracking-wider">OSAMENDI BET 25</h1>
          <p className="text-muted-foreground text-sm mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" placeholder="ইমেইল" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-secondary border-border focus:border-primary h-12 text-foreground" />
          </div>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="পাসওয়ার্ড" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10 bg-secondary border-border focus:border-primary h-12 text-foreground" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-gold text-primary-foreground font-display font-bold text-base shadow-gold hover:opacity-90 transition-opacity">
            {loading ? "লগইন হচ্ছে..." : "লগইন"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            অ্যাকাউন্ট নেই?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">নিবন্ধন করুন</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
