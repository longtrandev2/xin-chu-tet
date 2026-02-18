"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { type Wish } from "@/utils/supabase";

// ===== SVG Bao Lì Xì đẹp =====
function LiXiSVG({ size = 48, word }: { size?: number; word?: string }) {
  const h = size * 1.45;
  return (
    <svg width={size} height={h} viewBox="0 0 48 70" fill="none">
      {/* Dây treo */}
      <line x1="24" y1="0" x2="24" y2="10" stroke="#DAA520" strokeWidth="1.5" />

      {/* Thân lì xì */}
      <rect x="4" y="10" width="40" height="56" rx="4" fill="#D2042D" />
      <rect x="4" y="10" width="40" height="56" rx="4" stroke="#B80020" strokeWidth="0.5" />

      {/* Nắp trên */}
      <path d="M4 10 L4 28 Q24 34 44 28 L44 10 Q44 10 44 10 Z" fill="#E8102B" />
      <path d="M4 26 Q24 32 44 26" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.6" />

      {/* Hoa văn viền vàng */}
      <rect x="8" y="14" width="32" height="48" rx="2" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.4" />
      <rect x="10" y="16" width="28" height="44" rx="1" stroke="#FFD700" strokeWidth="0.3" fill="none" opacity="0.25" />

      {/* Hình tròn vàng giữa */}
      <circle cx="24" cy="42" r="12" fill="#FFD700" opacity="0.9" />
      <circle cx="24" cy="42" r="10.5" stroke="#DAA520" strokeWidth="0.5" fill="none" />

      {/* Chữ trong vòng tròn */}
      <text
        x="24"
        y="47"
        textAnchor="middle"
        fill="#D2042D"
        fontSize={word && word.length === 1 ? "13" : "9"}
        fontWeight="bold"
        style={{ fontFamily: "serif" }}
      >
        {word || "福"}
      </text>

      {/* Nơ vàng trên */}
      <ellipse cx="20" cy="11" rx="5" ry="3" fill="#FFD700" opacity="0.85" transform="rotate(-15 20 11)" />
      <ellipse cx="28" cy="11" rx="5" ry="3" fill="#FFD700" opacity="0.85" transform="rotate(15 28 11)" />
      <circle cx="24" cy="11" r="2.5" fill="#DAA520" />

      {/* Tua rua dưới */}
      <line x1="16" y1="66" x2="15" y2="70" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="24" y1="66" x2="24" y2="70" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="32" y1="66" x2="33" y2="70" stroke="#FFD700" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

interface WishEnvelopeProps {
  wish: Wish;
  onClick: (wish: Wish) => void;
  index: number;
}

export default function WishEnvelope({ wish, onClick, index }: WishEnvelopeProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Random sway cho mỗi envelope khác nhau
  const swayDuration = 3 + (index % 7) * 0.6; // 3-7.2s
  const swayDelay = (index % 5) * 0.4; // 0-2s delay
  const swayDegree = 4 + (index % 4) * 2; // 4-10 degrees

  return (
    <motion.div
      className="absolute cursor-pointer z-10"
      style={{
        left: `${wish.pos_x}%`,
        top: `${wish.pos_y}%`,
        transformOrigin: "top center",
      }}
      initial={{ opacity: 0, y: -40, scale: 0 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: [
          -swayDegree,
          swayDegree * 0.7,
          -swayDegree * 0.5,
          swayDegree * 0.8,
          -swayDegree,
        ],
      }}
      transition={{
        opacity: { duration: 0.6, delay: index * 0.05 },
        y: { duration: 0.8, delay: index * 0.05, ease: "easeOut" },
        scale: { duration: 0.5, delay: index * 0.05, ease: "backOut" },
        rotate: {
          duration: swayDuration,
          delay: swayDelay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      whileHover={{ scale: 1.2, zIndex: 50 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onClick(wish)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <LiXiSVG size={40} word={wish.word} />

        {/* Tooltip on hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded bg-ink/80 text-cream backdrop-blur-sm"
          >
            ❤ {wish.likes}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export { LiXiSVG };
