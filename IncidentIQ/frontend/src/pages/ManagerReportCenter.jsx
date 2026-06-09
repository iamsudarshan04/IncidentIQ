import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Download, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const ManagerReportCenter = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports?approved=true');
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => 
    (r.incident_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.developer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 dark:bg-[#18181B] border border-transparent dark:border-[#27272A] flex items-center justify-center shadow-lg shadow-blue-600/20">
          <FileText className="h-6 w-6 text-white dark:text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Report Center</h1>
          <p className="text-slate-500 dark:text-[#A1A1AA] text-sm mt-1">Review and analyze approved Root Cause Analysis reports.</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] shadow-xl rounded-2xl mb-6 p-4 flex flex-col md:flex-row gap-4 justify-between items-center relative">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-[#A1A1AA]" />
          </div>
          <input 
            type="text" 
            placeholder="Search by incident or developer..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-[#27272A] rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl text-sm font-bold text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors shadow-sm">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border border-slate-200 dark:border-[#27272A] shadow-2xl rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-slate-500 dark:text-[#A1A1AA] text-lg font-medium">No reports found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-[#27272A] text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#A1A1AA]">
                  <th className="px-6 py-4">Incident Details</th>
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/50">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-blue-50/50 dark:hover:bg-[#18181B] transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.incident_title || `Incident #${report.incident_id}`}</p>
                      <p className="text-xs text-slate-500 dark:text-[#A1A1AA] truncate w-64 mt-1 font-light">{report.executive_summary}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-700 dark:text-[#FAFAFA]">
                      {report.developer_name || `Dev #${report.developer_id}`}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        report.severity_level === 'High' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-[#EF4444]/10 dark:text-[#EF4444] dark:border-[#EF4444]/20' :
                        report.severity_level === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-[#F59E0B]/10 dark:text-[#F59E0B] dark:border-[#F59E0B]/20' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-[#22C55E]/10 dark:text-[#22C55E] dark:border-[#22C55E]/20'
                      }`}>
                        {report.severity_level}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-[#27272A] rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full ${report.confidence_score >= 90 ? 'bg-emerald-500' : report.confidence_score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${report.confidence_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-700 dark:text-white">{report.confidence_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 dark:text-[#A1A1AA] font-medium whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 dark:text-[#A1A1AA] hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm" title="Download PDF">
                          <Download className="h-4 w-4" />
                        </button>
                        <Link to={`/reports/${report.id}`} className="p-2 text-slate-400 dark:text-[#A1A1AA] hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-[#27272A]">
                          <ChevronRight className="h-4 w-4" />
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
    </div>
  );
};

export default ManagerReportCenter;
