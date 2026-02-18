"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface ResultData {
  word: string;
  meaning: string;
  poem?: string;
}

interface ResultScreenProps {
  data: ResultData;
  name: string;
  onReset?: () => void;
  onHangWish?: () => void;
  onViewTree?: () => void;
  readOnly?: boolean;
}

export default function ResultScreen({
  data,
  name,
  onReset,
  onHangWish,
  onViewTree,
  readOnly = false,
}: ResultScreenProps) {
  const [showPoem, setShowPoem] = useState(false);

  useEffect(() => {
    if (readOnly) return; // No confetti when viewing saved result
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#D2042D", "#FFD700", "#FF6B35"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#D2042D", "#FFD700", "#FF6B35"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [readOnly]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-start w-full max-w-lg lg:max-w-xl mx-auto px-4 pt-4 pb-28"
    >
      {/* === PAPER SCROLL === */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.3 }}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF8E7 0%, #F5E6C8 50%, #EDD9B3 100%)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3), inset 0 0 60px rgba(139,90,43,0.15)",
        }}
      >
        {/* Paper texture */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Gold border */}
        <div
          className="absolute inset-2 sm:inset-3 rounded-xl pointer-events-none"
          style={{
            border: "2px solid rgba(212, 175, 55, 0.5)",
            boxShadow: "inset 0 0 20px rgba(212, 175, 55, 0.1)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12 flex flex-col items-center">
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-3"
            style={{ color: "#8B4513", fontFamily: "var(--font-thuphap)" }}
          >
            Chữ dành tặng{" "}
            <span style={{ color: "#D2042D" }}>{name || "bạn"}</span>
          </motion.p>

          {/* Main character */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
            className="my-4 sm:my-6"
          >
            <span
              className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] block text-center"
              style={{
                fontFamily: "var(--font-thuphap)",
                color: "#D2042D",
                textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                filter: "drop-shadow(0 0 15px rgba(210,4,45,0.3))",
                lineHeight: 1.2,
              }}
            >
              {data.word}
            </span>
          </motion.div>

          {/* Meaning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-left max-w-sm lg:max-w-md mb-2"
          >
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed whitespace-pre-line"
              style={{ color: "#6B4423" }}
            >
              {data.meaning}
            </p>
          </motion.div>

          {/* === POEM REVEAL SECTION === */}
          {data.poem && data.poem.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="w-full mt-6"
            >
              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
                <span className="text-lg" style={{ color: "#D4AF37" }}>✦</span>
                <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
              </div>

              <AnimatePresence mode="wait">
                {!showPoem ? (
                  <motion.button
                    key="reveal-btn"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    onClick={() => setShowPoem(true)}
                    className="relative w-full py-4 lg:py-5 rounded-xl cursor-pointer overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #D2042D 0%, #A0031E 100%)",
                      boxShadow: "0 4px 20px rgba(210,4,45,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      animate={{ boxShadow: ["0 0 8px rgba(255,215,0,0.3)", "0 0 25px rgba(255,215,0,0.6)", "0 0 8px rgba(255,215,0,0.3)"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="relative flex items-center justify-center gap-3">
                      <motion.span className="text-2xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        📜
                      </motion.span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                        Xem Câu Đối Tết
                      </span>
                      <motion.span className="text-xl text-yellow-300" animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                        ▸
                      </motion.span>
                    </div>
                  </motion.button>
                ) : (
                  <motion.div
                    key="poem-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div
                      className="rounded-xl px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
                      style={{
                        background: "linear-gradient(135deg, rgba(210,4,45,0.08) 0%, rgba(212,175,55,0.1) 100%)",
                        border: "1px solid rgba(212,175,55,0.3)",
                      }}
                    >
                      <p className="text-center text-base sm:text-lg lg:text-xl mb-4 font-semibold" style={{ color: "#D2042D" }}>
                        ✨ Câu đối tặng {name || "bạn"} ✨
                      </p>
                      <div className="space-y-2 sm:space-y-3">
                        {data.poem
                          .split("\n")
                          .filter((l) => l.trim())
                          .map((line, i) => (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.2, duration: 0.4 }}
                              className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed"
                              style={{ fontFamily: "var(--font-thuphap)", color: "#6B4423" }}
                            >
                              {line}
                            </motion.p>
                          ))}
                      </div>
                    </div>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => setShowPoem(false)}
                      className="w-full mt-3 py-2 text-sm lg:text-base cursor-pointer rounded-lg transition-colors"
                      style={{ color: "#8B6914" }}
                    >
                      ▴ Thu gọn
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* === ACTION BUTTONS === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="w-full flex flex-col gap-4 mt-8"
      >
        {/* Treo lên cây - chỉ khi chưa treo */}
        {!readOnly && onHangWish && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onHangWish}
            className="w-full py-5 lg:py-6 rounded-2xl text-white text-lg sm:text-xl lg:text-2xl font-bold cursor-pointer relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #D2042D 0%, #8B0000 100%)",
              boxShadow: "0 6px 25px rgba(210,4,45,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.2) 50%, transparent 60%)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            />
            <span className="relative z-10">🌸 Treo lên Cây Ước Nguyện</span>
          </motion.button>
        )}

        {/* Xin chữ khác - chỉ khi chưa treo */}
        {!readOnly && onReset && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="w-full py-4 lg:py-5 rounded-2xl font-bold text-base sm:text-lg lg:text-xl cursor-pointer transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(255,248,231,0.9) 0%, rgba(245,230,200,0.9) 100%)",
              border: "2px solid rgba(210,4,45,0.3)",
              color: "#D2042D",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          >
            ✍️ Xin chữ khác
          </motion.button>
        )}

        {/* Xem cây - khi đã treo (readOnly) */}
        {readOnly && onViewTree && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onViewTree}
            className="w-full py-5 lg:py-6 rounded-2xl text-gold text-lg sm:text-xl lg:text-2xl font-bold cursor-pointer relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139,0,0,0.85) 0%, rgba(92,0,21,0.9) 100%)",
              border: "2px solid rgba(255,215,0,0.5)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              fontFamily: "var(--font-thuphap-local), serif",
            }}
          >
            🌸 Xem Cây Ước Nguyện
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
