import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, ChevronRight, FileText, CheckCircle, Terminal, FileCode, Sparkles, Activity, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateIncident = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(''); // Need a title for the incident

  const [formData, setFormData] = useState({
    timeline: '',
    logs: '',
    gitDiff: ''
  });

  const [stepStatus, setStepStatus] = useState({
    1: 'pending',
    2: 'pending',
    3: 'pending',
    4: 'pending'
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleFileUpload = (stepKey, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, [stepKey]: event.target.result }));
    };
    reader.readAsText(file);
  };

  const handleContinue = (step) => {
    if (step === 1 && !formData.timeline.trim()) return;
    if (step === 2 && !formData.logs.trim()) return;

    setStepStatus(prev => ({ ...prev, [step]: 'completed' }));
    setActiveStep(step + 1);
  };

  const handleSkip = (step) => {
    setStepStatus(prev => ({ ...prev, [step]: 'skipped' }));
    setActiveStep(step + 1);
  };

  const [loadingText, setLoadingText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  const loadingSequence = [
    "Analyzing Timeline...",
    "Analyzing Error Logs...",
    "Analyzing Git Changes...",
    "Identifying Root Cause...",
    "Generating RCA Report..."
  ];

  const generateRCA = async () => {
    if (stepStatus[1] !== 'completed' || stepStatus[2] !== 'completed') return;
    setLoading(true);
    setErrorMsg('');
    
    let currentStep = 0;
    setLoadingText(loadingSequence[0]);
    
    const intervalId = setInterval(() => {
      currentStep++;
      if (currentStep < loadingSequence.length) {
        setLoadingText(loadingSequence[currentStep]);
      } else {
        clearInterval(intervalId);
      }
    }, 2500);

    try {
      const generatedTitle = title || `Incident Analysis ${new Date().toLocaleDateString()}`;
      const res = await axios.post('/api/incidents', {
        title: generatedTitle,
        timeline: formData.timeline,
        logs: formData.logs,
        gitDiff: formData.gitDiff,
        ocrText: '' // OCR omitted from this flow as requested
      });
      clearInterval(intervalId);
      // Backend routes expect incidentId as the parameter for /reports/:id
      navigate(`/reports/${res.data.incidentId}`);
    } catch (err) {
      clearInterval(intervalId);
      setLoading(false);
      setErrorMsg(err.response?.data?.error || 'Failed to generate RCA.');
      setErrorDetails(err.response?.data?.details || '');
      console.error('Generation Error:', err);
    }
  };

  // Stepper UI
  const steps = [
    { num: 1, title: 'Timeline', icon: Activity },
    { num: 2, title: 'Error Logs', icon: Terminal },
    { num: 3, title: 'Git Diff', icon: FileCode },
    { num: 4, title: 'Generate RCA', icon: Sparkles }
  ];

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-4 w-full h-full flex flex-col">
      
      {/* Title Area */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Analyse Incident</h1>
        <p className="text-slate-500 dark:text-[#A1A1AA]">Follow the guided workflow to generate a multi-agent RCA report.</p>
      </div>

      {/* Hero Stepper component */}
      <div className="relative mb-16 max-w-3xl mx-auto w-full">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-[#27272A] -translate-y-1/2 z-0 rounded-full">
          <motion.div 
            className="h-full bg-blue-500 dark:bg-[#A855F7] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((activeStep - 1) / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Nodes */}
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const isCompleted = stepStatus[step.num] === 'completed';
            const isSkipped = stepStatus[step.num] === 'skipped';
            const isActive = activeStep === step.num;
            const isPast = activeStep > step.num;

            return (
              <div key={step.num} className="flex flex-col items-center group">
                <motion.div 
                  initial={false}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isCompleted ? (isDark ? '#8B5CF6' : '#2563EB') :
                                     isSkipped ? (isDark ? '#3F3F46' : '#94A3B8') :
                                     isActive ? (isDark ? '#A855F7' : '#3B82F6') :
                                     (isDark ? '#111113' : '#FFFFFF'),
                    borderColor: (isActive || isCompleted) ? (isDark ? '#A855F7' : '#2563EB') : (isDark ? '#27272A' : '#E2E8F0'),
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shadow-lg ${isActive && isDark ? 'ai-glow-subtle' : ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : isSkipped ? (
                    <ChevronRight className="w-5 h-5 text-white" />
                  ) : (
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400 dark:text-[#A1A1AA]'}`}>
                      {step.num}
                    </span>
                  )}
                </motion.div>
                <span className={`absolute top-12 text-xs font-bold tracking-widest uppercase transition-colors duration-300 whitespace-nowrap ${isActive ? 'text-blue-600 dark:text-[#A855F7]' : 'text-slate-400 dark:text-[#71717A]'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Title Input (Required before finishing) */}
      {activeStep === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-3xl mx-auto w-full">
           <label className="block text-xs font-bold text-slate-500 dark:text-[#A1A1AA] uppercase tracking-widest mb-2">Incident Title (Optional)</label>
           <input 
             type="text" 
             value={title} 
             onChange={(e) => setTitle(e.target.value)} 
             className="w-full px-4 py-3 bg-white dark:bg-[#111113] border border-slate-200 dark:border-[#27272A] shadow-sm rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-[#A855F7] transition-all" 
             placeholder="e.g. Database Connection Timeout" 
           />
        </motion.div>
      )}

      {/* Dynamic Step Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: TIMELINE */}
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="ai-glass-panel rounded-[2rem] p-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
                  <Activity className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Timeline Information</h2>
              </div>
              <p className="text-slate-500 mb-8">Provide the sequence of events that occurred before and during the incident.</p>
              
              <div className="space-y-6">
                <textarea 
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  rows={8}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-slate-700 font-mono text-[13px] focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all resize-none shadow-inner"
                  placeholder="10:00 AM Deployment Started&#10;10:05 AM Error Rate Increased&#10;10:10 AM Service Unavailable&#10;10:20 AM Rollback Started"
                />
                
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wide">
                    <Upload className="h-4 w-4" /> Upload Timeline File
                    <input type="file" className="hidden" accept=".txt,.log,.csv" onChange={(e) => handleFileUpload('timeline', e)} />
                  </label>
                  
                  <button 
                    disabled={!formData.timeline.trim()}
                    onClick={() => handleContinue(1)}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ERROR LOGS */}
          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="ai-glass-panel rounded-[2rem] p-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
                  <Terminal className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Error Logs</h2>
              </div>
              <p className="text-slate-500 mb-8">Paste or upload application logs for AI analysis.</p>
              
              <div className="space-y-6">
                <textarea 
                  value={formData.logs}
                  onChange={(e) => setFormData({...formData, logs: e.target.value})}
                  rows={8}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-slate-700 font-mono text-[13px] focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all resize-none shadow-inner"
                  placeholder="[ERROR] 2024-03-10 10:05:22 Database connection timeout...&#10;[WARN] 2024-03-10 10:05:25 Retrying connection..."
                />
                
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wide">
                    <Upload className="h-4 w-4" /> Upload Log File
                    <input type="file" className="hidden" accept=".txt,.log" onChange={(e) => handleFileUpload('logs', e)} />
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveStep(1)} className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Back</button>
                    <button 
                      disabled={!formData.logs.trim()}
                      onClick={() => handleContinue(2)}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GIT DIFF */}
          {activeStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="ai-glass-panel rounded-[2rem] p-10"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
                    <FileCode className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Recent Git Changes</h2>
                </div>
                <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-widest">Optional</span>
              </div>
              <p className="text-slate-500 mb-8">Paste recent code changes if available to help AI correlate deployment risks.</p>
              
              <div className="space-y-6">
                <textarea 
                  value={formData.gitDiff}
                  onChange={(e) => setFormData({...formData, gitDiff: e.target.value})}
                  rows={8}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-slate-700 font-mono text-[13px] focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all resize-none shadow-inner"
                  placeholder="diff --git a/src/db/connection.js b/src/db/connection.js&#10;--- a/src/db/connection.js&#10;+++ b/src/db/connection.js&#10;- const timeout = 30000;&#10;+ const timeout = 5000;"
                />
                
                <div className="flex items-center justify-between">
                  <label className="cursor-pointer inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wide">
                    <Upload className="h-4 w-4" /> Upload Git Diff File
                    <input type="file" className="hidden" accept=".txt,.diff,.patch" onChange={(e) => handleFileUpload('gitDiff', e)} />
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveStep(2)} className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Back</button>
                    <button 
                      onClick={() => handleSkip(3)}
                      className="px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Skip
                    </button>
                    <button 
                      disabled={!formData.gitDiff.trim()}
                      onClick={() => handleContinue(3)}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: GENERATE RCA */}
          {activeStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="ai-glass-panel rounded-[2rem] p-12 text-center flex flex-col items-center"
            >
              <div className="h-24 w-24 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Ready For AI Analysis</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed text-[15px]">
                The Multi-Agent system will now combine timeline events, error logs, and git changes to generate a structured Root Cause Analysis report.
              </p>
              
              {errorMsg && (
                <div className="w-full max-w-md bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6 text-left flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span>{errorMsg}</span>
                    {errorDetails && <span className="text-xs text-red-500/80 mt-1">{errorDetails}</span>}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="w-full max-w-md space-y-4">
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                       initial={{ width: "0%" }}
                       animate={{ width: "100%" }}
                       transition={{ duration: 15, ease: "linear" }}
                     />
                   </div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">{loadingText}</p>
                </div>
              ) : (
                <div className="flex gap-4 w-full max-w-md justify-center">
                  <button onClick={() => setActiveStep(3)} className="px-6 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    Go Back
                  </button>
                  <button 
                    onClick={generateRCA}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-base py-4 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    Generate RCA Report
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};

export default CreateIncident;
