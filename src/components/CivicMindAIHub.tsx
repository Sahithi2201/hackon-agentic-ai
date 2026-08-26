import React, { useState, useEffect } from 'react';
import { 
  CivicCase, 
  CivicDepartmentInfo, 
  DepartmentOfficer 
} from '../types';
import { 
  CivicPatternInsight, 
  OfficerWorkloadStats, 
  calculateOfficerWorkloads, 
  detectCivicPatterns, 
  askCivicMindAI,
  calculateSlaPrediction
} from '../services/civicAiService';
import { getCachedAgentActivityLogs, AgentActivityLog } from '../services/agentEngine';
import { 
  Sparkles, 
  Brain, 
  Search, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  Building2, 
  Repeat, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  Send, 
  Bot, 
  RefreshCw, 
  Zap, 
  Layers, 
  ArrowRight,
  Flame,
  UserCheck,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Cpu,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface CivicMindAIHubProps {
  cases: CivicCase[];
  onSelectCase: (caseItem: CivicCase) => void;
}

export const CivicMindAIHub: React.FC<CivicMindAIHubProps> = ({
  cases,
  onSelectCase
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agent_swarm' | 'ask_ai' | 'patterns' | 'sla_radar' | 'workload'>('overview');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activityLogs, setActivityLogs] = useState<AgentActivityLog[]>(getCachedAgentActivityLogs());

  // Natural Language Query State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  // Computed AI Data
  const [patterns, setPatterns] = useState<CivicPatternInsight[]>([]);
  const [officerStats, setOfficerStats] = useState<OfficerWorkloadStats[]>([]);

  useEffect(() => {
    setPatterns(detectCivicPatterns(cases));
    setOfficerStats(calculateOfficerWorkloads(cases));
    setActivityLogs(getCachedAgentActivityLogs());
  }, [cases]);

  // SLA at risk complaints
  const atRiskComplaints = cases
    .map(c => ({ caseItem: c, sla: calculateSlaPrediction(c) }))
    .filter(item => item.sla.slaStatus === 'AT_RISK' || item.sla.slaStatus === 'BREACHED')
    .slice(0, 5);

  // High priority cases
  const highPriorityCases = cases.filter(c => 
    c.finalGovernmentRisk === 'CRITICAL' || 
    c.systemRecommendedRisk === 'CRITICAL' ||
    c.finalGovernmentRisk === 'HIGH'
  ).slice(0, 4);

  // Handle Ask AI Submission
  const handleAskAI = async (queryText: string) => {
    if (!queryText.trim() || isQuerying) return;
    setIsQuerying(true);
    setAiAnswer(null);
    try {
      const response = await askCivicMindAI(queryText, cases);
      setAiAnswer(response);
      if (!recentQueries.includes(queryText)) {
        setRecentQueries(prev => [queryText, ...prev.slice(0, 3)]);
      }
    } catch (err) {
      console.error('CivicMind AI query error:', err);
      setAiAnswer('AI analysis temporarily unavailable. Please try again.');
    } finally {
      setIsQuerying(false);
    }
  };

  const quickPromptChips = [
    'Which complaints are high priority?',
    'Which department has the most pending complaints?',
    'Which officers have the highest workload?',
    'Show complaints that may exceed SLA.',
    'What are recurring problems in the area?'
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border-2 border-indigo-500/30 text-white shadow-xl overflow-hidden transition-all">
      
      {/* 1. TOP HEADER BAR */}
      <div className="p-4 sm:p-6 border-b border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">
                CIVICMIND AI INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 3.7 Flash Engine
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              Government AI Operations & Triage Assistant
            </h2>
          </div>
        </div>

        {/* Live Status Indicators & Toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-xs font-mono text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Live Database Grounding ({cases.length} Records)</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer border border-white/10"
          >
            {isExpanded ? 'Collapse Panel' : 'Expand AI Hub'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 2. NAVIGATION SUB-TABS */}
          <div className="flex flex-wrap items-center gap-1.5 p-3 px-4 sm:px-6 bg-slate-950/60 border-b border-indigo-500/20 text-xs font-bold overflow-x-auto">
            
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>AI Overview & Insights</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agent_swarm')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'agent_swarm'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-300" />
              <span>Agent Swarm Stream</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-400 text-slate-950 font-black">
                8 Neural Agents
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ask_ai')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ask_ai'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4 text-cyan-300" />
              <span>Ask CivicMind AI</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">NLP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('patterns')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'patterns'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Repeat className="w-4 h-4 text-amber-300" />
              <span>Pattern Detection</span>
              {patterns.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                  {patterns.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sla_radar')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'sla_radar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4 text-rose-300" />
              <span>SLA & Delay Radar</span>
              {atRiskComplaints.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black">
                  {atRiskComplaints.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workload')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'workload'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Officer Workload Balancer</span>
            </button>

          </div>

          {/* 3. TAB CONTENT PANELS */}
          <div className="p-4 sm:p-6 space-y-6">

            {/* ============================================================ */}
            {/* TAB 1: AI OVERVIEW & QUICK INSIGHTS                          */}
            {/* ============================================================ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 3 Top Summary Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Urgent Triage Card */}
                  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> High-Priority Triage
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {highPriorityCases.length} Critical/High
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      AI identified {highPriorityCases.length} complaints presenting public safety, sanitation, or structural hazards requiring priority officer dispatch.
                    </p>
                  </div>

                  {/* Recurring Issues */}
                  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-400" /> Recurring Patterns
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {patterns.length} Localized Clusters
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Multiple complaints detected in identical colonies. AI recommends scheduled infrastructure overhauls rather than isolated repairs.
                    </p>
                  </div>

                  {/* Delay & SLA Alert */}
                  <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-rose-300 uppercase font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> SLA Breach Monitor
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {atRiskComplaints.length} At Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {atRiskComplaints.length > 0 
                        ? `${atRiskComplaints.length} complaints have exceeded or are nearing the 48h resolution SLA threshold.`
                        : 'All active departmental workflows are currently pacing within standard municipal SLA limits.'}
                    </p>
                  </div>

                </div>

                {/* Spotlight: Urgent Complaints Recommended for Instant Review */}
                {highPriorityCases.length > 0 && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-mono font-black text-slate-200 uppercase tracking-wider">
                          AI Prioritized Complaints Ready for Officer Assignment
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Click to inspect and assign</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {highPriorityCases.map(c => (
                        <div
                          key={c.id}
                          onClick={() => onSelectCase(c)}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 hover:bg-slate-800/90 transition-all cursor-pointer flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                                {c.id}
                              </span>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                                Priority {c.finalGovernmentRisk || c.systemRecommendedRisk || 'HIGH'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {c.category}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {c.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              📍 {c.location.colony || c.location.area || 'Ward'}, {c.location.city || ''}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/30 group-hover:bg-cyan-500 group-hover:text-slate-950 text-cyan-300 transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 1.5: AGENT SWARM & LIVE ACTIVITY FEED STREAM             */}
            {/* ============================================================ */}
            {activeTab === 'agent_swarm' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Live Neural Agent Operations & Audit Trail
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Real-time stream of decisions emitted by Intake, Validation, Evidence, Duplicate, Risk, Routing, and SLA agents.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      Swarm Active (8 Agents)
                    </span>
                  </div>
                </div>

                {/* 8 Agent Top Status Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
                  {[
                    { name: 'Intake', status: 'ACTIVE', color: 'text-cyan-300' },
                    { name: 'Validation', status: 'READY', color: 'text-emerald-300' },
                    { name: 'Vision CV', status: 'ACTIVE', color: 'text-blue-300' },
                    { name: 'Duplicate', status: 'ACTIVE', color: 'text-amber-300' },
                    { name: 'Classifier', status: 'READY', color: 'text-indigo-300' },
                    { name: 'Risk Scoring', status: 'ACTIVE', color: 'text-rose-300' },
                    { name: 'Dispatcher', status: 'READY', color: 'text-teal-300' },
                    { name: 'SLA Radar', status: 'MONITORING', color: 'text-purple-300' },
                  ].map((ag, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className={`font-mono text-[10px] font-bold ${ag.color}`}>{ag.name}</div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{ag.status}</div>
                    </div>
                  ))}
                </div>

                {/* Activity Stream List */}
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {activityLogs.length > 0 ? (
                    activityLogs.slice(0, 15).map((log, idx) => (
                      <div 
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {log.agentName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Target: <strong className="text-white">{log.complaintId}</strong>
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <div className="font-bold text-white text-xs">
                            {log.action}
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {log.summary}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            Confidence: {log.confidence}%
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black ${
                            log.status === 'SUCCESS' || log.status === 'EXECUTED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : log.status === 'WARNING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                      <Terminal className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-300 font-bold">Autonomous Agent Telemetry Bus Listening...</p>
                      <p className="text-[11px] text-slate-500">New citizen submissions and officer field updates will log real-time agent decisions here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: ASK CIVICMIND AI (NATURAL LANGUAGE QUERY)             */}
            {/* ============================================================ */}
            {activeTab === 'ask_ai' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Ask CivicMind AI
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Query live complaint logs, officer workloads, SLA delays, and municipal patterns using natural language.
                  </p>
                </div>

                {/* Suggested Queries Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Suggested:</span>
                  {quickPromptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiQuery(chip);
                        handleAskAI(chip);
                      }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                    >
                      "{chip}"
                    </button>
                  ))}
                </div>

                {/* Query Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAI(aiQuery);
                  }}
                  className="relative flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask anything (e.g., Which complaints are high priority? Which department is overloaded?)..."
                      className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-950 border border-indigo-500/40 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-inner"
                    />
                    {aiQuery && (
                      <button
                        type="button"
                        onClick={() => setAiQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isQuerying || !aiQuery.trim()}
                    className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {isQuerying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Analyzing Live DB...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Ask AI</span>
                      </>
                    )}
                  </button>
                </form>

                {/* AI Answer Card */}
                {aiAnswer && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                          CivicMind AI Response
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Grounded in live database
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-1.5 font-medium">
                      {aiAnswer}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: AI PATTERN DETECTION (RECURRING LOCALITY PROBLEMS)    */}
            {/* ============================================================ */}
            {activeTab === 'patterns' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-amber-400" />
                      Recurring Civic Patterns & Localized Clusters
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      AI analyzes complaint distributions across localities to detect systemic municipal infrastructure defects.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {patterns.length} Patterns Flagged
                  </span>
                </div>

                {patterns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patterns.map((pat) => (
                      <div
                        key={pat.id}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            {pat.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                            {pat.complaintCount} Reported Cases
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {pat.description}
                        </p>

                        <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs space-y-1">
                          <span className="font-bold text-cyan-300 text-[11px] block uppercase font-mono">
                            Recommended Municipal Action:
                          </span>
                          <p className="text-slate-200 font-medium leading-relaxed">
                            {pat.recommendedGovernmentAction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-bold">No localized recurrence clusters detected.</p>
                    <p className="text-[11px] text-slate-500">Current complaints appear distributed normally across municipal wards.</p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: SLA & DELAY RADAR                                     */}
            {/* ============================================================ */}
            {activeTab === 'sla_radar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-400" />
                      SLA & Delay Prediction Radar
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Complaints exceeding or approaching the 48-hour municipal resolution SLA threshold.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {atRiskComplaints.length} Overdue / At Risk
                  </span>
                </div>

                {atRiskComplaints.length > 0 ? (
                  <div className="space-y-3">
                    {atRiskComplaints.map(({ caseItem, sla }) => (
                      <div
                        key={caseItem.id}
                        className="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              {caseItem.id}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              sla.slaStatus === 'BREACHED' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                            }`}>
                              {sla.slaStatus}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {sla.estimatedHoursRemaining}h SLA remaining
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {caseItem.title}
                          </h4>

                          <p className="text-xs text-rose-200">
                            <strong>Reason:</strong> {sla.delayRiskReason}
                          </p>

                          <div className="text-[11px] text-cyan-300 font-mono">
                            <strong>Recommended Action:</strong> {sla.recommendedAction}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectCase(caseItem)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-all"
                        >
                          Review & Escalate
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs text-slate-300 font-bold">All complaints are on track within standard 48h SLA.</p>
                    <p className="text-[11px] text-slate-500">Department response times are healthy and well-balanced.</p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 5: OFFICER WORKLOAD BALANCER                             */}
            {/* ============================================================ */}
            {activeTab === 'workload' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Live Officer Workload & Capacity Balancer
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Real-time distribution of assigned, ongoing, and completed tasks across all departmental officers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {officerStats.map((off) => (
                    <div
                      key={off.officerId}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 space-y-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{off.officerName}</span>
                          </h4>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {off.departmentName}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          off.workloadStatus === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          off.workloadStatus === 'HEAVY' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          off.workloadStatus === 'LIGHT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {off.workloadStatus}
                        </span>
                      </div>

                      {/* Counts */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-900/90 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned</span>
                          <span className="font-mono font-bold text-white">{off.totalAssigned}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400 block uppercase font-bold">Ongoing</span>
                          <span className="font-mono font-black text-amber-300">{off.ongoing}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-400 block uppercase font-bold">Resolved</span>
                          <span className="font-mono font-bold text-emerald-300">{off.resolved}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug font-medium">
                        💡 {off.recommendationNote}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
};
