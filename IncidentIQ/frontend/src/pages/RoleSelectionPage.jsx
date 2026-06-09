import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Terminal, BarChart2, ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleSelectionPage = () => {
  const [loading, setLoading] = useState(false);
  const { updateRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = async (role) => {
    setLoading(true);
    try {
      await updateRole(role);
      
      // Artificial delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (role === 'Developer') {
        navigate('/dev-dashboard');
      } else {
        navigate('/manager-dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring' } }
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-500 flex flex-col items-center justify-center cloud-bg text-slate-900 relative overflow-hidden py-12 px-6">
      
      {/* Background Soft Glows (from Layout.jsx) */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] mix-blend-multiply opacity-50 pointer-events-none transition-colors duration-500 bg-blue-100" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] mix-blend-multiply opacity-30 pointer-events-none transition-colors duration-500 bg-cyan-100" />
      
      {/* Logout Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={logout}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-sm font-bold text-[13px] flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[1000px] w-full relative z-10 flex flex-col items-center">
        
        <motion.div variants={itemVariants} className="text-center mb-16 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 bg-gradient-to-br from-blue-600 to-indigo-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 text-slate-800">Choose Your Workspace</h1>
          <p className="text-lg max-w-xl text-slate-500">Select how you want to use IncidentIQ for this session.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          
          {/* Developer Card */}
          <motion.div 
            variants={itemVariants}
            className="group relative w-full rounded-[2.5rem] p-10 shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-white/70 backdrop-blur-2xl border border-white hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)]"
          >
            <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1.5px] bg-gradient-to-br from-blue-500 to-indigo-500 pointer-events-none z-0" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
            
            <div className="mb-6 relative z-10">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm bg-blue-50/50 border border-blue-100/50">
                <Terminal className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">Developer</h2>
              <p className="text-[15px] leading-relaxed mb-8 text-slate-500">
                Generate AI-powered RCA reports from timelines, logs and git changes.
              </p>
            </div>

            <button 
              disabled={loading}
              onClick={() => handleSelectRole('Developer')}
              className="w-full font-bold rounded-full px-6 py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn mt-auto relative z-10 bg-slate-50 text-slate-700 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30"
            >
              {loading ? 'Setting up session...' : 'Start as Developer'}
              {!loading && <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </motion.div>

          {/* IT Manager Card */}
          <motion.div 
            variants={itemVariants}
            className="group relative w-full rounded-[2.5rem] p-10 shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col bg-white/70 backdrop-blur-2xl border border-white hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)]"
          >
            <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1.5px] bg-gradient-to-br from-cyan-400 to-blue-500 pointer-events-none z-0" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
            
            <div className="mb-6 relative z-10">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm bg-cyan-50/50 border border-cyan-100/50">
                <BarChart2 className="h-8 w-8 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3 text-slate-800 group-hover:text-cyan-600 transition-colors">IT Manager</h2>
              <p className="text-[15px] leading-relaxed mb-8 text-slate-500">
                Review submitted RCA reports, monitor incidents and track operational insights.
              </p>
            </div>

            <button 
              disabled={loading}
              onClick={() => handleSelectRole('IT Manager')}
              className="w-full font-bold rounded-full px-6 py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group/btn mt-auto relative z-10 bg-slate-50 text-slate-700 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-cyan-500/30"
            >
              {loading ? 'Setting up session...' : 'Start as IT Manager'}
              {!loading && <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />}
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelectionPage;
