import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Wallet, Bell, Gamepad2, CheckCircle, XCircle, Ban, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Tab = "users" | "deposits" | "withdrawals" | "notices";

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("deposits");
  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", type: "info" });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("আপনি অ্যাডমিন নন");
      navigate("/");
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, tab]);

  const loadData = async () => {
    if (tab === "users") {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers(data || []);
    } else if (tab === "deposits") {
      const { data } = await supabase.from("deposits").select("*").order("created_at", { ascending: false });
      setDeposits(data || []);
    } else if (tab === "withdrawals") {
      const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      setWithdrawals(data || []);
    } else if (tab === "notices") {
      const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
      setNotices(data || []);
    }
  };

  const approveDeposit = async (d: any) => {
    const { error } = await supabase.from("deposits").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", d.id);
    if (!error) {
      await supabase.from("profiles").update({
        balance: (await supabase.from("profiles").select("balance").eq("user_id", d.user_id).single()).data?.balance + d.amount,
        total_deposit: (await supabase.from("profiles").select("total_deposit").eq("user_id", d.user_id).single()).data?.total_deposit + d.amount,
      }).eq("user_id", d.user_id);
      toast.success("ডিপোজিট অ্যাপ্রুভ হয়েছে");
      loadData();
    }
  };

  const rejectDeposit = async (id: string) => {
    await supabase.from("deposits").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    toast.success("ডিপোজিট রিজেক্ট হয়েছে");
    loadData();
  };

  const approveWithdraw = async (w: any) => {
    const profile = (await supabase.from("profiles").select("balance").eq("user_id", w.user_id).single()).data;
    if (!profile || profile.balance < w.amount) {
      toast.error("ইউজারের পর্যাপ্ত ব্যালেন্স নেই");
      return;
    }
    await supabase.from("withdrawals").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", w.id);
    await supabase.from("profiles").update({
      balance: profile.balance - w.amount,
      total_withdraw: (await supabase.from("profiles").select("total_withdraw").eq("user_id", w.user_id).single()).data?.total_withdraw + w.amount,
    }).eq("user_id", w.user_id);
    toast.success("উইথড্র অ্যাপ্রুভ হয়েছে");
    loadData();
  };

  const rejectWithdraw = async (id: string) => {
    await supabase.from("withdrawals").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    toast.success("উইথড্র রিজেক্ট হয়েছে");
    loadData();
  };

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    await supabase.from("profiles").update({ is_banned: !currentBanned, ban_reason: currentBanned ? null : "অ্যাডমিন দ্বারা ব্যান" }).eq("user_id", userId);
    toast.success(currentBanned ? "ইউজার আনব্যান হয়েছে" : "ইউজার ব্যান হয়েছে");
    loadData();
  };

  const createNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) { toast.error("সব ফিল্ড পূরণ করুন"); return; }
    const { error } = await supabase.from("notices").insert(noticeForm);
    if (!error) {
      toast.success("নোটিশ তৈরি হয়েছে");
      setNoticeForm({ title: "", content: "", type: "info" });
      loadData();
    }
  };

  const deleteNotice = async (id: string) => {
    await supabase.from("notices").update({ is_active: false }).eq("id", id);
    toast.success("নোটিশ মুছে ফেলা হয়েছে");
    loadData();
  };

  const tabs = [
    { id: "deposits" as Tab, label: "ডিপোজিট", icon: Wallet, count: deposits.filter(d => d.status === "pending").length },
    { id: "withdrawals" as Tab, label: "উইথড্র", icon: Wallet, count: withdrawals.filter(w => w.status === "pending").length },
    { id: "users" as Tab, label: "ইউজার", icon: Users, count: users.length },
    { id: "notices" as Tab, label: "নোটিশ", icon: Bell, count: 0 },
  ];

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">লোড হচ্ছে...</p></div>;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4">
          <Link to="/profile" className="p-2 -ml-2"><ArrowLeft size={20} className="text-foreground" /></Link>
          <h1 className="font-display text-base font-bold text-gradient-gold ml-2">অ্যাডমিন প্যানেল</h1>
        </div>
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto hide-scrollbar">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <t.icon size={12} />
              {t.label}
              {t.count > 0 && <span className="ml-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* DEPOSITS TAB */}
        {tab === "deposits" && (
          <div className="space-y-3">
            <h2 className="font-display text-sm font-bold text-foreground">ডিপোজিট রিকোয়েস্ট</h2>
            {deposits.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কোনো রিকোয়েস্ট নেই</p>}
            {deposits.map((d) => (
              <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">৳{d.amount}</p>
                    <p className="text-xs text-muted-foreground">{d.payment_method} • {d.transaction_id}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">ID: {d.user_id.slice(0, 8)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.status === "pending" ? "bg-primary/20 text-primary" : d.status === "approved" ? "bg-neon-green/20 text-neon-green" : "bg-destructive/20 text-destructive"}`}>
                    {d.status === "pending" ? "পেন্ডিং" : d.status === "approved" ? "অ্যাপ্রুভড" : "রিজেক্টেড"}
                  </span>
                </div>
                {d.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => approveDeposit(d)} className="flex-1 h-8 bg-neon-green/20 text-neon-green hover:bg-neon-green/30 text-xs">
                      <CheckCircle size={12} className="mr-1" /> অ্যাপ্রুভ
                    </Button>
                    <Button size="sm" onClick={() => rejectDeposit(d.id)} className="flex-1 h-8 bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs">
                      <XCircle size={12} className="mr-1" /> রিজেক্ট
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {tab === "withdrawals" && (
          <div className="space-y-3">
            <h2 className="font-display text-sm font-bold text-foreground">উইথড্র রিকোয়েস্ট</h2>
            {withdrawals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">কোনো রিকোয়েস্ট নেই</p>}
            {withdrawals.map((w) => (
              <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">৳{w.amount}</p>
                    <p className="text-xs text-muted-foreground">{w.payment_method} • {w.account_number}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">ID: {w.user_id.slice(0, 8)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${w.status === "pending" ? "bg-primary/20 text-primary" : w.status === "approved" ? "bg-neon-green/20 text-neon-green" : "bg-destructive/20 text-destructive"}`}>
                    {w.status === "pending" ? "পেন্ডিং" : w.status === "approved" ? "অ্যাপ্রুভড" : "রিজেক্টেড"}
                  </span>
                </div>
                {w.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={() => approveWithdraw(w)} className="flex-1 h-8 bg-neon-green/20 text-neon-green hover:bg-neon-green/30 text-xs">
                      <CheckCircle size={12} className="mr-1" /> অ্যাপ্রুভ
                    </Button>
                    <Button size="sm" onClick={() => rejectWithdraw(w.id)} className="flex-1 h-8 bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs">
                      <XCircle size={12} className="mr-1" /> রিজেক্ট
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* USERS TAB */}
        {tab === "users" && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ইউজার খুঁজুন..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary border-border h-10 text-foreground text-sm" />
            </div>
            {users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone?.includes(searchQuery)).map((u) => (
              <div key={u.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{u.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{u.phone}</p>
                    <p className="text-[10px] text-muted-foreground">ব্যালেন্স: ৳{u.balance} • ডিপোজিট: ৳{u.total_deposit}</p>
                    {u.ip_address && <p className="text-[10px] text-muted-foreground">IP: {u.ip_address}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {u.is_banned && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/20 text-destructive">ব্যান</span>}
                    <button onClick={() => toggleBan(u.user_id, u.is_banned)}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${u.is_banned ? "bg-neon-green/20 text-neon-green" : "bg-destructive/20 text-destructive"}`}>
                      <Ban size={10} /> {u.is_banned ? "আনব্যান" : "ব্যান"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTICES TAB */}
        {tab === "notices" && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">নতুন নোটিশ তৈরি করুন</h3>
              <Input placeholder="শিরোনাম" value={noticeForm.title} onChange={(e) => setNoticeForm(f => ({ ...f, title: e.target.value }))} className="bg-secondary border-border h-10 text-foreground text-sm" />
              <textarea placeholder="বিষয়বস্তু" value={noticeForm.content} onChange={(e) => setNoticeForm(f => ({ ...f, content: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg p-3 text-sm text-foreground resize-none h-20 focus:border-primary outline-none" />
              <div className="flex gap-2">
                {["info", "warning", "promotion"].map((t) => (
                  <button key={t} onClick={() => setNoticeForm(f => ({ ...f, type: t }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${noticeForm.type === t ? "bg-gradient-gold text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {t === "info" ? "তথ্য" : t === "warning" ? "সতর্কতা" : "প্রমোশন"}
                  </button>
                ))}
              </div>
              <Button onClick={createNotice} className="w-full h-10 bg-gradient-gold text-primary-foreground font-semibold text-sm">নোটিশ পাঠান</Button>
            </div>
            {notices.map((n) => (
              <div key={n.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.content}</p>
                  </div>
                  <button onClick={() => deleteNotice(n.id)} className="text-[10px] text-destructive font-semibold">মুছুন</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
