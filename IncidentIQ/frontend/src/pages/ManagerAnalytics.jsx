import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ManagerAnalytics = () => {
  const severityData = [
    { name: 'High', value: 30, color: '#ef4444' },
    { name: 'Medium', value: 45, color: '#f59e0b' },
    { name: 'Low', value: 25, color: '#3b82f6' },
  ];

  const rootCauseData = [
    { name: 'Code Bug', incidents: 42 },
    { name: 'Database Load', incidents: 28 },
    { name: 'Network Timeout', incidents: 15 },
    { name: 'Memory Leak', incidents: 12 },
    { name: 'Config Error', incidents: 8 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto py-6">
      <motion.div variants={itemVariants} className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-[#18181B] border border-transparent dark:border-[#27272A] flex items-center justify-center shadow-lg shadow-blue-600/20">
          <BarChart2 className="h-6 w-6 text-white dark:text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Analytics</h1>
          <p className="text-slate-500 dark:text-[#A1A1AA] text-sm mt-1">Deep dive into incident trends and root cause categories.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] shadow-xl p-8 rounded-[2rem] flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Severity Distribution</h3>
            <div className="p-2 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg">
              <PieChartIcon className="h-4 w-4 text-slate-400 dark:text-[#A1A1AA]" />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Root Cause Categories */}
        <motion.div variants={itemVariants} className="bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] shadow-xl p-8 rounded-[2rem] flex flex-col h-[420px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Common Root Causes</h3>
            <div className="p-2 bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg">
              <BarChart2 className="h-4 w-4 text-slate-400 dark:text-[#A1A1AA]" />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rootCauseData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={120} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Bar dataKey="incidents" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={24}>
                  {rootCauseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ManagerAnalytics;
