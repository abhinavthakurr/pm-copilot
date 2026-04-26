/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Sparkles, 
  History as HistoryIcon, 
  FileText, 
  Map, 
  Target, 
  BarChart3, 
  Search, 
  Sword,
  Copy,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  Check,
  Wand2
} from 'lucide-react';
import { generateProductAsset, ToolType } from './lib/gemini';
import { MarkDown } from './components/MarkDown';

interface HistoryItem {
  id: string;
  tool: ToolType;
  title: string;
  problem: string;
  content: string;
  date: string;
}

const TOOLS = [
  { id: 'suite', label: 'Magic Suite', icon: Wand2, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  { id: 'prd', label: 'PRD Generator', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { id: 'strategy', label: 'Product Strategy', icon: Map, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'priority', label: 'Prioritization', icon: Target, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  { id: 'okr', label: 'OKR Builder', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { id: 'research', label: 'Research Plan', icon: Search, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
  { id: 'competitive', label: 'Competitive', icon: Sword, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
] as const;

export default function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'generate' | 'history'>('home');
  const [activeTool, setActiveTool] = useState<ToolType>('prd');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pm_copilot_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('pm_copilot_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!inputs.problem && !inputs.description && !inputs.features && !inputs.vision && !inputs.hypothesis && !inputs.product) {
      alert("Please provide at least a problem statement or product description.");
      return;
    }

    setIsGenerating(true);
    setOutput('');
    
    try {
      const result = await generateProductAsset({ tool: activeTool, inputs });
      setOutput(result);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToHistory = () => {
    const toolInfo = TOOLS.find(t => t.id === activeTool);
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      tool: activeTool,
      title: toolInfo?.label || 'Generated Doc',
      problem: Object.values(inputs)[0].substring(0, 50) + '...',
      content: output,
      date: new Date().toLocaleDateString(),
    };
    setHistory([newItem, ...history]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(history.filter(item => item.id !== id));
  };

  const viewHistoryItem = (item: HistoryItem) => {
    setActiveTool(item.tool);
    setOutput(item.content);
    setInputs({ problem: item.problem }); // Not fully accurate but keeps context
    setActiveSection('generate');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-700/40 bg-bg/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>
          <span className="font-display font-bold text-xl tracking-tight text-white uppercase">PM<span className="text-sky-400">.COPILOT</span></span>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700">
          <NavTab active={activeSection === 'home'} onClick={() => setActiveSection('home')} icon={Zap} label="Home" />
          <NavTab active={activeSection === 'generate'} onClick={() => setActiveSection('generate')} icon={Sparkles} label="Generator" />
          <NavTab active={activeSection === 'history'} onClick={() => setActiveSection('history')} icon={HistoryIcon} label="History" />
        </div>
      </nav>

      <main className="flex-grow pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center py-12 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/20 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  <Sparkles size={10} /> AI-Powered Product Intelligence
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-tight">
                  Next-Gen <span className="text-sky-400">Product</span><br />Orchestration
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  The ultimate workspace for Product Managers. Generate full kickoff suites, PRDs, and strategies using Gemini 1.5 PRO.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setActiveTool('suite');
                      setActiveSection('generate');
                    }}
                    className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-sky-500/20 uppercase text-xs tracking-widest flex items-center gap-2"
                  >
                    <Wand2 size={14}/> Magic Suite
                  </button>
                  <button 
                    onClick={() => setActiveSection('generate')}
                    className="px-8 py-3 bg-surface-2 hover:bg-surface-3 border border-white/10 rounded-xl font-semibold transition-all text-xs uppercase tracking-widest"
                  >
                    Explore Tools
                  </button>
                </div>
              </div>

              {/* Tool Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {TOOLS.map((tool) => (
                  <motion.div 
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-slate-900/50 border border-slate-700/40 rounded-xl hover:border-sky-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => {
                      setActiveTool(tool.id);
                      setActiveSection('generate');
                    }}
                  >
                    <div className={`w-12 h-12 ${tool.bg} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                      <tool.icon className={tool.color} />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">{tool.label}</h3>
                    <p className="text-text-dim text-sm leading-relaxed">
                      AI-driven workflow to build structured {tool.label.toLowerCase()} documents instantly.
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Sidebar Tools */}
              <div className="lg:col-span-3 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest pl-2 mb-3">Toolbox</h2>
                  {TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        activeTool === tool.id 
                          ? `${tool.bg} ${tool.color} border ${tool.border}` 
                          : 'hover:bg-white/5 text-text-dim'
                      }`}
                    >
                      <tool.icon size={18} />
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace */}
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
                  <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                       {activeTool === 'suite' && <Wand2 size={14} className="text-sky-400"/>}
                       {activeTool === 'prd' && <FileText size={14} className="text-emerald-400"/>}
                       {activeTool === 'strategy' && <Map size={14} className="text-amber-500"/>}
                       {activeTool === 'priority' && <Target size={14} className="text-sky-400"/>}
                       {activeTool === 'okr' && <BarChart3 size={14} className="text-emerald-400"/>}
                       {activeTool === 'research' && <Search size={14} className="text-slate-400"/>}
                       {activeTool === 'competitive' && <Sword size={14} className="text-red-400"/>}
                       {TOOLS.find(t => t.id === activeTool)?.label}
                    </h3>
                    <span className="text-[10px] text-sky-400 font-mono">WORKSPACE_01</span>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {/* Dynamic Form based on Tool */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTool}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {activeTool === 'suite' && (
                          <div className="space-y-4">
                            <InputField label="Core Problem Statement" placeholder="Explain the pain point Gemini should solve for..." value={inputs.problem} onChange={v => setInputs({...inputs, problem: v})} type="textarea" />
                            <InputField label="Product Stage" value={inputs.stage} onChange={v => setInputs({...inputs, stage: v})} type="select" options={['Pre-Seed / 0-to-1', 'MVP', 'Growth', 'Scale', 'Maturity']} />
                          </div>
                        )}
                        {activeTool === 'prd' && (
                          <div className="space-y-4">
                            <InputField label="Problem Statement" placeholder="e.g. Users struggle to track daily water intake..." value={inputs.problem} onChange={v => setInputs({...inputs, problem: v})} type="textarea" />
                            <div className="grid md:grid-cols-2 gap-4">
                              <InputField label="Target User" placeholder="e.g. Health-conscious professionals" value={inputs.user} onChange={v => setInputs({...inputs, user: v})} />
                              <InputField label="Stage" value={inputs.stage} onChange={v => setInputs({...inputs, stage: v})} type="select" options={['MVP', 'Growth', 'Scale']} />
                            </div>
                          </div>
                        )}
                        {activeTool === 'strategy' && (
                          <div className="space-y-4">
                            <InputField label="Product Description" placeholder="e.g. B2B SaaS for HR onboarding..." value={inputs.description} onChange={v => setInputs({...inputs, description: v})} type="textarea" />
                            <div className="grid md:grid-cols-2 gap-4">
                              <InputField label="Time Horizon" placeholder="e.g. 6 Months" value={inputs.horizon} onChange={v => setInputs({...inputs, horizon: v})} />
                              <InputField label="Primary Goal" placeholder="e.g. User Acquisition" value={inputs.goal} onChange={v => setInputs({...inputs, goal: v})} />
                            </div>
                          </div>
                        )}
                        {activeTool === 'priority' && (
                          <div className="space-y-4">
                            <InputField label="Features to Prioritize" placeholder="List features separated by lines..." value={inputs.features} onChange={v => setInputs({...inputs, features: v})} type="textarea" />
                            <div className="grid md:grid-cols-2 gap-4">
                              <InputField label="Framework" placeholder="e.g. RICE, MoSCoW" value={inputs.framework} onChange={v => setInputs({...inputs, framework: v})} />
                              <InputField label="Context" placeholder="e.g. Mobile App Redesign" value={inputs.context} onChange={v => setInputs({...inputs, context: v})} />
                            </div>
                          </div>
                        )}
                        {/* Add more forms for other tools similarly */}
                        {activeTool === 'okr' && (
                          <div className="space-y-4">
                            <InputField label="Vision / Context" placeholder="What are we trying to achieve this year?" value={inputs.vision} onChange={v => setInputs({...inputs, vision: v})} type="textarea" />
                            <div className="grid md:grid-cols-2 gap-4">
                              <InputField label="Quarter" placeholder="e.g. Q3" value={inputs.quarter} onChange={v => setInputs({...inputs, quarter: v})} />
                              <InputField label="Objective Count" placeholder="e.g. 3" value={inputs.count} onChange={v => setInputs({...inputs, count: v})} />
                            </div>
                          </div>
                        )}
                        {activeTool === 'research' && (
                          <div className="space-y-4">
                            <InputField label="Hypothesis" placeholder="We believe that..." value={inputs.hypothesis} onChange={v => setInputs({...inputs, hypothesis: v})} type="textarea" />
                            <div className="grid md:grid-cols-2 gap-4">
                              <InputField label="Method" placeholder="e.g. Interviews, Surveys" value={inputs.method} onChange={v => setInputs({...inputs, method: v})} />
                              <InputField label="Participants" placeholder="e.g. 10 Users" value={inputs.participants} onChange={v => setInputs({...inputs, participants: v})} />
                            </div>
                          </div>
                        )}
                        {activeTool === 'competitive' && (
                          <div className="space-y-4">
                            <InputField label="My Product" placeholder="Describe your product core value..." value={inputs.product} onChange={v => setInputs({...inputs, product: v})} type="textarea" />
                            <div className="grid md:grid-cols-2 gap-4">
                              <InputField label="Competitors" placeholder="e.g. Slack, MS Teams" value={inputs.competitors} onChange={v => setInputs({...inputs, competitors: v})} />
                              <InputField label="Differentiator" placeholder="Why are we better?" value={inputs.diff} onChange={v => setInputs({...inputs, diff: v})} />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-4">
                      <button 
                        onClick={() => setInputs({})}
                        className="text-slate-500 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest"
                      >
                        Reset Workspace
                      </button>
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-10 py-3 rounded-lg font-bold flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-sky-500/20 text-xs uppercase tracking-widest"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        {isGenerating ? 'Processing...' : 'Run Intelligence'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Output Area */}
                {(output || isGenerating) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm"
                  >
                    <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-700/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {isGenerating ? 'Drafting content...' : 'Generated Asset'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors relative">
                          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                        <button onClick={saveToHistory} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-8">
                       <MarkDown content={output} />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-display font-extrabold mb-1">Local History</h2>
                  <p className="text-text-dim">All your generated documents are stored in your browser.</p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="bg-surface border border-white/5 rounded-radius-xl p-16 text-center">
                  <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4 text-text-muted">
                    <HistoryIcon size={32} />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">No documents found</h3>
                  <p className="text-text-dim mb-6">Start generating documents to see them here.</p>
                  <button onClick={() => setActiveSection('generate')} className="bg-accent px-6 py-2 rounded-lg font-bold">Get Started</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {history.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => viewHistoryItem(item)}
                      className="bg-surface border border-white/5 hover:border-accent/30 rounded-radius-xl p-6 cursor-pointer group transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest text-text-dim">
                          {item.tool}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-text-muted">{item.date}</span>
                           <button onClick={(e) => deleteHistory(item.id, e)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400 rounded-lg transition-all">
                             <Trash2 size={14} />
                           </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-display font-bold mb-2 flex items-center justify-between">
                        {item.title}
                        <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                      </h4>
                      <p className="text-text-dim text-sm line-clamp-2">{item.problem}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 px-6 border-t border-slate-800/50 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest bg-bg/50 backdrop-blur-sm mt-auto">
        <p>© 2026 PROD.COPILOT · Gemini 1.5 PRO · Optimized Workflow</p>
      </footer>
      
      <style>{`
        .btn-primary-gradient {
          background: #38bdf8;
          color: #020617;
          transition: all 0.2s ease;
        }
        .btn-primary-gradient:hover {
          background: #7dd3fc;
          transform: translateY(-1px);
        }
        .btn-primary-gradient:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

function NavTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
        active 
          ? 'bg-surface-3 text-accent border border-white/5 shadow-inner' 
          : 'text-text-dim hover:text-text-main hover:bg-white/5'
      }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function InputField({ label, placeholder, value, onChange, type = 'text', options }: { 
  label: string; 
  placeholder?: string; 
  value?: string; 
  onChange: (v: string) => void;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">{label}</label>
      {type === 'text' ? (
        <input 
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors"
        />
      ) : type === 'textarea' ? (
        <textarea 
          rows={4}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      ) : (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-surface-3 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
        >
          <option value="" disabled>Select Stage...</option>
          {options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    </div>
  )
}
