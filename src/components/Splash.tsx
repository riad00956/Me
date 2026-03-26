import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#1c1c1c] z-50 transition-colors overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.05 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px]"
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8 
          }}
          className="w-32 h-32 mb-8 relative"
        >
          <div className="absolute inset-0 bg-blue-500 rounded-[32px] blur-2xl opacity-20 animate-pulse" />
          <img 
            src="/icon/logo.png" 
            alt="Memegram Logo" 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
            Memegram
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[2px] w-8 bg-blue-500 rounded-full" />
            <p className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em]">
              Premium Bot Client
            </p>
            <div className="h-[2px] w-8 bg-blue-500 rounded-full" />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-3"
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-blue-500 rounded-full"
            />
          ))}
        </div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          powered by ꪑꫀꪑꫀ ꪜꪖ꠸ꪗꪖ
        </p>
      </motion.div>
    </div>
  );
}
