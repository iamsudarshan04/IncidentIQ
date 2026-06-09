import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShieldAlert, FileText, ChevronRight, Activity, Clock, CheckCircle, Check, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ show: false, reportId: null, type: null });
  const [comment, setComment] = useState('');

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data.filter(r => r.status === 'Submitted' || r.status === 'Pending Review'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async () => {
    if (!actionModal.reportId || !actionModal.type) return;
    try {
      await axios.post(`/api/reports/${actionModal.reportId}/${actionModal.type}`, { comment });
      
      if (actionModal.type === 'approve') {
        toast.success('Report Approved Successfully');
      } else {
        toast.success('Report Rejected Successfully');
      }

      setActionModal({ show: false, reportId: null, type: null });
      setComment('');
      fetchReports();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired.\nPlease login again.');
      } else {
        toast.error(err.response?.data?.error || err.response?.data?.details || 'Failed to process action');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">IT Manager Workspace</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Action Center</h1>
          <p className="text-slate-500 leading-relaxed font-medium">
            Review escalated incidents and Root Cause Analysis reports submitted by your engineering team.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Submitted Reports</h2>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
            {reports.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Activity className="h-6 w-6 text-slate-400 animate-spin" /></div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">All Caught Up</h3>
            <p className="text-slate-500">There are no reports pending your review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4">Incident</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 mb-1">{report.submit_name || report.developer_name}</div>
                      <div className="text-xs text-slate-500">{report.submit_email}</div>
                      <div className="text-xs font-bold text-blue-600 mt-1">{report.submit_team}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{report.incident_title || 'Unnamed Incident'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">Confidence: {report.confidence_score}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        report.severity_level === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {report.severity_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setActionModal({ show: true, reportId: report.incident_id, type: 'approve' })} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                          <Check className="h-5 w-5" />
                        </button>
                        <button onClick={() => setActionModal({ show: true, reportId: report.incident_id, type: 'reject' })} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                          <X className="h-5 w-5" />
                        </button>
                        <Link to={`/reports/${report.incident_id}`} className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="View">
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {actionModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActionModal({ show: false, reportId: null, type: null })} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-full ${actionModal.type === 'approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {actionModal.type === 'approve' ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 capitalize">{actionModal.type} Report</h3>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Manager Comment (Optional)</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                    rows={4}
                    placeholder="Add notes for the developer..."
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActionModal({ show: false, reportId: null, type: null })} className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={handleAction} className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition-colors ${actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20'}`}>
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerDashboard;
