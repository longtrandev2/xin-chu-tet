"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const loadingMessages = [
  "Ông đồ đang mài mực...",
  "Nghiên bút đã thấm đẫm tình xuân...",
  "Đang luận giải tâm tư...",
  "Bút lông đã sẵn sàng...",
  "Chữ đang hiện lên trên giấy dó...",
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-10 px-4"
    >
      {/* Brush animation */}
      <motion.div
        className="relative w-48 h-48"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Nghiên mực */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Khay mực */}
          <ellipse cx="100" cy="150" rx="60" ry="20" fill="#2C1810" />
          <ellipse cx="100" cy="148" rx="55" ry="17" fill="#1a0f0a" />
          <ellipse cx="100" cy="148" rx="45" ry="13" fill="#0d0705">
            {/* Mực lắc nhẹ */}
            <animate
              attributeName="rx"
              values="45;47;45;43;45"
              dur="3s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Bút lông */}
          <motion.g
            animate={{
              rotate: [-15, 15, -15],
              x: [-5, 5, -5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "100px 140px" }}
          >
            {/* Thân bút */}
            <rect x="95" y="30" width="10" height="110" rx="3" fill="#8B4513" />
            <rect x="96" y="30" width="3" height="110" rx="1" fill="#A0522D" opacity="0.5" />
            {/* Đầu bút lông */}
            <path
              d="M95 140 Q92 155 100 165 Q108 155 105 140Z"
              fill="#1a1a1a"
            />
            <path
              d="M97 142 Q96 152 100 160 Q104 152 103 142Z"
              fill="#333"
              opacity="0.6"
            />
            {/* Viền vàng */}
            <rect x="93" y="135" width="14" height="6" rx="2" fill="#FFD700" opacity="0.8" />
            {/* Đốm mực rơi */}
            <motion.circle
              cx="100"
              cy="165"
              r="2"
              fill="#0d0705"
              animate={{ opacity: [0, 1, 0], cy: [165, 148, 148] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeIn" }}
            />
          </motion.g>

          {/* Giấy dưới (ink strokes đang viết) */}
          <motion.g>
            <rect x="20" y="170" width="160" height="25" rx="2" fill="#F5E6C8" opacity="0.3" />
            <motion.line
              x1="40"
              y1="178"
              x2="80"
              y2="178"
              stroke="#2C1810"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.line
              x1="90"
              y1="182"
              x2="140"
              y2="182"
              stroke="#2C1810"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.g>
        </svg>
      </motion.div>

      {/* Loading text */}
      <div className="text-center space-y-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gold-light font-medium"
            style={{ fontFamily: "var(--font-thuphap-local), serif" }}
          >
            {loadingMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Dots animation */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-gold"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
