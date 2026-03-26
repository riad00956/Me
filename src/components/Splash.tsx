import { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onFinish: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#1c1c1c] z-50 overflow-hidden">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.06 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px]"
      />
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 mb-6 bg-blue-500 rounded-[28px] flex items-center justify-center shadow-2xl shadow-blue-500/40"
        >
          <span className="text-4xl font-black text-white">M</span>
        </motion.div>
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">
            Memegram
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[2px] w-6 bg-blue-500 rounded-full" />
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.25em]">
              Premium Bot Client
            </p>
            <div className="h-[2px] w-6 bg-blue-500 rounded-full" />
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-10 flex items-center gap-1"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
          />
        ))}
      </motion.div>
    </div>
  );
}
