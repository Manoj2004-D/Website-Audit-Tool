// components/LoaderCard.tsx
import { motion } from "framer-motion";

function LoaderCard() {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-gray-900/80 border border-purple-500/40 rounded-2xl shadow-xl w-full max-w-xl mx-auto">
      {/* Cyberpunk Glow Ring */}
      <motion.div
        className="w-24 h-24 border-4 border-purple-500 rounded-full"
        animate={{
          rotate: 360,
          boxShadow: [
            "0 0 10px #a855f7, 0 0 20px #a855f7",
            "0 0 20px #06b6d4, 0 0 40px #06b6d4",
            "0 0 15px #a855f7, 0 0 30px #a855f7",
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
      />

      {/* Scanning Text */}
      <motion.p
        className="mt-6 text-lg font-semibold text-purple-300 tracking-wider"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Scanning Website...
      </motion.p>

      {/* Progress Dots */}
      <div className="flex space-x-2 mt-3">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            className="w-3 h-3 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default LoaderCard;
