"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 2,
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-300 via-purple-300 to-cyan-300 rounded-full blur-sm" />
        </motion.div>
      ))}
    </div>
  );
}

export function FloatingHearts() {
  const hearts = ["💕", "💖", "💗", "💝", "💓"];
  const [windowHeight, setWindowHeight] = useState(1000);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: "-10%",
          }}
          animate={{
            y: [0, -windowHeight - 100],
            x: [0, Math.sin(i) * 50],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {hearts[i % hearts.length]}
        </motion.div>
      ))}
    </div>
  );
}
