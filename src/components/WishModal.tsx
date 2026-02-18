"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type Wish } from "@/utils/supabase";
import { useState } from "react";
import { LiXiSVG } from "./WishEnvelope";

interface WishModalProps {
  wish: Wish | null;
  onClose: () => void;
  onLike: (wishId: string, currentLikes: number) => Promise<void>;
}

export default function WishModal({ wish, onClose, onLike }: WishModalProps) {
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);

  const handleLike = async () => {
    if (!wish || liking) return;
    setLiking(true);
    setLiked(true);

    // Spawn floating hearts
    setHearts((prev) => [...prev, Date.now()]);

    try {
      await onLike(wish.id, wish.likes);
    } catch {
      console.error("Like failed");
    } finally {
      setLiking(false);
      setTimeout(() => setLiked(false), 1200);
    }
  };

  const poemLines = wish?.poem.split("\n").filter(Boolean) || [];

  return (
    <AnimatePresence>
      {wish && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #8B0000, #5C0015, #8B0000)",
              border: "2px solid rgba(255, 215, 0, 0.4)",
              boxShadow: "0 0 40px rgba(255, 215, 0, 0.15), 0 20px 60px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors cursor-pointer text-lg"
            >
              ✕
            </button>

            {/* Header với lì xì */}
            <div className="flex flex-col items-center pt-6 pb-3">
              <motion.div
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <LiXiSVG size={56} word={wish.word} />
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-4">
              {/* Chữ thư pháp */}
              <div className="text-center">
                <div
                  className="text-5xl sm:text-6xl text-gold gold-glow"
                  style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                >
                  {wish.word}
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mx-auto mt-2 h-px w-24"
                  style={{ background: "linear-gradient(90deg, transparent, #FFD700, transparent)" }}
                />
              </div>

              {/* Ước nguyện (ẩn danh) */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: "rgba(255, 248, 231, 0.08)",
                  border: "1px solid rgba(255, 215, 0, 0.12)",
                }}
              >
                <p className="text-cream/60 text-sm mb-2 flex items-center gap-1">
                  🙏 Ước nguyện
                </p>
                <p className="text-cream/90 text-base md:text-lg lg:text-xl leading-relaxed italic">
                  &ldquo;{wish.wish_text}&rdquo;
                </p>
              </div>

              {/* Câu đối */}
              {poemLines.length > 0 && (
                <div className="text-center space-y-1">
                  {poemLines.map((line, i) => (
                    <p
                      key={i}
                      className="text-gold-light/80 text-sm italic"
                      style={{ fontFamily: "var(--font-thuphap-local), serif" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Nút Thả Tim */}
              <div className="flex items-center justify-center gap-3 pt-2 relative">
                {/* Floating hearts animation */}
                <AnimatePresence>
                  {hearts.map((id) => (
                    <motion.span
                      key={id}
                      initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        y: -60,
                        x: Math.random() * 40 - 20,
                        scale: 1.5,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      onAnimationComplete={() =>
                        setHearts((prev) => prev.filter((h) => h !== id))
                      }
                      className="absolute text-red-tet text-xl pointer-events-none"
                    >
                      ❤
                    </motion.span>
                  ))}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleLike}
                  disabled={liking}
                  className="cursor-pointer flex items-center gap-2.5 px-7 py-3 lg:px-10 lg:py-4 rounded-full transition-all duration-300 text-base lg:text-lg"
                  style={{
                    background: liked
                      ? "linear-gradient(135deg, #D2042D, #FF4060)"
                      : "linear-gradient(135deg, rgba(210,4,45,0.3), rgba(139,0,0,0.4))",
                    border: `1.5px solid ${liked ? "#FF6080" : "rgba(255,215,0,0.3)"}`,
                    boxShadow: liked ? "0 0 20px rgba(210,4,45,0.3)" : "none",
                  }}
                >
                  <motion.span
                    animate={liked ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {liked ? "❤️" : "🤍"}
                  </motion.span>
                  <span className="text-cream text-sm font-medium">Thả tim</span>
                  <span className="text-cream/60 text-xs bg-cream/10 px-2 py-0.5 rounded-full">
                    {wish.likes + (liked ? 1 : 0)}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
