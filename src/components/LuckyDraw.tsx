"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { supabase, isSupabaseConfigured } from "@/utils/supabase";

interface LuckyDrawProps {
  wishId?: string | null;
  userName: string;
  onComplete: () => void;
}

export default function LuckyDraw({ wishId, userName, onComplete }: LuckyDrawProps) {
  const [stage, setStage] = useState<"intro" | "opening" | "reveal" | "form" | "done">("intro");
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [wonLabel, setWonLabel] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [winnerName, setWinnerName] = useState(userName);
  const [submitting, setSubmitting] = useState(false);
  const [prizeId, setPrizeId] = useState<string | null>(null);

  const rollDice = useCallback(async (): Promise<{ amount: number | null; label: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return { amount: null, label: "" };
    }

    try {
      // Fetch config from DB
      const { data: configs } = await supabase
        .from("prize_config")
        .select("*")
        .eq("enabled", true);

      if (!configs || configs.length === 0) {
        return { amount: null, label: "" };
      }

      // Fetch existing claimed prizes
      const { data: existing } = await supabase.from("prizes").select("amount");

      // Build available pool – only configs that still have remaining stock
      const available: { amount: number; chance: number; label: string }[] = [];
      for (const cfg of configs) {
        const claimed = existing?.filter((p) => p.amount === cfg.amount).length || 0;
        if (claimed < cfg.max_count) {
          available.push({
            amount: cfg.amount,
            chance: cfg.chance,
            label: cfg.label || `${cfg.amount.toLocaleString("vi-VN")}₫`,
          });
        }
      }

      if (available.length === 0) {
        return { amount: null, label: "" };
      }

      // Roll
      const roll = Math.random() * 100;
      let cumulative = 0;
      for (const p of available) {
        cumulative += p.chance;
        if (roll < cumulative) {
          // Won! Save prize record
          const { data: prize } = await supabase
            .from("prizes")
            .insert([
              {
                wish_id: wishId || null,
                amount: p.amount,
                winner_name: userName,
              },
            ])
            .select()
            .single();

          if (prize) setPrizeId(prize.id);
          return { amount: p.amount, label: p.label };
        }
      }

      return { amount: null, label: "" };
    } catch (err) {
      console.warn("Lucky draw error:", err);
      return { amount: null, label: "" };
    }
  }, [wishId, userName]);

  const handleOpen = async () => {
    setStage("opening");

    // Roll dice while animation plays
    const result = await rollDice();

    // Wait for opening animation
    await new Promise((resolve) => setTimeout(resolve, 2200));

    setWonAmount(result.amount);
    setWonLabel(result.label);
    setStage("reveal");
  };

  // Celebration effects on win
  useEffect(() => {
    if (stage === "reveal" && wonAmount) {
      const duration = 4000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.5 },
          colors: ["#FFD700", "#FFA500", "#D2042D", "#FF6B35"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.5 },
          colors: ["#FFD700", "#FFA500", "#D2042D", "#FF6B35"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [stage, wonAmount]);

  const handleSubmitBankInfo = async () => {
    if (!supabase || !winnerName.trim() || !bankAccount.trim() || !bankName.trim()) return;
    if (!prizeId) return;
    setSubmitting(true);

    try {
      await supabase
        .from("prizes")
        .update({
          winner_name: winnerName.trim(),
          bank_account: bankAccount.trim(),
          bank_name: bankName.trim(),
        })
        .eq("id", prizeId);

      setStage("done");
    } catch {
      console.warn("Không thể lưu thông tin ngân hàng.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-md lg:max-w-lg mx-auto px-4 py-8"
    >
      <AnimatePresence mode="wait">
        {/* ===== INTRO: Unopened Envelope ===== */}
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex flex-col items-center gap-6 lg:gap-8"
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl lg:text-4xl text-gold gold-glow text-center"
              style={{ fontFamily: "var(--font-thuphap-local), serif" }}
            >
              🧧 Phong Bao Lì Xì May Mắn
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-cream/70 text-center text-sm md:text-base lg:text-lg max-w-sm"
            >
              Cảm ơn bạn đã treo ước nguyện! Hãy mở phong bao để thử vận may 🍀
            </motion.p>

            {/* Big Envelope */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative cursor-pointer"
              onClick={handleOpen}
            >
              {/* Glow aura */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,215,0,0.3)",
                    "0 0 60px rgba(255,215,0,0.6)",
                    "0 0 20px rgba(255,215,0,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <svg width="200" height="260" viewBox="0 0 200 260" fill="none" className="drop-shadow-2xl">
                {/* Body */}
                <rect x="10" y="30" width="180" height="220" rx="12" fill="#D2042D" />
                <rect x="10" y="30" width="180" height="220" rx="12" stroke="#B80020" strokeWidth="1" />

                {/* Flap (top) */}
                <path d="M10 30 L10 90 Q100 130 190 90 L190 30 Q190 30 190 30Z" fill="#E8102B" />
                <path d="M10 85 Q100 125 190 85" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.5" />

                {/* Gold border ornament */}
                <rect x="24" y="50" width="152" height="190" rx="6" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.4" />
                <rect x="30" y="56" width="140" height="178" rx="4" stroke="#FFD700" strokeWidth="0.7" fill="none" opacity="0.25" />

                {/* Gold circle */}
                <circle cx="100" cy="155" r="42" fill="#FFD700" opacity="0.95" />
                <circle cx="100" cy="155" r="38" stroke="#DAA520" strokeWidth="1" fill="none" />

                {/* 福 character */}
                <text x="100" y="172" textAnchor="middle" fill="#D2042D" fontSize="42" fontWeight="bold" style={{ fontFamily: "serif" }}>
                  福
                </text>

                {/* Bow */}
                <ellipse cx="88" cy="32" rx="18" ry="10" fill="#FFD700" opacity="0.9" transform="rotate(-12 88 32)" />
                <ellipse cx="112" cy="32" rx="18" ry="10" fill="#FFD700" opacity="0.9" transform="rotate(12 112 32)" />
                <circle cx="100" cy="34" r="8" fill="#DAA520" />

                {/* Tassels */}
                <line x1="70" y1="250" x2="68" y2="260" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                <line x1="100" y1="250" x2="100" y2="260" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                <line x1="130" y1="250" x2="132" y2="260" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              </svg>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={handleOpen}
              className="relative cursor-pointer px-10 py-4 lg:px-14 lg:py-5 rounded-full text-xl lg:text-2xl text-cream font-bold overflow-hidden"
              style={{
                fontFamily: "var(--font-thuphap-local), serif",
                background: "linear-gradient(135deg, #D2042D, #8B0000)",
                border: "2px solid rgba(255,215,0,0.6)",
                boxShadow: "0 0 25px rgba(255,215,0,0.3), 0 4px 20px rgba(0,0,0,0.3)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative z-10">✨ Mở Phong Bao ✨</span>
            </motion.button>
          </motion.div>
        )}

        {/* ===== OPENING ANIMATION ===== */}
        {stage === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{
                rotateY: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <svg width="160" height="210" viewBox="0 0 200 260" fill="none">
                <rect x="10" y="30" width="180" height="220" rx="12" fill="#D2042D" />
                {/* Open flap */}
                <path d="M10 30 L100 -10 L190 30" fill="#E8102B" stroke="#FFD700" strokeWidth="1" />
                <circle cx="100" cy="155" r="42" fill="#FFD700" opacity="0.95" />
                <text x="100" y="172" textAnchor="middle" fill="#D2042D" fontSize="42" fontWeight="bold" style={{ fontFamily: "serif" }}>福</text>
              </svg>
            </motion.div>

            {/* Golden sparkles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 ? "#FFD700" : "#FFA500",
                  left: `${30 + Math.random() * 40}%`,
                  top: `${20 + Math.random() * 40}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -50 - Math.random() * 60],
                  x: [-30 + Math.random() * 60],
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5 + i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-gold text-lg lg:text-xl"
              style={{ fontFamily: "var(--font-thuphap-local), serif" }}
            >
              ✨ Đang mở phong bao... ✨
            </motion.p>
          </motion.div>
        )}

        {/* ===== REVEAL: Win or Lose ===== */}
        {stage === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex flex-col items-center gap-6 lg:gap-8 w-full"
          >
            {wonAmount ? (
              /* ===== WON! ===== */
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-5xl lg:text-6xl"
                >
                  🎉
                </motion.div>

                <motion.h2
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-3xl md:text-4xl lg:text-5xl text-gold gold-glow text-center font-bold"
                  style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                >
                  CHÚC MỪNG!
                </motion.h2>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(255,215,0,0.4)",
                        "0 0 50px rgba(255,215,0,0.7)",
                        "0 0 20px rgba(255,215,0,0.4)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div
                    className="relative px-10 py-8 lg:px-14 lg:py-10 rounded-2xl text-center"
                    style={{
                      background: "linear-gradient(135deg, #8B0000, #D2042D, #8B0000)",
                      border: "2px solid rgba(255,215,0,0.6)",
                    }}
                  >
                    <p className="text-cream/80 text-base lg:text-lg mb-2">Bạn nhận được</p>
                    <p
                      className="text-5xl lg:text-6xl font-bold text-gold gold-glow"
                      style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                    >
                      {wonLabel}
                    </p>
                    <p className="text-cream/60 text-sm lg:text-base mt-2">Lì xì may mắn 🧧</p>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setStage("form")}
                  className="cursor-pointer w-full max-w-sm py-5 lg:py-6 rounded-2xl text-white text-lg lg:text-xl font-bold relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #D2042D, #8B0000)",
                    border: "2px solid rgba(255,215,0,0.5)",
                    boxShadow: "0 6px 25px rgba(210,4,45,0.4)",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.2) 50%, transparent 60%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                  />
                  <span className="relative z-10">📝 Nhận Lì Xì Ngay</span>
                </motion.button>
              </>
            ) : (
              /* ===== NO PRIZE ===== */
              <>
                <motion.div className="text-5xl lg:text-6xl">🍀</motion.div>

                <motion.h2
                  className="text-2xl md:text-3xl lg:text-4xl text-gold text-center"
                  style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                >
                  Chúc bạn may mắn lần sau!
                </motion.h2>

                <p className="text-cream/60 text-center text-sm md:text-base lg:text-lg max-w-sm">
                  Ước nguyện của bạn đã được treo lên cây, mọi điều tốt đẹp sẽ đến! 🌸
                </p>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={onComplete}
                  className="cursor-pointer w-full max-w-sm py-5 lg:py-6 rounded-2xl text-gold text-lg lg:text-xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,0,0,0.8), rgba(92,0,21,0.9))",
                    border: "2px solid rgba(255,215,0,0.5)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    fontFamily: "var(--font-thuphap-local), serif",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  🌸 Xem Cây Ước Nguyện
                </motion.button>
              </>
            )}
          </motion.div>
        )}

        {/* ===== FORM: Bank Info ===== */}
        {stage === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md lg:max-w-lg"
          >
            <div
              className="rounded-2xl p-6 md:p-8 lg:p-10 space-y-5 lg:space-y-6"
              style={{
                background: "linear-gradient(135deg, rgba(139,0,0,0.85), rgba(92,0,21,0.9))",
                border: "1.5px solid rgba(255,215,0,0.3)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div className="text-center space-y-2">
                <p className="text-3xl lg:text-4xl">🧧</p>
                <h3
                  className="text-xl md:text-2xl lg:text-3xl text-gold gold-glow"
                  style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                >
                  Nhận Lì Xì {wonLabel}
                </h3>
                <p className="text-cream/60 text-sm lg:text-base">
                  Vui lòng điền thông tin để nhận lì xì
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-gold text-sm md:text-base lg:text-lg font-medium flex items-center gap-2">
                  <span className="text-lg">👤</span> Họ tên
                </label>
                <input
                  type="text"
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  placeholder="Nhập họ tên đầy đủ..."
                  maxLength={100}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg text-ink bg-cream/90 placeholder:text-ink/40 outline-none text-sm md:text-base lg:text-lg"
                  style={{ border: "1px solid rgba(218,165,32,0.3)" }}
                />
              </div>

              {/* Bank Name */}
              <div className="space-y-2">
                <label className="text-gold text-sm md:text-base lg:text-lg font-medium flex items-center gap-2">
                  <span className="text-lg">🏦</span> Ngân hàng
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="VD: Vietcombank, MB Bank, Momo..."
                  maxLength={100}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg text-ink bg-cream/90 placeholder:text-ink/40 outline-none text-sm md:text-base lg:text-lg"
                  style={{ border: "1px solid rgba(218,165,32,0.3)" }}
                />
              </div>

              {/* Account */}
              <div className="space-y-2">
                <label className="text-gold text-sm md:text-base lg:text-lg font-medium flex items-center gap-2">
                  <span className="text-lg">💳</span> Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Nhập số tài khoản..."
                  maxLength={50}
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg text-ink bg-cream/90 placeholder:text-ink/40 outline-none text-sm md:text-base lg:text-lg"
                  style={{ border: "1px solid rgba(218,165,32,0.3)" }}
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmitBankInfo}
                disabled={submitting || !winnerName.trim() || !bankAccount.trim() || !bankName.trim()}
                className="cursor-pointer w-full py-4 lg:py-5 rounded-xl text-lg lg:text-xl font-bold text-cream relative overflow-hidden disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #D2042D, #8B0000)",
                  border: "1.5px solid rgba(255,215,0,0.5)",
                  boxShadow: "0 4px 20px rgba(210,4,45,0.3)",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.2) 50%, transparent 60%)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />
                <span className="relative z-10">
                  {submitting ? "Đang gửi..." : "✅ Xác nhận nhận lì xì"}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ===== DONE: Thank you ===== */}
        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="flex flex-col items-center gap-6 lg:gap-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl lg:text-7xl"
            >
              ✅
            </motion.div>

            <h2
              className="text-2xl md:text-3xl lg:text-4xl text-gold gold-glow"
              style={{ fontFamily: "var(--font-thuphap-local), serif" }}
            >
              Đã ghi nhận!
            </h2>

            <p className="text-cream/70 text-base lg:text-lg max-w-sm">
              Lì xì <span className="text-gold font-bold">{wonLabel}</span> sẽ được
              chuyển đến bạn sớm nhất. Chúc bạn năm mới vạn sự như ý! 🎊
            </p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onComplete}
              className="cursor-pointer w-full max-w-sm py-5 lg:py-6 rounded-2xl text-gold text-lg lg:text-xl font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(139,0,0,0.8), rgba(92,0,21,0.9))",
                border: "2px solid rgba(255,215,0,0.5)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                fontFamily: "var(--font-thuphap-local), serif",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              🌸 Xem Cây Ước Nguyện
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
