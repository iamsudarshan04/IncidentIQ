import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  TerminalSquare, 
  LayoutDashboard, 
  Plus, 
  FileText, 
  History, 
  Activity, 
  Bell, 
  Settings,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const developerLinks = [
    { name: 'Workspace', path: '/dev-dashboard', icon: LayoutDashboard },
    { name: 'Analyze Incident', path: '/incidents/new', icon: Plus },
    { name: 'RCA Reports', path: '/reports', icon: FileText },
    { name: 'Timeline', path: '/history', icon: History },
    { name: 'Metrics', path: '/analytics', icon: Activity },
  ];

  const managerLinks = [
    { name: 'Overview', path: '/manager-dashboard', icon: LayoutDashboard },
    { name: 'All Reports', path: '/manager-reports', icon: FileText },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Performance', path: '/manager-analytics', icon: Activity },
  ];

  const systemLinks = [
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const links = user?.role === 'Developer' ? developerLinks : managerLinks;

  return (
    <div className="w-20 md:w-64 h-screen fixed left-0 top-0 p-4 flex flex-col z-40">
      
      {/* Floating Glass Panel */}
      <div className="flex-1 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] shadow-2xl rounded-[2rem] flex flex-col overflow-hidden">
        
        {/* Logo / Branding */}
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100 dark:border-[#27272A]/50 bg-white/50 dark:bg-black/20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-xl bg-blue-600 dark:bg-gradient-to-br dark:from-[#A855F7] dark:to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <TerminalSquare className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white hidden md:block">IncidentIQ</span>
          </Link>
        </div>

        {/* Links */}
        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
          <div className="mb-2 px-3 text-[10px] font-bold text-slate-400 dark:text-[#A1A1AA] uppercase tracking-widest hidden md:block">Modules</div>
          
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative flex items-center justify-center md:justify-start gap-3 p-3 md:px-4 md:py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? "text-blue-700 dark:text-white" 
                    : "text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white"
                }`}
                title={link.name}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`relative z-10 h-5 w-5 transition-transform ${isActive ? "scale-110 text-blue-600 dark:text-[#A855F7]" : "group-hover:scale-110"}`} />
                <span className="relative z-10 hidden md:block">{link.name}</span>
              </Link>
            );
          })}

          <div className="mt-8 mb-2 px-3 text-[10px] font-bold text-slate-400 dark:text-[#A1A1AA] uppercase tracking-widest hidden md:block">System</div>
          
          {systemLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative flex items-center justify-center md:justify-start gap-3 p-3 md:px-4 md:py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? "text-blue-700 dark:text-white" 
                    : "text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white"
                }`}
                title={link.name}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`relative z-10 h-5 w-5 transition-transform ${isActive ? "scale-110 text-blue-600 dark:text-[#A855F7]" : "group-hover:scale-110"}`} />
                <span className="relative z-10 hidden md:block">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Mini Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-[#27272A]/50 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-[#18181B] border border-blue-200 dark:border-[#27272A] flex items-center justify-center text-blue-700 dark:text-[#FAFAFA] font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0 hidden md:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-blue-600 dark:text-[#A855F7] font-medium truncate">{user?.role}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
