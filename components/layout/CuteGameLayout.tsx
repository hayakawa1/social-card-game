"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { SparkleEffect, FloatingHearts } from "@/components/ui/SparkleEffect";
import { Star } from "lucide-react";

interface CuteGameLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function CuteGameLayout({ children, title, subtitle }: CuteGameLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-cyan-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <SparkleEffect />
      <FloatingHearts />

      {/* Decorative circles */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {title && (
              <div className="flex items-center justify-center gap-3 mb-2">
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>
            )}
            {subtitle && (
              <p className="text-pink-300 text-lg font-bold">{subtitle}</p>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </div>
  );
}
