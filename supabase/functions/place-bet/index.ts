import { createClient } from "https://esm.sh/@supabase/supabase-js@2.96.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function errorResponse(msg: string, status = 400) {
  return jsonResponse({ error: msg }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return errorResponse("Unauthorized", 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return errorResponse("Unauthorized", 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action } = body;

    // Validate action
    const validActions = ["crash_start", "crash_cashout", "crash_lost", "dice", "mines_start", "mines_reveal", "mines_cashout", "mines_lost", "wheel", "plinko", "tower_start", "tower_climb", "tower_cashout", "keno", "daily_bonus", "claim_referral"];
    if (!action || !validActions.includes(action)) {
      return errorResponse("Invalid action");
    }

    // Validate bet_amount for actions that need it
    const betActions = ["crash_start", "dice", "mines_start", "wheel", "plinko", "tower_start", "keno"];
    const bet_amount = Number(body.bet_amount);
    if (betActions.includes(action)) {
      if (!Number.isFinite(bet_amount) || bet_amount < 10 || bet_amount > 50000) {
        return errorResponse("Invalid bet amount");
      }
    }

    // Fetch profile
    const { data: profile, error: profErr } = await admin.from("profiles").select("balance, is_banned, turnover, total_earnings, total_loss, bonus_balance").eq("user_id", user.id).single();
    if (profErr || !profile) return errorResponse("Unable to process request");
    if (profile.is_banned) return errorResponse("Account access restricted", 403);

    if (betActions.includes(action) && profile.balance < bet_amount) {
      return errorResponse("Insufficient balance");
    }

    // ========== CRASH GAME ==========
    if (action === "crash_start") {
      const r = Math.random();
      const crashPoint = Math.max(1.0, Math.floor((1 / (1 - r)) * 100) / 100);

      // Store crash point server-side in game_sessions - NOT returned to client
      const { data: session } = await admin.from("game_sessions").insert({
        user_id: user.id,
        game_type: "crash",
        bet_amount,
        game_state: { crash_point: crashPoint },
        status: "active",
      }).select("id").single();

      await admin.from("profiles").update({
        balance: profile.balance - bet_amount,
        turnover: (profile.turnover || 0) + bet_amount,
      }).eq("user_id", user.id);

      // Return session_id but NOT crash_point
      return jsonResponse({ success: true, session_id: session?.id, new_balance: profile.balance - bet_amount });

    } else if (action === "crash_cashout") {
      const session_id = body.session_id;
      const multiplier = Number(body.multiplier);

      if (!session_id || typeof session_id !== "string") return errorResponse("Invalid session");
      if (!Number.isFinite(multiplier) || multiplier < 1.0 || multiplier > 1000) return errorResponse("Invalid multiplier");

      // Fetch game session and validate
      const { data: session } = await admin.from("game_sessions").select("*").eq("id", session_id).eq("user_id", user.id).eq("status", "active").eq("game_type", "crash").single();
      if (!session) return errorResponse("Invalid or expired session");

      const crashPoint = (session.game_state as any).crash_point;

      // Validate that cashout multiplier is less than crash point
      if (multiplier >= crashPoint) {
        return errorResponse("Invalid cashout - game already crashed");
      }

      const win_amount = Math.floor(session.bet_amount * multiplier);

      // Close session
      await admin.from("game_sessions").update({ status: "completed", game_state: { ...session.game_state as any, cashout_at: multiplier } }).eq("id", session_id);

      const { data: cp } = await admin.from("profiles").select("balance, total_earnings").eq("user_id", user.id).single();
      await admin.from("profiles").update({
        balance: (cp?.balance || 0) + win_amount,
        total_earnings: (cp?.total_earnings || 0) + (win_amount - session.bet_amount),
      }).eq("user_id", user.id);

      await admin.from("bet_history").insert({ user_id: user.id, bet_amount: session.bet_amount, win_amount, result: "win" });

      const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();
      return jsonResponse({ success: true, win_amount, new_balance: up?.balance || 0 });

    } else if (action === "crash_lost") {
      const session_id = body.session_id;
      if (!session_id || typeof session_id !== "string") return errorResponse("Invalid session");

      const { data: session } = await admin.from("game_sessions").select("*").eq("id", session_id).eq("user_id", user.id).eq("status", "active").eq("game_type", "crash").single();
      if (!session) return errorResponse("Invalid or expired session");

      // Close session
      await admin.from("game_sessions").update({ status: "crashed" }).eq("id", session_id);

      const { data: cp } = await admin.from("profiles").select("total_loss").eq("user_id", user.id).single();
      await admin.from("profiles").update({ total_loss: (cp?.total_loss || 0) + session.bet_amount }).eq("user_id", user.id);
      await admin.from("bet_history").insert({ user_id: user.id, bet_amount: session.bet_amount, win_amount: 0, result: "loss" });

      const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();
      return jsonResponse({ success: true, crash_point: (session.game_state as any).crash_point, new_balance: up?.balance || 0 });

    // ========== DICE GAME ==========
    } else if (action === "dice") {
      const target = Number(body.target);
      const is_over = body.is_over;

      // Strict validation
      if (!Number.isFinite(target) || target < 5 || target > 95) return errorResponse("Invalid target");
      if (typeof is_over !== "boolean") return errorResponse("Invalid parameters");

      const roll = Math.floor(Math.random() * 10001) / 100;
      const didWin = is_over ? roll > target : roll < target;
      const winChance = is_over ? 100 - target : target;
      const mult = Math.max(1.01, Math.floor((98 / winChance) * 100) / 100);

      let win_amount = 0;
      if (didWin) win_amount = Math.floor(bet_amount * mult);

      const newBalance = profile.balance - bet_amount + win_amount;
      const updateData: Record<string, number> = {
        balance: newBalance,
        turnover: (profile.turnover || 0) + bet_amount,
      };

      if (didWin) {
        updateData.total_earnings = (profile.total_earnings || 0) + (win_amount - bet_amount);
      } else {
        updateData.total_loss = (profile.total_loss || 0) + bet_amount;
      }

      await admin.from("profiles").update(updateData).eq("user_id", user.id);
      await admin.from("bet_history").insert({ user_id: user.id, bet_amount, win_amount, result: didWin ? "win" : "loss" });

      return jsonResponse({ success: true, roll, did_win: didWin, multiplier: mult, win_amount, new_balance: newBalance });

    // ========== MINES GAME ==========
    } else if (action === "mines_start") {
      const mine_count = Number(body.mine_count);
      if (!Number.isFinite(mine_count) || mine_count < 1 || mine_count > 24) return errorResponse("Invalid mine count");

      const gridSize = 25;
      const mines = new Set<number>();
      while (mines.size < mine_count) {
        mines.add(Math.floor(Math.random() * gridSize));
      }

      // Store mines server-side only - NOT returned to client
      const { data: session } = await admin.from("game_sessions").insert({
        user_id: user.id,
        game_type: "mines",
        bet_amount,
        game_state: { mines: Array.from(mines), mine_count, revealed: [] },
        status: "active",
      }).select("id").single();

      await admin.from("profiles").update({
        balance: profile.balance - bet_amount,
        turnover: (profile.turnover || 0) + bet_amount,
      }).eq("user_id", user.id);

      // Return session_id but NOT mine positions
      return jsonResponse({ success: true, session_id: session?.id, new_balance: profile.balance - bet_amount, mine_count });

    } else if (action === "mines_reveal") {
      const session_id = body.session_id;
      const cell_index = Number(body.cell_index);

      if (!session_id || typeof session_id !== "string") return errorResponse("Invalid session");
      if (!Number.isFinite(cell_index) || cell_index < 0 || cell_index > 24) return errorResponse("Invalid cell");

      const { data: session } = await admin.from("game_sessions").select("*").eq("id", session_id).eq("user_id", user.id).eq("status", "active").eq("game_type", "mines").single();
      if (!session) return errorResponse("Invalid or expired session");

      const gameState = session.game_state as any;
      const mines: number[] = gameState.mines;
      const revealed: number[] = gameState.revealed || [];

      if (revealed.includes(cell_index)) return errorResponse("Cell already revealed");

      const isMine = mines.includes(cell_index);
      revealed.push(cell_index);

      if (isMine) {
        // Game over - loss
        await admin.from("game_sessions").update({ status: "lost", game_state: { ...gameState, revealed } }).eq("id", session_id);

        const { data: cp } = await admin.from("profiles").select("total_loss").eq("user_id", user.id).single();
        await admin.from("profiles").update({ total_loss: (cp?.total_loss || 0) + session.bet_amount }).eq("user_id", user.id);
        await admin.from("bet_history").insert({ user_id: user.id, bet_amount: session.bet_amount, win_amount: 0, result: "loss" });

        const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();
        return jsonResponse({ success: true, is_mine: true, mines, new_balance: up?.balance || 0 });
      } else {
        // Safe - update revealed list
        await admin.from("game_sessions").update({ game_state: { ...gameState, revealed } }).eq("id", session_id);

        const safeRevealed = revealed.length;
        const gridSize = 25;
        const mineCount = mines.length;
        const currentMultiplier = Math.floor(Math.pow(gridSize / (gridSize - mineCount), safeRevealed) * 0.97 * 100) / 100;

        return jsonResponse({ success: true, is_mine: false, revealed_count: safeRevealed, multiplier: currentMultiplier });
      }

    } else if (action === "mines_cashout") {
      const session_id = body.session_id;
      if (!session_id || typeof session_id !== "string") return errorResponse("Invalid session");

      const { data: session } = await admin.from("game_sessions").select("*").eq("id", session_id).eq("user_id", user.id).eq("status", "active").eq("game_type", "mines").single();
      if (!session) return errorResponse("Invalid or expired session");

      const gameState = session.game_state as any;
      const revealed: number[] = gameState.revealed || [];
      if (revealed.length === 0) return errorResponse("Must reveal at least one cell");

      const gridSize = 25;
      const mineCount = gameState.mines.length;
      // Server calculates multiplier - not from client
      const serverMultiplier = Math.floor(Math.pow(gridSize / (gridSize - mineCount), revealed.length) * 0.97 * 100) / 100;
      const win_amount = Math.floor(session.bet_amount * serverMultiplier);

      await admin.from("game_sessions").update({ status: "completed", game_state: { ...gameState, cashout_multiplier: serverMultiplier } }).eq("id", session_id);

      const { data: cp } = await admin.from("profiles").select("balance, total_earnings").eq("user_id", user.id).single();
      await admin.from("profiles").update({
        balance: (cp?.balance || 0) + win_amount,
        total_earnings: (cp?.total_earnings || 0) + (win_amount - session.bet_amount),
      }).eq("user_id", user.id);

      await admin.from("bet_history").insert({ user_id: user.id, bet_amount: session.bet_amount, win_amount, result: "win" });
      const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();

      return jsonResponse({ success: true, win_amount, multiplier: serverMultiplier, mines: gameState.mines, new_balance: up?.balance || 0 });

    } else if (action === "mines_lost") {
      // Legacy - handled by mines_reveal now, but keep for compatibility
      const session_id = body.session_id;
      if (session_id) {
        await admin.from("game_sessions").update({ status: "lost" }).eq("id", session_id).eq("user_id", user.id);
      }
      const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();
      return jsonResponse({ success: true, new_balance: up?.balance || 0 });

    // ========== WHEEL GAME ==========
    } else if (action === "wheel") {
      const SEGMENTS = [0, 1.5, 0, 2, 0.5, 3, 0, 1.2, 5, 0, 1.5, 10];
      const segIndex = Math.floor(Math.random() * SEGMENTS.length);
      const mult = SEGMENTS[segIndex];
      const win_amount = Math.floor(bet_amount * mult);
      const newBalance = profile.balance - bet_amount + win_amount;

      const updateData: Record<string, number> = { balance: newBalance, turnover: (profile.turnover || 0) + bet_amount };
      if (win_amount > bet_amount) updateData.total_earnings = (profile.total_earnings || 0) + (win_amount - bet_amount);
      else if (win_amount < bet_amount) updateData.total_loss = (profile.total_loss || 0) + (bet_amount - win_amount);

      await admin.from("profiles").update(updateData).eq("user_id", user.id);
      await admin.from("bet_history").insert({ user_id: user.id, bet_amount, win_amount, result: win_amount > 0 ? "win" : "loss" });

      return jsonResponse({ success: true, segment_index: segIndex, multiplier: mult, win_amount, new_balance: newBalance });

    // ========== PLINKO GAME ==========
    } else if (action === "plinko") {
      const rows = 8;
      const MULTIPLIERS = [8, 3, 1.5, 0.5, 0.3, 0.5, 1.5, 3, 8];
      const path: number[] = [];
      let position = 4; // center (0-8)
      for (let i = 0; i < rows; i++) {
        const dir = Math.random() < 0.5 ? 0 : 1;
        path.push(dir);
        position += dir === 1 ? 1 : -1;
      }
      const slotIndex = Math.max(0, Math.min(MULTIPLIERS.length - 1, Math.floor((position + rows) / 2)));
      const mult = MULTIPLIERS[slotIndex];
      const win_amount = Math.floor(bet_amount * mult);
      const newBalance = profile.balance - bet_amount + win_amount;

      const updateData: Record<string, number> = { balance: newBalance, turnover: (profile.turnover || 0) + bet_amount };
      if (win_amount > bet_amount) updateData.total_earnings = (profile.total_earnings || 0) + (win_amount - bet_amount);
      else if (win_amount < bet_amount) updateData.total_loss = (profile.total_loss || 0) + (bet_amount - win_amount);

      await admin.from("profiles").update(updateData).eq("user_id", user.id);
      await admin.from("bet_history").insert({ user_id: user.id, bet_amount, win_amount, result: win_amount > 0 ? "win" : "loss" });

      return jsonResponse({ success: true, path, multiplier: mult, win_amount, slot_index: slotIndex, new_balance: newBalance });

    // ========== TOWER GAME ==========
    } else if (action === "tower_start") {
      const maxFloors = 8;
      const cols = 3;
      const dangers: number[] = [];
      for (let i = 0; i < maxFloors; i++) {
        dangers.push(Math.floor(Math.random() * cols));
      }

      const { data: session } = await admin.from("game_sessions").insert({
        user_id: user.id, game_type: "tower", bet_amount,
        game_state: { dangers, max_floors: maxFloors, current_floor: 0 },
        status: "active",
      }).select("id").single();

      await admin.from("profiles").update({
        balance: profile.balance - bet_amount,
        turnover: (profile.turnover || 0) + bet_amount,
      }).eq("user_id", user.id);

      return jsonResponse({ success: true, session_id: session?.id, new_balance: profile.balance - bet_amount });

    } else if (action === "tower_climb") {
      const session_id = body.session_id;
      const col_index = Number(body.col_index);
      const floor = Number(body.floor);

      if (!session_id || typeof session_id !== "string") return errorResponse("Invalid session");
      if (!Number.isFinite(col_index) || col_index < 0 || col_index > 2) return errorResponse("Invalid column");
      if (!Number.isFinite(floor) || floor < 0 || floor > 7) return errorResponse("Invalid floor");

      const { data: session } = await admin.from("game_sessions").select("*").eq("id", session_id).eq("user_id", user.id).eq("status", "active").eq("game_type", "tower").single();
      if (!session) return errorResponse("Invalid or expired session");

      const gs = session.game_state as any;
      if (floor !== gs.current_floor) return errorResponse("Wrong floor");

      const dangerCol = gs.dangers[floor];
      const isSafe = col_index !== dangerCol;

      if (isSafe) {
        gs.current_floor = floor + 1;
        await admin.from("game_sessions").update({ game_state: gs }).eq("id", session_id);
        return jsonResponse({ success: true, is_safe: true, danger_col: dangerCol });
      } else {
        await admin.from("game_sessions").update({ status: "lost", game_state: gs }).eq("id", session_id);
        const { data: cp } = await admin.from("profiles").select("total_loss").eq("user_id", user.id).single();
        await admin.from("profiles").update({ total_loss: (cp?.total_loss || 0) + session.bet_amount }).eq("user_id", user.id);
        await admin.from("bet_history").insert({ user_id: user.id, bet_amount: session.bet_amount, win_amount: 0, result: "loss" });
        const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();
        return jsonResponse({ success: true, is_safe: false, new_balance: up?.balance || 0 });
      }

    } else if (action === "tower_cashout") {
      const session_id = body.session_id;
      if (!session_id || typeof session_id !== "string") return errorResponse("Invalid session");

      const { data: session } = await admin.from("game_sessions").select("*").eq("id", session_id).eq("user_id", user.id).eq("status", "active").eq("game_type", "tower").single();
      if (!session) return errorResponse("Invalid or expired session");

      const gs = session.game_state as any;
      if (gs.current_floor === 0) return errorResponse("Must climb at least one floor");

      const cols = 3;
      const mult = Math.floor(Math.pow(cols / (cols - 1), gs.current_floor) * 100) / 100;
      const win_amount = Math.floor(session.bet_amount * mult);

      await admin.from("game_sessions").update({ status: "completed", game_state: { ...gs, cashout_multiplier: mult } }).eq("id", session_id);
      const { data: cp } = await admin.from("profiles").select("balance, total_earnings").eq("user_id", user.id).single();
      await admin.from("profiles").update({
        balance: (cp?.balance || 0) + win_amount,
        total_earnings: (cp?.total_earnings || 0) + (win_amount - session.bet_amount),
      }).eq("user_id", user.id);
      await admin.from("bet_history").insert({ user_id: user.id, bet_amount: session.bet_amount, win_amount, result: "win" });
      const { data: up } = await admin.from("profiles").select("balance").eq("user_id", user.id).single();
      return jsonResponse({ success: true, win_amount, multiplier: mult, new_balance: up?.balance || 0 });

    // ========== KENO GAME ==========
    } else if (action === "keno") {
      const picks: number[] = body.picks;
      if (!Array.isArray(picks) || picks.length < 1 || picks.length > 10) return errorResponse("Invalid picks");
      if (picks.some((p: number) => !Number.isFinite(p) || p < 1 || p > 40)) return errorResponse("Invalid pick values");
      if (new Set(picks).size !== picks.length) return errorResponse("Duplicate picks");

      // Draw 10 random numbers from 1-40
      const pool = Array.from({ length: 40 }, (_, i) => i + 1);
      const drawn: number[] = [];
      for (let i = 0; i < 10; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        drawn.push(pool[idx]);
        pool.splice(idx, 1);
      }

      const hits = picks.filter(p => drawn.includes(p)).length;
      // Payout table based on picks count and hits
      const payTable: Record<number, Record<number, number>> = {
        1: { 0: 0, 1: 3 },
        2: { 0: 0, 1: 1.5, 2: 5 },
        3: { 0: 0, 1: 1, 2: 3, 3: 10 },
        4: { 0: 0, 1: 0.5, 2: 2, 3: 6, 4: 20 },
        5: { 0: 0, 1: 0, 2: 1.5, 3: 4, 4: 12, 5: 40 },
        6: { 0: 0, 1: 0, 2: 1, 3: 2.5, 4: 8, 5: 25, 6: 80 },
        7: { 0: 0, 1: 0, 2: 0.5, 3: 2, 4: 5, 5: 15, 6: 50, 7: 150 },
        8: { 0: 0, 1: 0, 2: 0, 3: 1.5, 4: 3, 5: 10, 6: 30, 7: 100, 8: 300 },
        9: { 0: 0, 1: 0, 2: 0, 3: 1, 4: 2.5, 5: 6, 6: 20, 7: 60, 8: 200, 9: 500 },
        10: { 0: 0, 1: 0, 2: 0, 3: 0.5, 4: 2, 5: 4, 6: 15, 7: 40, 8: 150, 9: 400, 10: 1000 },
      };

      const mult = payTable[picks.length]?.[hits] || 0;
      const win_amount = Math.floor(bet_amount * mult);
      const newBalance = profile.balance - bet_amount + win_amount;

      const updateData: Record<string, number> = { balance: newBalance, turnover: (profile.turnover || 0) + bet_amount };
      if (win_amount > bet_amount) updateData.total_earnings = (profile.total_earnings || 0) + (win_amount - bet_amount);
      else updateData.total_loss = (profile.total_loss || 0) + (bet_amount - win_amount);

      await admin.from("profiles").update(updateData).eq("user_id", user.id);
      await admin.from("bet_history").insert({ user_id: user.id, bet_amount, win_amount, result: win_amount > 0 ? "win" : "loss" });

      return jsonResponse({ success: true, drawn, hits, multiplier: mult, win_amount, new_balance: newBalance });

    // ========== DAILY BONUS ==========
    } else if (action === "daily_bonus") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existing } = await admin.from("daily_bonuses").select("id").eq("user_id", user.id).gte("claimed_at", today.toISOString()).limit(1);
      if (existing && existing.length > 0) {
        return errorResponse("Daily bonus already claimed");
      }

      const bonusAmount = 50;
      await admin.from("daily_bonuses").insert({ user_id: user.id, amount: bonusAmount });
      await admin.from("profiles").update({
        balance: profile.balance + bonusAmount,
        bonus_balance: (profile.bonus_balance || 0) + bonusAmount,
      }).eq("user_id", user.id);

      return jsonResponse({ success: true, bonus: bonusAmount, new_balance: profile.balance + bonusAmount });

    // ========== REFERRAL ==========
    } else if (action === "claim_referral") {
      const { data: userProfile } = await admin.from("profiles").select("referred_by, referral_code").eq("user_id", user.id).single();
      if (!userProfile?.referred_by) return errorResponse("No referral found");

      // Prevent self-referral
      if (userProfile.referral_code === userProfile.referred_by) {
        return errorResponse("Self-referral not allowed");
      }

      // Find referrer
      const { data: referrer } = await admin.from("profiles").select("user_id, balance, referral_bonus").eq("referral_code", userProfile.referred_by).single();
      if (!referrer) return errorResponse("Referrer not found");

      // Prevent self-referral by user_id
      if (referrer.user_id === user.id) {
        return errorResponse("Self-referral not allowed");
      }

      // Check if already claimed
      const { data: existingClaim } = await admin.from("referral_claims").select("id").eq("referrer_id", referrer.user_id).eq("referred_id", user.id).limit(1);
      if (existingClaim && existingClaim.length > 0) {
        return errorResponse("Referral bonus already claimed");
      }

      // Require minimum deposit from referred user
      const { data: referredProfile } = await admin.from("profiles").select("total_deposit").eq("user_id", user.id).single();
      if (!referredProfile || referredProfile.total_deposit < 100) {
        return errorResponse("Minimum deposit of ৳100 required before claiming referral bonus");
      }

      // Check max referrals per referrer (limit 50)
      const { count: referralCount } = await admin.from("referral_claims").select("id", { count: "exact", head: true }).eq("referrer_id", referrer.user_id);
      if ((referralCount || 0) >= 50) {
        return errorResponse("Referrer has reached maximum referral limit");
      }

      const referralBonus = 100;

      // Record the claim
      await admin.from("referral_claims").insert({
        referrer_id: referrer.user_id,
        referred_id: user.id,
        bonus_paid: referralBonus,
      });

      await admin.from("profiles").update({
        balance: referrer.balance + referralBonus,
        referral_bonus: (referrer.referral_bonus || 0) + referralBonus,
      }).eq("user_id", referrer.user_id);

      return jsonResponse({ success: true, bonus: referralBonus });
    }

    return errorResponse("Invalid action");

  } catch (_err) {
    return jsonResponse({ error: "Unable to process request" }, 500);
  }
});
