import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, Mail, CheckCircle, AlertTriangle, FileText, Send, Sparkles, Terminal, ChevronLeft, Clock, Target, GitPullRequest, Shield, ArrowRight, Activity, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const RCAReport = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Modals state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', subject: 'Incident RCA Report', message: 'Please review the attached RCA report.' });
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: user?.name || '', email: user?.email || '', team: 'Platform Engineering', notes: '' });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/reports/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error(err);
        setErrorMsg(`Failed to retrieve analysis. Requested ID: ${id}. ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await axios.get(`/api/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RCA_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/api/reports/${id}/email`, emailForm);
      setShowEmailModal(false);
      alert('Intelligence transmitted successfully');
    } catch (err) {
      alert('Failed to transmit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitToManager = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/api/reports/${id}/submit`, submitForm);
      setReport(prev => ({ ...prev, status: 'Submitted' }));
      setShowSubmitModal(false);
    } catch (err) {
      alert('Failed to submit report. Please ensure all required fields are filled.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[100vh] flex flex-col items-center justify-center gap-6 bg-[#FAFAFA]">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 rounded-full" />
          <Sparkles className="relative h-12 w-12 text-blue-600 animate-pulse" />
        </div>
        <p className="text-slate-500 font-mono text-[14px] uppercase tracking-widest font-black">Decrypting Neural Analysis...</p>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="h-[100vh] flex flex-col items-center justify-center bg-[#FAFAFA]">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
        <h2 className="text-[32px] font-black text-slate-900 mb-4">Analysis Retrieval Failed</h2>
        <p className="text-red-600 bg-red-50 border border-red-100 px-6 py-4 rounded-2xl font-bold text-[16px] max-w-xl text-center shadow-sm">{errorMsg}</p>
        <button onClick={() => navigate(-1)} className="mt-8 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-1 transition-all text-[16px]">Return to Dashboard</button>
      </div>
    );
  }

  // --- CUSTOM MARKDOWN PARSER ---
  const parseMarkdown = (markdownStr) => {
    const sections = {};
    if (!markdownStr) return sections;
    
    const chunks = markdownStr.split(/(?=\n#\s)/);
    chunks.forEach(chunk => {
      const match = chunk.match(/^\n?#\s+(.+)\n([\s\S]*)$/);
      if (match) {
        const title = match[1].trim().toLowerCase();
        const content = match[2].trim();
        if (title.includes('incident summary')) sections.summary = content;
        if (title.includes('timeline')) sections.timeline = content;
        if (title.includes('error')) sections.errors = content;
        if (title.includes('git diff')) sections.gitDiff = content;
        if (title.includes('root cause')) sections.rootCause = content;
        if (title.includes('impact')) sections.impact = content;
        if (title.includes('recommended fixes') || title.includes('fixes')) sections.fixes = content;
        if (title.includes('prevention')) sections.prevention = content;
      }
    });
    return sections;
  };

  const sections = parseMarkdown(report.markdown_report);

  let dynamicConfidence = 0;
  if (sections.timeline) dynamicConfidence += 30;
  if (sections.errors) dynamicConfidence += 40;
  if (sections.gitDiff) dynamicConfidence += 20;
  if (sections.rootCause) dynamicConfidence += 10;
  if (dynamicConfidence > 95) dynamicConfidence = 95;

  // --- RENDERING HELPERS ---
  const renderAsBullets = (text) => {
    if (!text) return null;
    let lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 1 && text.includes('. ')) {
      lines = text.split('. ').map(l => l.trim() + (l.endsWith('.') ? '' : '.')).filter(l => l.length > 1);
    }
    return (
      <ul className="space-y-4 mt-2">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="text-slate-900 mt-1.5 font-black text-[20px] leading-none opacity-50">•</span>
            <span className="text-[16px] text-slate-900 leading-relaxed font-semibold">
              {line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '')}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const renderRootCauseVisual = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {lines.map((line, i) => {
          if (line.includes('->') || line.includes('→')) {
            const [label, values] = line.split(':');
            const [before, after] = values ? values.split(/->|→/) : [line, ''];
            if (label && before && after) {
              return (
                <div key={i} className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col gap-2 transition-colors">
                  <span className="text-red-800 text-[13px] font-black uppercase tracking-widest">{label.replace(/^[-*•]\s*/, '').trim()}</span>
                  <div className="flex items-center gap-4 text-[20px] font-mono font-bold text-slate-900">
                    <span className="opacity-50 line-through text-slate-500">{before.trim()}</span>
                    <span className="text-red-500"><ArrowRight className="h-5 w-5" /></span>
                    <span className="text-red-600">{after.trim()}</span>
                  </div>
                </div>
              );
            }
          }
          const cleanLine = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
          const parts = cleanLine.split(':');
          return (
            <div key={i} className={`bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col gap-1 transition-colors ${parts.length > 1 ? '' : 'col-span-full'}`}>
               {parts.length > 1 ? (
                 <>
                   <span className="text-red-800 text-[13px] font-black uppercase tracking-widest">{parts[0].trim()}</span>
                   <span className="text-slate-900 text-[18px] font-bold leading-snug">{parts.slice(1).join(':').trim()}</span>
                 </>
               ) : (
                 <span className="text-slate-900 text-[18px] font-bold leading-relaxed">{cleanLine}</span>
               )}
            </div>
          )
        })}
      </div>
    );
  };

  const renderTimeline = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="flex flex-col gap-3 mt-6 relative">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200" />
        {lines.map((line, i) => {
          const cleanLine = line.replace(/^[-*]\s*/, '');
          const timeMatch = cleanLine.match(/^(\d{2}:\d{2}(?:\s?[APM]{2})?|\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}\S*)\s*[-:]?\s*(.+)/i);
          return (
            <div key={i} className="relative flex items-center gap-6 z-10">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-blue-50 text-blue-600 shadow-sm shrink-0">
                 {timeMatch ? <span className="text-[10px] font-black">{timeMatch[1]}</span> : <Clock className="h-4 w-4" />}
              </div>
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <span className="text-[16px] font-bold text-slate-900 leading-relaxed block">
                  {timeMatch ? timeMatch[2] : cleanLine}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderErrors = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="flex flex-col gap-4 mt-6">
        {lines.map((line, i) => (
          <div key={i} className="bg-white border-l-4 border-l-red-500 border border-slate-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-[16px] font-bold text-slate-900 leading-relaxed pt-2">{line.replace(/^[-*]\s*/, '')}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderGitDiff = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="mt-6 bg-[#0D1117] rounded-2xl p-6 font-mono text-[14px] leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
        {lines.map((line, i) => {
          let color = "text-slate-300";
          let bg = "bg-transparent";
          if (line.startsWith('+')) { color = "text-emerald-400"; bg="bg-emerald-500/10"; }
          else if (line.startsWith('-')) { color = "text-red-400"; bg="bg-red-500/10"; }
          return <div key={i} className={`px-4 py-1 -mx-4 ${bg} ${color}`}>{line}</div>
        })}
      </div>
    );
  };

  const renderChecklist = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="flex flex-col gap-3 mt-6">
        {lines.map((line, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[16px] text-slate-900 font-bold leading-relaxed">{line.replace(/^[-*]\s*/, '').replace(/^✓\s*/, '')}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderRoadmap = (text) => {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return (
      <div className="flex flex-col gap-4 mt-6">
        {lines.map((line, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-[20px] font-black text-slate-700">{i + 1}</span>
            </div>
            <span className="text-[18px] leading-relaxed text-slate-900 font-bold">{line.replace(/^[-*\d.]+\s*/, '')}</span>
          </div>
        ))}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const statusMap = {
    'Generated': { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    'Submitted': { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    'Pending Review': { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    'Approved': { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    'Rejected': { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
  };
  const currentStatus = report.status || (report.approved ? 'Approved' : 'Generated');
  const sStyle = statusMap[currentStatus] || statusMap['Generated'];

  return (
    <div className="relative min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 pb-32 bg-[#FAFAFA]">
      
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-[95%] xl:max-w-[1700px] mx-auto px-6 lg:px-12 pt-10">
        
        {/* Navigation & Action Bar */}
        <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-16">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-[15px] font-bold">
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Workspace
          </button>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-xl font-bold text-[15px] text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm">
              <Download className="h-5 w-5" /> Export PDF
            </button>
            <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 rounded-xl font-bold text-[15px] text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm">
              <Mail className="h-5 w-5" /> Email Report
            </button>
            {user?.role === 'Developer' && (
              <button 
                onClick={() => setShowSubmitModal(true)} 
                disabled={currentStatus !== 'Generated'} 
                className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black text-[15px] transition-all shadow-lg ${
                  currentStatus !== 'Generated' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default shadow-none' : 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:-translate-y-1'
                }`}
              >
                {currentStatus !== 'Generated' ? <CheckCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                {currentStatus !== 'Generated' ? currentStatus : 'Submit To Manager'}
              </button>
            )}
          </div>
        </motion.div>

        {/* AI RCA HERO HEADER */}
        <motion.div variants={itemVariants} className="text-center flex flex-col items-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${sStyle.bg} ${sStyle.border} ${sStyle.color} text-[13px] font-black uppercase tracking-widest mb-6 border`}>
            {currentStatus}
          </div>
          <h1 className="text-[56px] md:text-[64px] font-black text-slate-900 tracking-tight leading-tight mb-6 max-w-5xl">
            {report.incident_title || 'Root Cause Analysis'}
          </h1>
          <p className="text-[18px] text-slate-600 font-bold max-w-3xl leading-relaxed">
            Incident investigation report detailing timeline correlation, error anomalies, and repository modifications.
          </p>
        </motion.div>

        {/* METRICS */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Severity', value: report.severity_level || 'Unknown', icon: AlertTriangle, color: report.severity_level === 'Critical' ? 'text-red-500 bg-red-50' : 'text-amber-500 bg-amber-50' },
            { label: 'Confidence', value: `${dynamicConfidence}%`, icon: Sparkles, color: 'text-blue-500 bg-blue-50' },
            { label: 'Duration', value: '25 Min', icon: Clock, color: 'text-indigo-500 bg-indigo-50' },
            { label: 'Status', value: 'Resolved', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' }
          ].map((metric, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</div>
                <div className={`p-2 rounded-xl ${metric.color}`}><metric.icon className="h-5 w-5" /></div>
              </div>
              <div className="text-[32px] font-black text-slate-900 tracking-tight">{metric.value}</div>
            </div>
          ))}
        </motion.div>

        {/* MASONRY LAYOUT FOR ZERO WASTED SPACE */}
        <div className="columns-1 lg:columns-2 gap-8 space-y-8">
          
          {/* ROOT CAUSE (Prioritized implicitly by placement if we wanted, but CSS columns flows top-to-bottom) */}
          {sections.rootCause && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-red-100 shadow-xl shadow-red-500/5 rounded-3xl p-8 lg:p-10 ring-1 ring-red-500/20 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                   <Target className="h-6 w-6 text-red-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Root Cause</h3>
              </div>
              {renderRootCauseVisual(sections.rootCause)}
            </motion.div>
          )}

          {sections.summary && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                   <FileText className="h-6 w-6 text-blue-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Incident Summary</h3>
              </div>
              {renderAsBullets(sections.summary)}
            </motion.div>
          )}

          {sections.timeline && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                   <Activity className="h-6 w-6 text-blue-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Timeline Analysis</h3>
              </div>
              {renderTimeline(sections.timeline)}
            </motion.div>
          )}

          {sections.errors && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                   <Terminal className="h-6 w-6 text-red-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Error Analysis</h3>
              </div>
              {renderErrors(sections.errors)}
            </motion.div>
          )}

          {sections.gitDiff && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                   <GitPullRequest className="h-6 w-6 text-emerald-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Git Diff Analysis</h3>
              </div>
              {renderGitDiff(sections.gitDiff)}
            </motion.div>
          )}

          {sections.fixes && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                   <Zap className="h-6 w-6 text-emerald-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Recommended Fixes</h3>
              </div>
              {renderChecklist(sections.fixes)}
            </motion.div>
          )}

          {sections.prevention && (
            <motion.div variants={itemVariants} className="break-inside-avoid bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                   <Shield className="h-6 w-6 text-blue-600" />
                 </div>
                 <h3 className="text-[24px] font-black text-slate-900 tracking-tight">Prevention Plan</h3>
              </div>
              {renderRoadmap(sections.prevention)}
            </motion.div>
          )}
          
        </div>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900">Email Report</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-900"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Recipient Email</label>
                  <input type="email" required value={emailForm.to} onChange={e => setEmailForm({...emailForm, to: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="manager@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea rows="3" required value={emailForm.message} onChange={e => setEmailForm({...emailForm, message: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50">
                  {submitting ? 'Transmitting...' : 'Send Email'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900">Submit to Manager</h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-900"><X className="h-6 w-6" /></button>
              </div>
              <p className="text-slate-500 font-medium mb-6">This will escalate the RCA report to the IT Manager dashboard for official review.</p>
              
              <form onSubmit={handleSubmitToManager} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                    <input type="text" required value={submitForm.name} onChange={e => setSubmitForm({...submitForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                    <input type="text" required value={submitForm.team} onChange={e => setSubmitForm({...submitForm, team: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Developer Email</label>
                  <input type="email" required value={submitForm.email} onChange={e => setSubmitForm({...submitForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                  <textarea rows="3" value={submitForm.notes} onChange={e => setSubmitForm({...submitForm, notes: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="Any context for the manager..." />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-600/30 text-white font-bold rounded-xl disabled:opacity-50 transition-all">
                    {submitting ? 'Submitting...' : 'Confirm Submission'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RCAReport;
