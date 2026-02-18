"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import ResultScreen from "@/components/ResultScreen";
import WishTree from "@/components/WishTree";
import LuckyDraw from "@/components/LuckyDraw";
import { useWishes } from "@/hooks/useWishes";

const TetBackground = dynamic(() => import("@/components/TetBackground"), {
  ssr: false,
});

type Screen = "input" | "loading" | "result" | "wishtree" | "lucky-draw";

interface ResultData {
  word: string;
  meaning: string;
  poem: string;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("wishtree");
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [hasHung, setHasHung] = useState(false);
  const [lastWishId, setLastWishId] = useState<string | null>(null);

  const { wishes, loading: wishesLoading, addWish, likeWish } = useWishes();

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const storedHung = localStorage.getItem("xin_chu_has_hung");
      if (storedHung === "true") {
        setHasHung(true);
        const storedResult = localStorage.getItem("xin_chu_my_result");
        const storedName = localStorage.getItem("xin_chu_my_name");
        if (storedResult) {
          try {
            setResult(JSON.parse(storedResult));
          } catch { /* ignore */ }
        }
        if (storedName) setName(storedName);
      }
    } catch { /* SSR guard */ }
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !wish.trim()) {
      setError("Xin hãy nhập đầy đủ tên và ước nguyện.");
      return;
    }
    setError("");
    setScreen("loading");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), wish: wish.trim() }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      // Chờ tối thiểu 3 giây cho animation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setResult(data);
      setScreen("result");
    } catch {
      setError("Ông đồ đang nghỉ ngơi, xin thử lại...");
      setScreen("input");
    }
  };

  const handleReset = () => {
    setScreen("input");
    setName("");
    setWish("");
    setResult(null);
    setShowForm(false);
    setError("");
    setIsPlacingMode(false);
  };

  // Click "Treo lên cây" => chuyển sang WishTree placing
  const handleHangWish = useCallback(() => {
    setScreen("wishtree");
    setIsPlacingMode(true);
  }, []);

  // Khi đặt vị trí trên cây
  const handlePlaceWish = useCallback(
    async (posX: number, posY: number) => {
      if (!result) return;

      // Save state immediately
      setIsPlacingMode(false);
      setHasHung(true);
      try {
        localStorage.setItem("xin_chu_has_hung", "true");
        localStorage.setItem("xin_chu_my_result", JSON.stringify(result));
        localStorage.setItem("xin_chu_my_name", name);
      } catch { /* ignore */ }

      // Navigate to lucky draw
      setScreen("lucky-draw");

      // Save wish to Supabase in background
      try {
        const createdWish = await addWish({
          name: name.trim(),
          wish_text: wish.trim(),
          word: result.word,
          poem: result.poem || "",
          pos_x: posX,
          pos_y: posY,
        });
        setLastWishId(createdWish?.id || null);
      } catch {
        console.warn("Không thể treo ước nguyện.");
      }
    },
    [result, name, wish, addWish]
  );

  // Xem cây
  const handleViewTree = useCallback(() => {
    setScreen("wishtree");
    setIsPlacingMode(false);
  }, []);

  // Xem lại chữ đã xin (khi đã treo)
  const handleViewMyResult = useCallback(() => {
    try {
      const storedResult = localStorage.getItem("xin_chu_my_result");
      const storedName = localStorage.getItem("xin_chu_my_name");
      if (storedResult) {
        setResult(JSON.parse(storedResult));
        setName(storedName || "");
        setScreen("result");
      }
    } catch { /* ignore */ }
  }, []);

  // Lucky draw done
  const handleLuckyDrawComplete = useCallback(() => {
    setScreen("wishtree");
  }, []);

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      <TetBackground />

      <div className="relative z-30 w-full flex flex-col items-center justify-center min-h-dvh py-10 pb-24 px-4">
        <AnimatePresence mode="wait">
          {/* ===== MÀN 1: INPUT (chỉ khi chưa treo) ===== */}
          {screen === "input" && !hasHung && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-lg lg:max-w-xl"
            >
              {/* Header */}
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-3"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl md:text-5xl lg:text-6xl mb-2"
                >
                  🏮
                </motion.div>

                <h1
                  className="text-4xl md:text-6xl lg:text-7xl text-gold gold-glow tracking-wider"
                  style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                >
                  Xin Chữ Đầu Năm
                </h1>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="mx-auto h-0.5 w-48 md:w-64 lg:w-80"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #FFD700, #DAA520, #FFD700, transparent)",
                  }}
                />

                <p className="text-gold-light/80 text-sm md:text-base lg:text-lg mt-2">
                  Tết Bính Ngọ — Mã đáo thành công
                </p>
              </motion.div>

              {/* Nút Xin Chữ hoặc Form */}
              <AnimatePresence mode="wait">
                {!showForm ? (
                  <motion.div
                    key="button-start"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col items-center gap-5"
                  >
                    {/* Con ngựa SVG */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg width="140" height="130" viewBox="0 0 200 180" fill="none" className="drop-shadow-lg lg:w-[180px] lg:h-[170px]">
                        <defs>
                          <linearGradient id="horseBody" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="50%" stopColor="#DAA520" />
                            <stop offset="100%" stopColor="#B8860B" />
                          </linearGradient>
                          <linearGradient id="horseMane" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D2042D" />
                            <stop offset="100%" stopColor="#8B0000" />
                          </linearGradient>
                        </defs>
                        <path d="M55 95 Q55 70 80 65 Q110 58 130 65 Q155 72 155 95 Q155 115 130 120 Q100 126 75 120 Q55 115 55 95Z" fill="url(#horseBody)" opacity="0.9" />
                        <path d="M130 75 Q140 55 148 38 Q152 28 145 22" fill="url(#horseBody)" opacity="0.9" />
                        <path d="M125 80 Q132 60 140 42 Q143 32 138 25" fill="url(#horseBody)" opacity="0.85" />
                        <path d="M138 25 Q145 18 155 20 Q168 22 172 35 Q175 45 168 52 Q160 58 148 55 Q140 52 138 42Z" fill="url(#horseBody)" opacity="0.9" />
                        <path d="M168 35 Q178 38 180 45 Q180 50 174 52 Q168 52 168 45Z" fill="#DAA520" opacity="0.7" />
                        <circle cx="175" cy="44" r="1.5" fill="#8B4513" opacity="0.6" />
                        <ellipse cx="160" cy="33" rx="3" ry="3.5" fill="#2C1810" />
                        <circle cx="159" cy="32" r="1" fill="white" opacity="0.8" />
                        <path d="M148 20 Q145 8 150 5 Q155 4 154 14Z" fill="url(#horseBody)" />
                        <path d="M155 18 Q158 6 162 5 Q166 6 160 16Z" fill="url(#horseBody)" />
                        <path d="M149 18 Q147 10 151 7" stroke="#FFB347" strokeWidth="1" fill="none" opacity="0.5" />
                        <path d="M145 15 Q138 22 135 35 Q132 45 128 55 Q125 62 122 70" stroke="url(#horseMane)" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M148 18 Q142 28 140 40 Q138 50 135 60" stroke="url(#horseMane)" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
                        <path d="M150 20 Q146 30 145 42" stroke="url(#horseMane)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
                        <path d="M80 72 Q95 62 120 62 Q135 64 140 72 Q135 75 120 74 Q95 74 80 72Z" fill="#D2042D" opacity="0.8" />
                        <path d="M85 70 Q100 63 118 63 Q132 65 136 70" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.6" />
                        <path d="M75 115 Q73 135 70 150 Q69 155 72 157" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M88 118 Q87 138 85 152 Q84 156 87 158" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M120 118 Q122 138 124 152 Q124 156 121 158" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <path d="M135 115 Q138 135 140 150 Q141 155 138 157" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" />
                        <ellipse cx="72" cy="158" rx="4" ry="2.5" fill="#FFD700" opacity="0.8" />
                        <ellipse cx="87" cy="159" rx="4" ry="2.5" fill="#FFD700" opacity="0.8" />
                        <ellipse cx="121" cy="159" rx="4" ry="2.5" fill="#FFD700" opacity="0.8" />
                        <ellipse cx="138" cy="158" rx="4" ry="2.5" fill="#FFD700" opacity="0.8" />
                        <path d="M55 88 Q40 80 30 85 Q22 90 25 100 Q28 108 35 112 Q30 105 32 95 Q35 88 42 85" stroke="url(#horseMane)" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M55 92 Q42 85 35 92 Q30 98 34 106" stroke="url(#horseMane)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                        <text x="108" y="73" textAnchor="middle" fill="#FFD700" fontSize="9" fontWeight="bold" opacity="0.7" style={{ fontFamily: "serif" }}>馬</text>
                      </svg>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(255, 215, 0, 0.6)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowForm(true)}
                      className="cursor-pointer relative px-12 py-5 lg:px-16 lg:py-6 rounded-full text-2xl md:text-3xl lg:text-4xl text-cream font-bold overflow-hidden transition-all duration-300"
                      style={{
                        fontFamily: "var(--font-thuphap-local), serif",
                        background: "linear-gradient(135deg, #D2042D, #8B0000, #D2042D)",
                        border: "2.5px solid rgba(255, 215, 0, 0.7)",
                        boxShadow: "0 0 25px rgba(255, 215, 0, 0.25), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 3s infinite",
                        }}
                      />
                      <span className="relative z-10">🖋 Xin Chữ Ông Đồ</span>
                    </motion.button>

                    <p className="text-cream/60 text-sm md:text-base lg:text-lg text-center max-w-sm">
                      Hãy thành tâm chia sẻ ước nguyện để ông đồ luận giải và tặng chữ
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full space-y-5"
                  >
                    <div
                      className="rounded-xl p-6 md:p-8 lg:p-10 space-y-5 lg:space-y-6 backdrop-blur-md"
                      style={{
                        background: "linear-gradient(135deg, rgba(139, 0, 0, 0.7), rgba(92, 0, 21, 0.8))",
                        border: "1px solid rgba(255, 215, 0, 0.2)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.03)",
                      }}
                    >
                      {/* Tên */}
                      <div className="space-y-2">
                        <label
                          className="text-gold text-sm md:text-base lg:text-lg font-medium flex items-center gap-2"
                          style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                        >
                          <span className="text-lg">📛</span> Quý danh
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nhập tên của bạn..."
                          maxLength={50}
                          className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg text-ink bg-cream/90 placeholder:text-ink/40 outline-none transition-all duration-300 text-sm md:text-base lg:text-lg"
                          style={{
                            border: "1px solid rgba(218, 165, 32, 0.3)",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#FFD700";
                            e.currentTarget.style.boxShadow =
                              "0 0 12px rgba(255, 215, 0, 0.2), inset 0 2px 4px rgba(0,0,0,0.05)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(218, 165, 32, 0.3)";
                            e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.05)";
                          }}
                        />
                      </div>

                      {/* Ước nguyện */}
                      <div className="space-y-2">
                        <label
                          className="text-gold text-sm md:text-base lg:text-lg font-medium flex items-center gap-2"
                          style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                        >
                          <span className="text-lg">🙏</span> Ước nguyện tâm tư
                        </label>
                        <textarea
                          value={wish}
                          onChange={(e) => setWish(e.target.value)}
                          placeholder="Chia sẻ ước nguyện, tâm tư của bạn trong năm mới..."
                          rows={4}
                          maxLength={500}
                          className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-lg text-ink bg-cream/90 placeholder:text-ink/40 outline-none transition-all duration-300 resize-none text-sm md:text-base lg:text-lg"
                          style={{
                            border: "1px solid rgba(218, 165, 32, 0.3)",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#FFD700";
                            e.currentTarget.style.boxShadow =
                              "0 0 12px rgba(255, 215, 0, 0.2), inset 0 2px 4px rgba(0,0,0,0.05)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(218, 165, 32, 0.3)";
                            e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.05)";
                          }}
                        />
                        <p className="text-right text-cream/40 text-xs">
                          {wish.length}/500
                        </p>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-gold-light text-sm text-center"
                          >
                            ⚠ {error}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Nút Khai Bút */}
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(255, 215, 0, 0.4)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        className="cursor-pointer w-full relative py-4 lg:py-5 rounded-lg text-lg md:text-xl lg:text-2xl font-semibold text-cream overflow-hidden transition-all duration-300"
                        style={{
                          fontFamily: "var(--font-thuphap-local), serif",
                          background: "linear-gradient(135deg, #D2042D, #8B0000)",
                          border: "1.5px solid rgba(255, 215, 0, 0.5)",
                          boxShadow: "0 4px 15px rgba(210, 4, 45, 0.3)",
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-15"
                          style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 2.5s infinite",
                          }}
                        />
                        <span className="relative z-10">✍ Khai Bút</span>
                      </motion.button>
                    </div>

                    {/* Nút quay lại */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowForm(false);
                        setError("");
                      }}
                      className="cursor-pointer w-full py-2 text-cream/50 text-sm lg:text-base hover:text-cream/80 transition-colors duration-300"
                    >
                      ← Quay lại
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ===== MÀN 2: LOADING ===== */}
          {screen === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <LoadingScreen />
            </motion.div>
          )}

          {/* ===== MÀN 3: RESULT ===== */}
          {screen === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <ResultScreen
                data={result}
                name={name}
                onReset={hasHung ? undefined : handleReset}
                onHangWish={hasHung ? undefined : handleHangWish}
                onViewTree={hasHung ? handleViewTree : undefined}
                readOnly={hasHung}
              />
            </motion.div>
          )}

          {/* ===== MÀN 4: WISH TREE ===== */}
          {screen === "wishtree" && (
            <motion.div
              key="wishtree"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl px-2"
            >
              <WishTree
                wishes={wishes}
                loading={wishesLoading}
                onLike={likeWish}
                isPlacingMode={isPlacingMode}
                onPlaceWish={handlePlaceWish}
              />

              {/* Nút điều hướng */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-4 mt-6"
              >
                {isPlacingMode && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlacingMode(false)}
                    className="cursor-pointer px-8 py-3.5 lg:px-12 lg:py-5 rounded-full text-cream border-2 border-cream/40 bg-red-dark/60 backdrop-blur-sm text-base md:text-lg lg:text-xl font-medium transition-all hover:text-cream hover:border-cream/70"
                    style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                  >
                    ✕ Hủy treo
                  </motion.button>
                )}

                {/* Xin Chữ Mới - chỉ khi chưa treo */}
                {!hasHung && !isPlacingMode && (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 215, 0, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setScreen("input");
                      setShowForm(false);
                    }}
                    className="cursor-pointer px-8 py-3.5 lg:px-12 lg:py-5 rounded-full text-gold border-2 border-gold/60 bg-red-dark/80 backdrop-blur-sm text-base md:text-lg lg:text-xl font-semibold transition-all hover:bg-red-dark hover:border-gold"
                    style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                  >
                    🖋 Xin Chữ Mới
                  </motion.button>
                )}

                {/* Xem lại chữ - chỉ khi đã treo */}
                {hasHung && !isPlacingMode && (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 215, 0, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewMyResult}
                    className="cursor-pointer px-8 py-3.5 lg:px-12 lg:py-5 rounded-full text-gold border-2 border-gold/60 bg-red-dark/80 backdrop-blur-sm text-base md:text-lg lg:text-xl font-semibold transition-all hover:bg-red-dark hover:border-gold"
                    style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                  >
                    📜 Xem lại chữ của tôi
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ===== MÀN 5: LUCKY DRAW ===== */}
          {screen === "lucky-draw" && (
            <motion.div
              key="lucky-draw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <LuckyDraw
                wishId={lastWishId}
                userName={name}
                onComplete={handleLuckyDrawComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="fixed bottom-4 left-0 right-0 text-center z-30"
      >
        <div className="flex items-center justify-center gap-4">
          <p className="text-cream/40 text-sm lg:text-base">
            Tết Bính Ngọ 🐴 Xin Chữ Đầu Năm
          </p>
          {screen !== "wishtree" && screen !== "lucky-draw" && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,215,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewTree}
              className="cursor-pointer text-sm lg:text-base px-5 py-2 lg:px-8 lg:py-3 rounded-full border-2 border-gold/40 text-gold/80 hover:text-gold hover:border-gold/70 transition-all bg-red-dark/50 backdrop-blur-sm font-medium"
              style={{ fontFamily: "var(--font-thuphap-local), serif" }}
            >
              🌸 Cây Ước Nguyện ({wishes.length})
            </motion.button>
          )}
        </div>
      </motion.footer>
    </main>
  );
}
