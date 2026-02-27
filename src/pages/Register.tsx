import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", referral: "" });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("সব ফিল্ড পূরণ করুন");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("পাসওয়ার্ড মিলছে না");
      return;
    }
    if (form.password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.name, phone: form.phone });
    setLoading(false);
    if (error) {
      toast.error(error.message || "নিবন্ধন ব্যর্থ হয়েছে");
    } else {
      if (form.referral.trim()) {
        setTimeout(async () => {
          try {
            const { data: session } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
            if (session?.session?.user) {
              await (await import("@/integrations/supabase/client")).supabase
                .from("profiles")
                .update({ referred_by: form.referral.trim().toUpperCase() })
                .eq("user_id", session.session.user.id);
            }
          } catch {}
        }, 2000);
      }
      toast.success("নিবন্ধন সফল! স্বাগতম!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold">
            <span className="font-display text-xl font-bold text-primary-foreground">OB</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gradient-gold tracking-wider">নিবন্ধন করুন</h1>
          <p className="text-muted-foreground text-sm mt-1">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="পূর্ণ নাম" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-10 bg-secondary border-border focus:border-primary h-12 text-foreground" />
          </div>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" placeholder="ইমেইল" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10 bg-secondary border-border focus:border-primary h-12 text-foreground" />
          </div>
          <div className="relative">
            <Smartphone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type="tel" placeholder="মোবাইল নম্বর (01XXXXXXXXX)" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="pl-10 bg-secondary border-border focus:border-primary h-12 text-foreground" />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input type={showPassword ? "text" : "password"} placeholder="পাসওয়ার্ড" value={form.password} onChange={(e) => update("password", e.target.value)} className="pl-10 pr-10 bg-secondary border-border focus:border-primary h-12 text-foreground" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Input type="password" placeholder="পাসওয়ার্ড নিশ্চিত করুন" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="bg-secondary border-border focus:border-primary h-12 text-foreground" />
          <Input placeholder="রেফারেল কোড (ঐচ্ছিক)" value={form.referral} onChange={(e) => update("referral", e.target.value)} className="bg-secondary border-border focus:border-primary h-12 text-foreground" />
          <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-gold text-primary-foreground font-display font-bold text-base shadow-gold hover:opacity-90 transition-opacity">
            {loading ? "নিবন্ধন হচ্ছে..." : "নিবন্ধন করুন"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">লগইন করুন</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
