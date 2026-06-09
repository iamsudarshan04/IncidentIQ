import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GlobalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiProvider, setAiProvider] = useState('Gemini');
  const chatEndRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();

  // Convert path to human readable context
  let pageContext = 'Dashboard';
  if (location.pathname.includes('/incidents/new')) pageContext = 'Analyse Incident';
  else if (location.pathname.includes('/reports/')) pageContext = 'RCA Report';
  else if (location.pathname.includes('/reports')) pageContext = 'RCA History';
  else if (location.pathname.includes('/manager-dashboard')) pageContext = 'Manager Dashboard';
  else if (location.pathname.includes('/dev-dashboard')) pageContext = 'Developer Dashboard';
  else if (location.pathname.includes('/role')) pageContext = 'Role Selection';

  // Initialize welcome message when user loads
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          sender: 'bot', 
          text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'} 👋\n\nI can help you analyze incidents, explain RCA reports, assist managers and answer platform questions.` 
        }
      ]);
    }
  }, [user, messages.length]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post('/api/ai/chat', { 
        message: userMsg.text,
        pageContext 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
      if (res.data.provider) setAiProvider(res.data.provider);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm temporarily unable to reach the AI service.\nPlease try again in a few moments." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "Explain Report",
    "Summarize RCA",
    "Find Root Cause",
    "Show Timeline",
    "Manager Review Guide"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white/90 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[32px] flex flex-col relative overflow-visible mb-6"
            style={{ width: '360px', height: '520px', maxHeight: '70vh' }}
          >
            {/* Soft background glows inside panel */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-400/15 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-400/15 rounded-full blur-[60px] pointer-events-none" />

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100/60 relative z-10 bg-white/60 backdrop-blur-md rounded-t-[32px]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-9 w-9 rounded-[14px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">AI Assistant</h3>
                    {isTyping ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-100/80 border border-amber-200 text-amber-700 text-[9px] font-bold uppercase tracking-wider ml-1">
                        Temporarily Busy
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider ml-1">
                        Online
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium tracking-wide">IncidentIQ Copilot &bull; {pageContext}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-hide relative z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
              `}} />
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 mr-2 mt-auto shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl p-3.5 text-[13.5px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm shadow-blue-500/20' 
                    : 'bg-white border border-slate-100/80 text-slate-800 rounded-bl-sm shadow-slate-200/50'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Quick Actions */}
              {!isTyping && messages[messages.length - 1]?.sender === 'bot' && messages.length < 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap gap-2 mt-1 ml-9"
                >
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(null, action)}
                      className="px-3 py-1.5 bg-white/80 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/80 text-slate-600 hover:text-blue-600 text-[11px] font-semibold rounded-full shadow-sm transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </motion.div>
              )}

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start items-end"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 mr-2 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-100/80 text-slate-500 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm flex items-center gap-1 h-[46px]">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/70 backdrop-blur-xl border-t border-slate-100/60 relative z-10 shrink-0 rounded-b-[32px]">
              <form onSubmit={handleSend} className="relative flex items-center group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full pl-4 pr-12 py-3 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[20px] text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 p-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-[16px] shadow-sm transition-all disabled:opacity-40 disabled:scale-95 hover:scale-105 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="chat-btn"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all relative group z-50 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(37,99,235,0.4)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-600 before:to-purple-600 before:rounded-full before:-z-10"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="h-7 w-7 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalChatbot;
