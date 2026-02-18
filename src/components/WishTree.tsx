"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { type Wish } from "@/utils/supabase";
import WishEnvelope from "./WishEnvelope";
import WishModal from "./WishModal";

// ===== CÂY ĐÀO SVG FULL =====
function PeachBlossomTree() {
  return (
    <svg
      viewBox="0 0 900 700"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Nền gradient nhẹ */}
      <defs>
        <radialGradient id="treeGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="rgba(255,215,0,0.06)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="blossom-blur">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
      <rect width="900" height="700" fill="url(#treeGlow)" />

      {/* === THÂN CÂY CHÍNH === */}
      <path
        d="M450 690 Q445 650 440 580 Q435 500 430 440 Q425 380 435 330 Q440 280 450 240 Q455 200 445 160"
        stroke="#5C3D2E"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Vân gỗ */}
      <path
        d="M445 680 Q442 600 438 500 Q434 420 437 350 Q440 290 448 240"
        stroke="#4A3222"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M452 670 Q448 580 445 470 Q442 400 445 340 Q448 280 452 230"
        stroke="#6B4A35"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* === CÀNH LỚN BÊN PHẢI === */}
      <path
        d="M445 300 Q490 280 560 250 Q620 230 700 210 Q760 195 820 200"
        stroke="#5C3D2E"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Cành phụ phải trên */}
      <path
        d="M600 240 Q640 200 680 170 Q720 145 770 140"
        stroke="#5C3D2E"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Cành phụ phải giữa */}
      <path
        d="M560 250 Q590 280 640 290 Q680 300 730 285"
        stroke="#5C3D2E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* Cành nhỏ phải dưới */}
      <path
        d="M700 210 Q730 240 780 250 Q810 255 840 245"
        stroke="#5C3D2E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* === CÀNH LỚN BÊN TRÁI === */}
      <path
        d="M440 270 Q390 240 320 210 Q260 185 190 170 Q130 160 80 175"
        stroke="#5C3D2E"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Cành phụ trái trên */}
      <path
        d="M300 200 Q260 165 210 145 Q170 130 120 130"
        stroke="#5C3D2E"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Cành phụ trái giữa */}
      <path
        d="M320 215 Q290 250 240 265 Q200 275 160 260"
        stroke="#5C3D2E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* Cành nhỏ trái dưới */}
      <path
        d="M200 180 Q160 210 120 220 Q90 225 60 215"
        stroke="#5C3D2E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* === CÀNH GIỮA / NGỌN === */}
      <path
        d="M445 200 Q430 150 400 110 Q380 80 350 55"
        stroke="#5C3D2E"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M448 180 Q470 140 500 105 Q530 75 560 55"
        stroke="#5C3D2E"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Cành ngọn nhỏ */}
      <path
        d="M420 140 Q390 120 365 90"
        stroke="#5C3D2E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M460 150 Q490 120 520 95"
        stroke="#5C3D2E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* === CÀNH THẤP (hai bên gốc) === */}
      <path
        d="M440 400 Q380 380 320 390 Q270 400 230 380"
        stroke="#5C3D2E"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M445 420 Q510 400 570 415 Q620 425 670 405"
        stroke="#5C3D2E"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* === HOA ĐÀO === */}
      {[
        // Cành phải
        { cx: 700, cy: 205, r: 14 },
        { cx: 760, cy: 195, r: 12 },
        { cx: 820, cy: 200, r: 10 },
        { cx: 640, cy: 235, r: 13 },
        { cx: 680, cy: 165, r: 11 },
        { cx: 730, cy: 145, r: 10 },
        { cx: 770, cy: 140, r: 12 },
        { cx: 640, cy: 290, r: 10 },
        { cx: 700, cy: 285, r: 11 },
        { cx: 780, cy: 250, r: 9 },
        { cx: 840, cy: 242, r: 10 },
        // Cành trái
        { cx: 190, cy: 170, r: 14 },
        { cx: 130, cy: 165, r: 12 },
        { cx: 80, cy: 175, r: 10 },
        { cx: 260, cy: 195, r: 13 },
        { cx: 210, cy: 145, r: 11 },
        { cx: 160, cy: 130, r: 10 },
        { cx: 120, cy: 128, r: 12 },
        { cx: 240, cy: 265, r: 10 },
        { cx: 180, cy: 260, r: 11 },
        { cx: 120, cy: 218, r: 9 },
        { cx: 65, cy: 213, r: 10 },
        // Ngọn
        { cx: 400, cy: 108, r: 12 },
        { cx: 360, cy: 60, r: 10 },
        { cx: 500, cy: 103, r: 11 },
        { cx: 555, cy: 58, r: 10 },
        { cx: 370, cy: 88, r: 9 },
        { cx: 518, cy: 93, r: 9 },
        { cx: 445, cy: 160, r: 11 },
        // Cành thấp
        { cx: 320, cy: 388, r: 10 },
        { cx: 260, cy: 395, r: 9 },
        { cx: 230, cy: 378, r: 10 },
        { cx: 570, cy: 413, r: 10 },
        { cx: 630, cy: 420, r: 9 },
        { cx: 670, cy: 403, r: 10 },
      ].map((f, i) => (
        <g key={`flower-${i}`}>
          {/* 5 cánh hoa */}
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx={f.cx}
              cy={f.cy}
              rx={f.r * 0.4}
              ry={f.r * 0.75}
              fill={i % 3 === 0 ? "#FF85B3" : i % 3 === 1 ? "#FF69B4" : "#FFB6C1"}
              opacity={0.65 + (i % 3) * 0.1}
              transform={`rotate(${angle} ${f.cx} ${f.cy}) translate(0 ${-f.r * 0.45})`}
              filter="url(#blossom-blur)"
            >
              <animate
                attributeName="opacity"
                values={`${0.5 + (i % 3) * 0.1};${0.75 + (i % 3) * 0.05};${0.5 + (i % 3) * 0.1}`}
                dur={`${3 + (i % 4)}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          ))}
          {/* Nhụy hoa */}
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.2} fill="#FFD700" opacity="0.9" />
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.1} fill="#FFA500" opacity="0.7" />
        </g>
      ))}

      {/* === NỤ HOA nhỏ === */}
      {[
        { cx: 550, cy: 245, r: 5 },
        { cx: 610, cy: 260, r: 4 },
        { cx: 300, cy: 225, r: 5 },
        { cx: 160, cy: 200, r: 4 },
        { cx: 420, cy: 130, r: 4 },
        { cx: 480, cy: 125, r: 5 },
        { cx: 350, cy: 395, r: 4 },
        { cx: 600, cy: 408, r: 4 },
        { cx: 750, cy: 215, r: 4 },
        { cx: 100, cy: 185, r: 4 },
      ].map((bud, i) => (
        <g key={`bud-${i}`}>
          <circle cx={bud.cx} cy={bud.cy} r={bud.r} fill="#FF85B3" opacity="0.5" />
          <circle cx={bud.cx} cy={bud.cy} r={bud.r * 0.5} fill="#FF69B4" opacity="0.4" />
        </g>
      ))}

      {/* Gốc cây / Rễ */}
      <path
        d="M430 680 Q410 695 390 700"
        stroke="#5C3D2E"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M460 680 Q480 695 500 700"
        stroke="#5C3D2E"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

// ===== MAIN WISHTREE COMPONENT =====
interface WishTreeProps {
  wishes: Wish[];
  loading: boolean;
  onLike: (wishId: string, currentLikes: number) => Promise<void>;
  isPlacingMode?: boolean;
  onPlaceWish?: (posX: number, posY: number) => void;
}

// Khoảng cách tối thiểu giữa các lì xì (% of container)
const MIN_DISTANCE = 7;

function isTooClose(
  posX: number,
  posY: number,
  wishes: Wish[]
): boolean {
  return wishes.some((w) => {
    const dx = w.pos_x - posX;
    const dy = w.pos_y - posY;
    return Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE;
  });
}

export default function WishTree({
  wishes,
  loading,
  onLike,
  isPlacingMode = false,
  onPlaceWish,
}: WishTreeProps) {
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [placingHover, setPlacingHover] = useState<{ x: number; y: number } | null>(null);
  const [hoverBlocked, setHoverBlocked] = useState(false);

  const handleTreeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPlacingMode || !onPlaceWish) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const posX = ((e.clientX - rect.left) / rect.width) * 100;
      const posY = ((e.clientY - rect.top) / rect.height) * 100;

      // Giới hạn vùng treo (tránh gốc cây & ngoài biên)
      if (posY > 85 || posY < 5 || posX < 3 || posX > 97) return;

      // Kiểm tra trùng lặp
      if (isTooClose(posX, posY, wishes)) return;

      onPlaceWish(Math.round(posX * 10) / 10, Math.round(posY * 10) / 10);
    },
    [isPlacingMode, onPlaceWish, wishes]
  );

  const handleTreeMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPlacingMode) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPlacingHover({ x, y });
      setHoverBlocked(isTooClose(x, y, wishes));
    },
    [isPlacingMode, wishes]
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <h2
          className="text-3xl md:text-5xl lg:text-6xl text-gold gold-glow"
          style={{ fontFamily: "var(--font-thuphap-local), serif" }}
        >
          🌸 Cây Ước Nguyện 🌸
        </h2>
        <p className="text-cream/60 text-sm md:text-base lg:text-lg mt-2">
          {wishes.length > 0
            ? `${wishes.length} ước nguyện đã được treo`
            : "Hãy là người đầu tiên treo ước nguyện!"}
          {isPlacingMode && (
            <span className="text-gold font-semibold ml-2">— Chạm vào cây để treo lì xì của bạn</span>
          )}
        </p>
      </div>

      {/* Tree container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden ${
          isPlacingMode ? "cursor-crosshair ring-2 ring-gold/40" : ""
        }`}
        style={{
          aspectRatio: "9/7",
          maxHeight: "75vh",
          background: "linear-gradient(180deg, rgba(139,0,0,0.3) 0%, rgba(92,0,21,0.2) 100%)",
        }}
        onClick={handleTreeClick}
        onMouseMove={handleTreeMouseMove}
        onMouseLeave={() => setPlacingHover(null)}
      >
        {/* Cây đào SVG nền */}
        <div className="absolute inset-0">
          <PeachBlossomTree />
        </div>

        {/* Placing mode indicator */}
        {isPlacingMode && placingHover && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{
              left: `${placingHover.x}%`,
              top: `${placingHover.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: hoverBlocked ? 0.4 : 0.7,
            }}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className={`w-12 h-16 border-2 border-dashed rounded-lg flex items-center justify-center ${
              hoverBlocked ? "border-red-400" : "border-gold"
            }`}>
              <span className={`text-2xl ${hoverBlocked ? "text-red-400" : "text-gold"}`}>
                {hoverBlocked ? "✕" : "+"}
              </span>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Wishes / Lì xì treo */}
        <AnimatePresence>
          {wishes.map((wish, i) => (
            <WishEnvelope
              key={wish.id}
              wish={wish}
              index={i}
              onClick={setSelectedWish}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Modal xem ước nguyện */}
      <WishModal
        wish={selectedWish}
        onClose={() => setSelectedWish(null)}
        onLike={onLike}
      />
    </motion.section>
  );
}
