/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Droplet } from "lucide-react";

interface WaveProgressProps {
  progress: number; // 0 to 1
  goal: number;
  current: number;
}

export default function WaveProgress({ progress, goal, current }: WaveProgressProps) {
  const percentage = Math.min(Math.round(progress * 100), 100);
  
  return (
    <div className="relative w-64 h-64 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden group">
      {/* Background Water Wave */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-blue-500/40"
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <motion.div
          className="absolute top-0 left-[-100%] w-[400%] h-20 bg-blue-400/30 rounded-[40%]"
          animate={{
            x: ["0%", "-50%"],
            rotate: [0, 360],
          }}
          transition={{
            x: { duration: 5, repeat: Infinity, ease: "linear" },
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          }}
        />
        <motion.div
          className="absolute top-0 left-[-100%] w-[400%] h-24 bg-blue-600/20 rounded-[45%]"
          animate={{
            x: ["-50%", "0%"],
            rotate: [360, 0],
          }}
          transition={{
            x: { duration: 7, repeat: Infinity, ease: "linear" },
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-2"
        >
          <Droplet className="w-10 h-10 text-blue-300 drop-shadow-md" />
        </motion.div>
        <h2 className="text-4xl font-bold text-white tracking-tight">
          {percentage}%
        </h2>
        <p className="text-blue-100/70 text-sm font-medium uppercase tracking-widest mt-1">
          {current} / {goal} ml
        </p>
      </div>

      {/* Hover effect highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
