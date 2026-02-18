"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ===== HOA ĐÀO / HOA MAI RƠI =====
function PetalFall() {
  const [petals, setPetals] = useState<
    { id: number; x: number; delay: number; duration: number; size: number; type: "dao" | "mai" }[]
  >([]);

  useEffect(() => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 12,
      size: 10 + Math.random() * 16,
      type: (Math.random() > 0.4 ? "dao" : "mai") as "dao" | "mai",
    }));
    setPetals(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-40px",
            animation: `petal-fall ${p.duration}s ${p.delay}s linear infinite`,
          }}
        >
          {p.type === "dao" ? (
            // Hoa đào - 5 cánh hồng
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 14 6 14 8C14 10 12 12 12 12C12 12 10 10 10 8C10 6 12 2 12 2Z"
                fill="#FF69B4"
                opacity="0.8"
              />
              <path
                d="M12 2C12 2 16 4 17 6C18 8 16 11 16 11C16 11 13 10 12 8C11 6 12 2 12 2Z"
                fill="#FFB6C1"
                opacity="0.7"
              />
              <path
                d="M12 2C12 2 8 4 7 6C6 8 8 11 8 11C8 11 11 10 12 8C13 6 12 2 12 2Z"
                fill="#FF69B4"
                opacity="0.6"
              />
              <circle cx="12" cy="8" r="1.5" fill="#FFD700" />
            </svg>
          ) : (
            // Hoa mai - 5 cánh vàng
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C12 3 14 7 14 9C14 11 12 12 12 12C12 12 10 11 10 9C10 7 12 3 12 3Z"
                fill="#FFD700"
                opacity="0.85"
              />
              <path
                d="M12 3C12 3 16 5 17 7C18 9 16 12 16 12C16 12 13 11 12 9C11 7 12 3 12 3Z"
                fill="#FFC107"
                opacity="0.7"
              />
              <path
                d="M12 3C12 3 8 5 7 7C6 9 8 12 8 12C8 12 11 11 12 9C13 7 12 3 12 3Z"
                fill="#FFD700"
                opacity="0.75"
              />
              <circle cx="12" cy="9" r="1.2" fill="#8B4513" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== LÌ XÌ RƠI =====
function LiXiFall() {
  const [envelopes, setEnvelopes] = useState<
    { id: number; x: number; delay: number; duration: number; size: number }[]
  >([]);

  useEffect(() => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 14 + Math.random() * 10,
      size: 24 + Math.random() * 16,
    }));
    setEnvelopes(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {envelopes.map((e) => (
        <div
          key={e.id}
          className="absolute"
          style={{
            left: `${e.x}%`,
            top: "-100px",
            animation: `lixi-fall ${e.duration}s ${e.delay}s linear infinite`,
          }}
        >
          {/* Lì xì envelope SVG */}
          <svg width={e.size} height={e.size * 1.4} viewBox="0 0 40 56" fill="none">
            <rect x="2" y="8" width="36" height="46" rx="3" fill="#D2042D" stroke="#FFD700" strokeWidth="1.5" />
            <rect x="6" y="12" width="28" height="18" rx="2" fill="#8B0000" />
            <path d="M20 8L8 20H32L20 8Z" fill="#B80020" />
            <circle cx="20" cy="32" r="8" fill="#FFD700" opacity="0.9" />
            <text x="20" y="36" textAnchor="middle" fill="#D2042D" fontSize="10" fontWeight="bold">
              福
            </text>
            <rect x="14" y="4" width="12" height="8" rx="2" fill="#FFD700" opacity="0.8" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ===== CÀNH ĐÀO TRANG TRÍ =====
function CanhDao() {
  return (
    <div className="fixed top-0 left-0 pointer-events-none z-5 opacity-40">
      <svg width="280" height="400" viewBox="0 0 280 400" fill="none">
        {/* Cành chính */}
        <path
          d="M0 50 Q60 80 100 150 Q130 200 120 280 Q115 320 130 380"
          stroke="#5C3D2E"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Cành phụ 1 */}
        <path
          d="M60 100 Q100 90 140 100 Q160 105 180 95"
          stroke="#5C3D2E"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Cành phụ 2 */}
        <path
          d="M90 170 Q130 160 160 180 Q180 190 200 175"
          stroke="#5C3D2E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Cành phụ 3 */}
        <path
          d="M100 130 Q70 110 50 120"
          stroke="#5C3D2E"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Hoa đào trên cành */}
        {[
          { cx: 140, cy: 100, r: 12 },
          { cx: 180, cy: 95, r: 10 },
          { cx: 160, cy: 180, r: 11 },
          { cx: 200, cy: 175, r: 9 },
          { cx: 120, cy: 145, r: 10 },
          { cx: 50, cy: 120, r: 8 },
          { cx: 100, cy: 200, r: 9 },
          { cx: 130, cy: 260, r: 10 },
        ].map((flower, i) => (
          <g key={i} style={{ animation: `sway 3s ${i * 0.4}s ease-in-out infinite` }}>
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx={flower.cx}
                cy={flower.cy}
                rx={flower.r * 0.45}
                ry={flower.r * 0.8}
                fill="#FF69B4"
                opacity="0.7"
                transform={`rotate(${angle} ${flower.cx} ${flower.cy}) translate(0 ${-flower.r * 0.5})`}
              />
            ))}
            <circle cx={flower.cx} cy={flower.cy} r={flower.r * 0.25} fill="#FFD700" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ===== CON NGỰA (Bính Ngọ) =====
function HorseDecoration() {
  return (
    <motion.div
      className="fixed bottom-6 right-4 pointer-events-none z-5 opacity-40 hidden md:block"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="180" height="160" viewBox="0 0 200 180" fill="none">
        <defs>
          <linearGradient id="bgHorseBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#DAA520" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
          <linearGradient id="bgHorseMane" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2042D" />
            <stop offset="100%" stopColor="#8B0000" />
          </linearGradient>
        </defs>
        {/* Thân */}
        <path d="M55 95 Q55 70 80 65 Q110 58 130 65 Q155 72 155 95 Q155 115 130 120 Q100 126 75 120 Q55 115 55 95Z" fill="url(#bgHorseBody)" opacity="0.85" />
        {/* Cổ */}
        <path d="M130 75 Q140 55 148 38 Q152 28 145 22" fill="url(#bgHorseBody)" opacity="0.85" />
        <path d="M125 80 Q132 60 140 42 Q143 32 138 25" fill="url(#bgHorseBody)" opacity="0.8" />
        {/* Đầu */}
        <path d="M138 25 Q145 18 155 20 Q168 22 172 35 Q175 45 168 52 Q160 58 148 55 Q140 52 138 42Z" fill="url(#bgHorseBody)" opacity="0.85" />
        {/* Mõm */}
        <path d="M168 35 Q178 38 180 45 Q180 50 174 52 Q168 52 168 45Z" fill="#DAA520" opacity="0.65" />
        <circle cx="175" cy="44" r="1.5" fill="#8B4513" opacity="0.5" />
        {/* Mắt */}
        <ellipse cx="160" cy="33" rx="3" ry="3.5" fill="#2C1810" opacity="0.7" />
        <circle cx="159" cy="32" r="1" fill="white" opacity="0.6" />
        {/* Tai */}
        <path d="M148 20 Q145 8 150 5 Q155 4 154 14Z" fill="url(#bgHorseBody)" opacity="0.8" />
        <path d="M155 18 Q158 6 162 5 Q166 6 160 16Z" fill="url(#bgHorseBody)" opacity="0.8" />
        {/* Bờm đỏ */}
        <path d="M145 15 Q138 22 135 35 Q132 45 128 55 Q125 62 122 70" stroke="url(#bgHorseMane)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M148 18 Q142 28 140 40 Q138 50 135 60" stroke="url(#bgHorseMane)" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M150 20 Q146 30 145 42" stroke="url(#bgHorseMane)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
        {/* Yên ngựa */}
        <path d="M80 72 Q95 62 120 62 Q135 64 140 72 Q135 75 120 74 Q95 74 80 72Z" fill="#D2042D" opacity="0.6" />
        <path d="M85 70 Q100 63 118 63 Q132 65 136 70" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.5" />
        {/* Chân */}
        <path d="M75 115 Q73 135 70 150 Q69 155 72 157" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M88 118 Q87 138 85 152 Q84 156 87 158" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M120 118 Q122 138 124 152 Q124 156 121 158" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M135 115 Q138 135 140 150 Q141 155 138 157" stroke="#DAA520" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
        {/* Móng vàng */}
        <ellipse cx="72" cy="158" rx="4" ry="2.5" fill="#FFD700" opacity="0.6" />
        <ellipse cx="87" cy="159" rx="4" ry="2.5" fill="#FFD700" opacity="0.6" />
        <ellipse cx="121" cy="159" rx="4" ry="2.5" fill="#FFD700" opacity="0.6" />
        <ellipse cx="138" cy="158" rx="4" ry="2.5" fill="#FFD700" opacity="0.6" />
        {/* Đuôi */}
        <path d="M55 88 Q40 80 30 85 Q22 90 25 100 Q28 108 35 112" stroke="url(#bgHorseMane)" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M55 92 Q42 85 35 92 Q30 98 34 106" stroke="url(#bgHorseMane)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
        {/* Chữ 馬 */}
        <text x="108" y="73" textAnchor="middle" fill="#FFD700" fontSize="9" fontWeight="bold" opacity="0.5" style={{fontFamily: 'serif'}}>馬</text>
      </svg>
    </motion.div>
  );
}

// ===== VIỀN TRANG TRÍ HOA VĂN =====
function BorderDecoration() {
  return (
    <>
      {/* Top border */}
      <div className="fixed top-0 left-0 right-0 h-3 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #FFD700, #DAA520, #FFD700, #DAA520, #FFD700)",
          backgroundSize: "40px 100%",
        }}
      />
      {/* Bottom border */}
      <div className="fixed bottom-0 left-0 right-0 h-3 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #FFD700, #DAA520, #FFD700, #DAA520, #FFD700)",
          backgroundSize: "40px 100%",
        }}
      />
      {/* Bốn góc trang trí */}
      {[
        "top-3 right-0",
        "bottom-3 right-0 rotate-90",
      ].map((pos, i) => (
        <div key={i} className={`fixed ${pos} z-20 pointer-events-none opacity-40`}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M80 0 Q60 20 60 40 Q60 60 80 80" stroke="#FFD700" strokeWidth="2" fill="none" />
            <path d="M70 0 Q50 20 50 40 Q50 60 70 80" stroke="#FFD700" strokeWidth="1" fill="none" />
            <circle cx="65" cy="40" r="3" fill="#FFD700" opacity="0.6" />
          </svg>
        </div>
      ))}
    </>
  );
}

// ===== MAIN BACKGROUND COMPONENT =====
export default function TetBackground() {
  return (
    <>
      <BorderDecoration />
      <CanhDao />
      <HorseDecoration />
      <PetalFall />
      <LiXiFall />
    </>
  );
}
