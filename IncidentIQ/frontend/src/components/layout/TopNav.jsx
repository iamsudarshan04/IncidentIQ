import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ChevronLeft, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

const TopNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 rounded-full px-4 py-2.5 flex items-center justify-between"
    >
      
      {/* Left: Logo */}
      <div className="flex-1 pl-2">
        <Link to="/" className="flex items-center gap-2 group inline-flex">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Hexagon className="h-5 w-5" fill="currentColor" strokeWidth={1} />
          </div>
          <span className="font-black tracking-tight text-lg text-slate-800">IncidentIQ</span>
        </Link>
      </div>

      {/* Center: Empty */}
      <div className="flex-1"></div>

      {/* Right: Actions */}
      <div className="flex-1 flex justify-end items-center gap-2 pr-1">
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="h-10 px-4 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-full transition-colors font-bold text-[13px]"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="h-10 w-10 flex items-center justify-center bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </motion.button>

      </div>
    </motion.div>
  );
};

export default TopNav;
