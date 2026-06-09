import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, FileText, ChevronRight, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DeveloperDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsAndNotify = async () => {
      try {
        const res = await axios.get('/api/reports?status=All');
        const allReports = res.data;
        setReports(allReports.slice(0, 5)); // Show only top 5 recent

        // Check for unnotified Approved/Rejected reports
        const unnotified = allReports.filter(r => r.notified === 0 && ['Approved', 'Rejected'].includes(r.status));
        
        for (const report of unnotified) {
          if (report.status === 'Approved') {
            toast.success(`Your RCA Report '${report.incident_title || 'Untitled'}' has been approved by ${report.manager_name || 'Manager'}.`, { duration: 6000 });
          } else if (report.status === 'Rejected') {
            toast.error(`Your RCA Report '${report.incident_title || 'Untitled'}' was rejected by ${report.manager_name || 'Manager'}.\nReason: ${report.manager_comment || 'No reason provided'}`, { duration: 8000 });
          }
          // Mark as notified
          await axios.post(`/api/reports/${report.incident_id}/mark-notified`);
        }
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsAndNotify();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const getStatusBadge = (report) => {
    if (report.status === 'Approved') return <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><CheckCircle className="h-3 w-3"/> Approved</span>;
    if (report.status === 'Rejected') return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200"><XCircle className="h-3 w-3"/> Rejected</span>;
    if (report.status === 'Submitted' || report.status === 'Pending Review') return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Submitted</span>;
    return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">Generated</span>;
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center max-w-5xl mx-auto px-4 w-full py-12 pb-24">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full flex flex-col items-center">
        
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">Select Workspace</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Choose an action to continue your investigation workflow.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
          
          {/* Analyse Incident Card */}
          <motion.div variants={itemVariants} className="relative group w-full">
            <Link to="/incidents/new" className="block w-full h-full relative z-10">
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full h-full rounded-[2.5rem] p-10 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 flex flex-col items-center text-center hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-shadow duration-300 overflow-hidden relative group/inner"
              >
                {/* Border Hover Gradient */}
                <div className="absolute inset-0 opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500 rounded-[2.5rem] p-[1.5px] bg-gradient-to-br from-blue-500 to-indigo-500 pointer-events-none z-0" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}></div>
                
                {/* Cursor Glow Effect (Simulated via large radial gradient on hover) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.08),transparent_50%)] opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="h-20 w-20 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-sm bg-blue-50/50 border border-blue-100/50 group-hover/inner:scale-110 transition-transform duration-500">
                    <Terminal className="h-10 w-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-4 text-slate-800 group-hover/inner:text-blue-600 transition-colors">Analyse Incident</h2>
                  <p className="text-[15px] leading-relaxed mb-10 text-slate-500 max-w-sm">
                    Generate AI-powered RCA reports using timelines, error logs and git changes.
                  </p>
                  
                  <div className="mt-auto w-full font-bold rounded-full px-6 py-4 flex items-center justify-center gap-2 transition-all duration-300 bg-slate-50 text-slate-700 group-hover/inner:bg-gradient-to-r group-hover/inner:from-blue-600 group-hover/inner:to-indigo-600 group-hover/inner:text-white group-hover/inner:shadow-lg group-hover/inner:shadow-blue-500/30">
                    Start Analysis
                    <ChevronRight className="h-5 w-5 transform group-hover/inner:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* RCA History Reports Card */}
          <motion.div variants={itemVariants} className="relative group w-full">
            <Link to="/reports" className="block w-full h-full relative z-10">
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full h-full rounded-[2.5rem] p-10 bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 flex flex-col items-center text-center hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] transition-shadow duration-300 overflow-hidden relative group/inner"
              >
                {/* Border Hover Gradient */}
                <div className="absolute inset-0 opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500 rounded-[2.5rem] p-[1.5px] bg-gradient-to-br from-cyan-400 to-blue-500 pointer-events-none z-0" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}></div>
                
                {/* Cursor Glow Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.08),transparent_50%)] opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="h-20 w-20 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-sm bg-cyan-50/50 border border-cyan-100/50 group-hover/inner:scale-110 transition-transform duration-500">
                    <FileText className="h-10 w-10 text-cyan-500" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-4 text-slate-800 group-hover/inner:text-cyan-600 transition-colors">RCA History Reports</h2>
                  <p className="text-[15px] leading-relaxed mb-10 text-slate-500 max-w-sm">
                    View previously generated RCA reports, PDF exports and submissions.
                  </p>
                  
                  <div className="mt-auto w-full font-bold rounded-full px-6 py-4 flex items-center justify-center gap-2 transition-all duration-300 bg-slate-50 text-slate-700 group-hover/inner:bg-gradient-to-r group-hover/inner:from-cyan-500 group-hover/inner:to-blue-600 group-hover/inner:text-white group-hover/inner:shadow-lg group-hover/inner:shadow-cyan-500/30">
                    Open Reports
                    <ChevronRight className="h-5 w-5 transform group-hover/inner:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </div>

        {/* Recent Activity Section */}
        <motion.div variants={itemVariants} className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-slate-800">Recent Activity</h3>
            <Link to="/reports" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center">View All <ChevronRight className="h-4 w-4"/></Link>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-2">
            {!loading && reports.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-medium">No recent reports found.</div>
            )}
            {reports.map((report, idx) => (
              <Link key={report.id || idx} to={`/reports/${report.incident_id}`} className="block group">
                <div className="p-4 md:p-6 hover:bg-slate-50 rounded-[1.5rem] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{report.incident_title || 'Untitled Incident'}</h4>
                      {getStatusBadge(report)}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-4 font-medium">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> {new Date(report.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5"/> Severity: {report.severity_level || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  {report.status === 'Approved' && report.manager_name && (
                    <div className="text-sm text-slate-500 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                      <div className="font-bold text-emerald-800 mb-0.5">Approved by: {report.manager_name}</div>
                      <div className="text-xs">On: {new Date(report.reviewed_at).toLocaleString()}</div>
                    </div>
                  )}

                  {report.status === 'Rejected' && report.manager_name && (
                    <div className="text-sm text-slate-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100 max-w-xs">
                      <div className="font-bold text-red-800 mb-0.5">Rejected by: {report.manager_name}</div>
                      <div className="text-xs font-medium truncate mb-1">Reason: {report.manager_comment || 'N/A'}</div>
                      <div className="text-xs">On: {new Date(report.reviewed_at).toLocaleString()}</div>
                    </div>
                  )}
                  
                  <div className="hidden md:flex text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default DeveloperDashboard;
