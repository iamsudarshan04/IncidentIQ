import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Search, Trash2, ChevronRight, AlertTriangle, CheckCircle, Clock, Shield, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RCAHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const fetchReports = async () => {
    try {
      const res = await axios.get(`/api/reports?status=${filterStatus}`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await axios.delete(`/api/reports/${deleteModal.id}`);
      setReports(prev => prev.filter(r => r.incident_id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
    } catch (err) {
      alert('Failed to delete report');
    }
  };

  const filteredReports = reports.filter(r => 
    (r.incident_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Generated': return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">Generated</span>;
      case 'Submitted': return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold border border-blue-200">Submitted</span>;
      case 'Pending Review': return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold border border-amber-200">Pending Review</span>;
      case 'Approved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">Approved</span>;
      case 'Rejected': return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold border border-red-200">Rejected</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Unknown</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">RCA History</h1>
          <p className="text-slate-500 font-medium">Manage and review your generated Root Cause Analysis reports.</p>
        </div>
        <Link to="/incidents/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
          <FileText className="h-5 w-5" /> Generate New Report
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search incident title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          {['All', 'Generated', 'Submitted', 'Approved', 'Rejected'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterStatus === status ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading history...</div>
      ) : filteredReports.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Found</h3>
          <p className="text-slate-500">You haven't generated any RCA reports matching this filter yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={report.id} 
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                {getStatusBadge(report.status || (report.approved ? 'Approved' : 'Generated'))}
                
                <button 
                  onClick={() => setDeleteModal({ show: true, id: report.incident_id })}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="relative z-10 mb-6 flex-1">
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 line-clamp-2">{report.incident_title || 'Untitled Incident'}</h3>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Severity</div>
                  <div className={`font-black text-lg ${report.severity_level === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                    {report.severity_level || 'Unknown'}
                  </div>
                </div>
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Confidence</div>
                  <div className="font-black text-lg text-blue-700">{report.confidence_score || 85}%</div>
                </div>
              </div>

              <div className="relative z-10 flex gap-3 mt-auto">
                <Link to={`/reports/${report.incident_id}`} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-center transition-colors shadow-lg shadow-slate-900/20 text-sm">
                  View Report
                </Link>
                <a href={`/api/reports/${report.incident_id}/pdf`} download className="p-3 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm">
                  <Download className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteModal({ show: false, id: null })} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-200"
            >
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Report</h3>
              <p className="text-slate-500 mb-8 font-medium">Are you sure you want to permanently delete this report? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RCAHistory;
