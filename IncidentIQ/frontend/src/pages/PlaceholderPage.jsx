import React from 'react';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ title, description }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] p-12 rounded-[2rem] shadow-2xl max-w-lg w-full flex flex-col items-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-[#18181B] border border-blue-100 dark:border-[#27272A] rounded-2xl flex items-center justify-center mb-8 shadow-sm">
          <Construction className="h-10 w-10 text-blue-600 dark:text-[#A855F7]" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">{title}</h1>
        <p className="text-slate-500 dark:text-[#A1A1AA] text-lg leading-relaxed">
          {description || 'This module is currently under development. Please check back later.'}
        </p>
      </div>
    </motion.div>
  );
};

export default PlaceholderPage;
