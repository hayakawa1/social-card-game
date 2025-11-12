"use client";

import { SparkleEffect, FloatingHearts } from "@/components/ui/SparkleEffect";

export function GlobalEffects() {
  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-900 via-purple-900 to-cyan-900 -z-50" />
      <SparkleEffect />
      <FloatingHearts />

      {/* Decorative circles */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl -z-40" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-40" />
      <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-40" />
    </>
  );
}
