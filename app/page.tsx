'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Cpu, Eye, Network, CheckCircle2,
  ExternalLink, ArrowRight, Activity, History, Info, Sparkles,
  Lock, CheckSquare, Square, Layers, FileCheck, ShieldCheck,
  AlertOctagon, Moon, Sun, Palette, Menu, X, Share2, Filter, RefreshCw
} from 'lucide-react';

export default function TraceLensApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'analysis' | 'history' | 'about'>('dashboard');
  const [searchUsername, setSearchUsername] = useState('zyz_123');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Theme & Layout State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [colorTheme, setColorTheme] = useState<'whatsapp' | 'tinder' | 'cyber'>('whatsapp');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNodeHover, setActiveNodeHover] = useState<string | null>(null);

  // Verification Checklist State
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});

  const scanStages = [
    'Stage 1: Discovering public handle presence across platform indexes...',
    'Stage 2: Fetching observable bio signals & metadata APIs...',
    'Stage 3: Correlating cross-platform identity indicators...',
    'Stage 4: Building Digital Footprint Mapping Matrix...',
    'Stage 5: Generating Intelligence Findings & OSINT Audit Report...'
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('tracelens_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse scan history');
      }
    }
  }, []);

  const handleStartScan = async (targetUsername?: string) => {
    const userToScan = targetUsername || searchUsername;
    if (!userToScan.trim()) return;

    setCurrentView('analysis');
    setIsScanning(true);
    setScanStage(0);
    setAnalysisData(null);
    setVerifiedMap({});
    setChecklists({});
    setIsMobileMenuOpen(false);

    const interval = setInterval(() => {
      setScanStage((prev) => {
        if (prev < scanStages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 450);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userToScan }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete scan');
      }

      const data = await response.json();
      clearInterval(interval);
      setAnalysisData(data);
      setIsScanning(false);

      const initialVerified: Record<string, boolean> = {};
      data.profiles.forEach((p: any) => {
        initialVerified[p.id] = p.verified || false;
      });
      setVerifiedMap(initialVerified);

      const historyItem = {
        id: Date.now().toString(),
        username: data.username,
        date: new Date().toLocaleDateString(),
        accounts: data.summary.accountsFound,
        exposure: data.summary.exposureLevel,
        score: data.summary.exposureScore,
        data,
      };

      setHistory((prev) => {
        const updated = [historyItem, ...prev.filter((h) => h.username !== data.username)];
        localStorage.setItem('tracelens_history', JSON.stringify(updated.slice(0, 10)));
        return updated;
      });
    } catch (err) {
      clearInterval(interval);
      setIsScanning(false);
      alert('Error conducting scan. Please make sure /api/analyze/route.ts is created.');
    }
  };

  const toggleChecklist = (profileId: string, indicatorKey: string) => {
    setChecklists((prev) => {
      const profileCheck = prev[profileId] || {};
      const updatedProfileCheck = { ...profileCheck, [indicatorKey]: !profileCheck[indicatorKey] };
      
      const totalChecked = Object.values(updatedProfileCheck).filter(Boolean).length;
      if (totalChecked >= 2) {
        setVerifiedMap((v) => ({ ...v, [profileId]: true }));
      }
      
      return { ...prev, [profileId]: updatedProfileCheck };
    });
  };

  const toggleVerifiedStatus = (profileId: string) => {
    setVerifiedMap((prev) => ({ ...prev, [profileId]: !prev[profileId] }));
  };

  // Theme Styling Palette Mapping
  const themeStyles = {
    whatsapp: {
      accent: 'emerald',
      bgDark: 'bg-[#0B141A]',
      cardDark: 'bg-[#111B21]',
      borderDark: 'border-[#222D34]',
      primaryBtn: 'bg-[#00A884] hover:bg-[#008f70] text-white shadow-emerald-900/30',
      badge: 'bg-[#00A884]/20 text-[#00A884] border-[#00A884]/30',
      activeTab: 'bg-[#00A884]/15 text-[#00A884] border-[#00A884]/40',
      glow: 'shadow-[0_0_20px_rgba(0,168,132,0.15)]',
    },
    tinder: {
      accent: 'rose',
      bgDark: 'bg-[#0F0C1B]',
      cardDark: 'bg-[#18132A]',
      borderDark: 'border-[#2C2348]',
      primaryBtn: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-900/30',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      activeTab: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    },
    cyber: {
      accent: 'indigo',
      bgDark: 'bg-[#0A0D14]',
      cardDark: 'bg-[#0F131C]',
      borderDark: 'border-slate-800',
      primaryBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      activeTab: 'bg-indigo-600/15 text-indigo-400 border-indigo-500/40',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    }
  };

  const currentTheme = themeStyles[colorTheme];
  const isLight = themeMode === 'light';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans antialiased flex flex-col ${
      isLight ? 'bg-slate-50 text-slate-900' : `${currentTheme.bgDark} text-slate-100`
    }`}>
      {/* Top Navigation Bar */}
      <header className={`h-16 border-b sticky top-0 z-50 backdrop-blur-md transition-colors px-4 md:px-8 flex items-center justify-between ${
        isLight ? 'bg-white/90 border-slate-200' : `${currentTheme.cardDark}/90 ${currentTheme.borderDark}`
      }`}>
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className={`p-2.5 rounded-xl border ${currentTheme.badge}`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider">TraceLens</span>
            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full border font-mono uppercase font-semibold hidden sm:inline-block">
              OSINT v2.5
            </span>
          </div>
        </div>

        {/* Global Controls & Theme Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Target handle (e.g. zyz_123)..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
              className={`text-xs pl-9 pr-4 py-2 rounded-xl border focus:outline-none transition w-60 font-mono ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-slate-500' 
                  : 'bg-[#161B26] border-slate-700/60 text-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>

          <button
            onClick={() => handleStartScan()}
            className={`text-xs px-4 py-2 rounded-xl font-semibold transition flex items-center space-x-1.5 shadow-lg ${currentTheme.primaryBtn}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run OSINT Audit</span>
          </button>

          {/* Theme Mode Selector */}
          <div className="flex items-center space-x-1 border p-1 rounded-xl border-slate-700/50 bg-slate-800/20">
            <button
              onClick={() => setColorTheme('whatsapp')}
              title="WhatsApp Theme"
              className={`p-1.5 rounded-lg text-xs transition ${colorTheme === 'whatsapp' ? 'bg-[#00A884] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              💬
            </button>
            <button
              onClick={() => setColorTheme('tinder')}
              title="Tinder Theme"
              className={`p-1.5 rounded-lg text-xs transition ${colorTheme === 'tinder' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🔥
            </button>
            <button
              onClick={() => setColorTheme('cyber')}
              title="Cyber Indigo Theme"
              className={`p-1.5 rounded-lg text-xs transition ${colorTheme === 'cyber' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              ⚡
            </button>
            <div className="w-px h-4 bg-slate-700/50 mx-1" />
            <button
              onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
              title="Toggle Light/Dark Mode"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-700 text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* OSINT Workflow Pipeline Bar */}
      <div className={`border-b px-4 md:px-8 py-2.5 text-[11px] font-mono flex items-center justify-between overflow-x-auto transition-colors ${
        isLight ? 'bg-slate-100/80 border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
      }`}>
        <span className="font-bold uppercase tracking-wider text-[10px] opacity-75 shrink-0 mr-4">
          OSINT Workflow Pipeline:
        </span>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="font-bold text-emerald-400">1. Discovery</span>
          <span>➔</span>
          <span className="font-bold text-amber-400">2. Manual Verification</span>
          <span>➔</span>
          <span className="font-bold text-sky-400">3. Footprint Mapping</span>
          <span>➔</span>
          <span className="font-bold text-purple-400">4. Intelligence Findings</span>
          <span>➔</span>
          <span className="font-bold text-rose-400">5. Risk Analysis</span>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <aside className={`w-64 border-r p-4 hidden md:flex flex-col justify-between transition-colors ${
          isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark} ${currentTheme.borderDark}`
        }`}>
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'history', label: 'Audit History', icon: History },
              { id: 'about', label: 'OSINT Methodology', icon: Info },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setCurrentView(nav.id as any)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  currentView === nav.id
                    ? currentTheme.activeTab
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <nav.icon className="w-4 h-4" />
                <span>{nav.label}</span>
              </button>
            ))}
          </nav>

          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center space-x-1.5 font-bold text-amber-500">
              <ShieldAlert className="w-4 h-4" />
              <span>Ethical OSINT Boundary</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Queries strictly public indicators. For academic/demo purposes, use test seeds like <code className="font-mono font-bold text-indigo-400">@zyz_123</code>.
            </p>
          </div>
        </aside>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className={`absolute top-0 left-0 right-0 z-40 border-b p-4 space-y-2 md:hidden ${
            isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark} ${currentTheme.borderDark}`
          }`}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'history', label: 'Audit History', icon: History },
              { id: 'about', label: 'OSINT Methodology', icon: Info },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => {
                  setCurrentView(nav.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                  currentView === nav.id ? currentTheme.activeTab : 'text-slate-400'
                }`}
              >
                <nav.icon className="w-4 h-4" />
                <span>{nav.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Social Media Intelligence & Digital Footprint Dashboard
                </h1>
                <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  TraceLens aggregates publicly observable endpoints, conducts cross-platform handle correlation, supports manual OSINT indicator validation, and generates detailed privacy hardening audits.
                </p>
              </div>

              {/* Main Input Box */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all ${
                isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark} ${currentTheme.borderDark} ${currentTheme.glow}`
              }`}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">
                  Target Public Identity (Synthetic / Test Handle)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
                      placeholder="e.g. zyz_123, cyber_ninja"
                      className={`w-full border rounded-2xl pl-9 pr-4 py-3 text-sm font-mono focus:outline-none transition ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500'
                          : 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleStartScan()}
                    className={`font-semibold px-8 py-3 rounded-2xl text-sm transition shadow-lg flex items-center justify-center space-x-2 ${currentTheme.primaryBtn}`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Execute OSINT Workflow</span>
                  </button>
                </div>

                <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Educational Use Notice: No private scraping or authentication bypass is performed.</span>
                </div>
              </div>

              {/* Preset Identity Seeds */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Test Identity Presets (Academic / Demo Seeds)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { handle: 'zyz_123', desc: 'Synthetic target with cross-platform handle reuse & bio indicators' },
                    { handle: 'cyber_ninja', desc: 'Developer identity seed with open public repository metadata' },
                    { handle: 'shadow_dev', desc: 'Pseudonymous target with partial manual verification indicators' },
                    { handle: 'test_001', desc: 'Low visibility handle for baseline exposure testing' },
                  ].map((preset) => (
                    <div
                      key={preset.handle}
                      onClick={() => {
                        setSearchUsername(preset.handle);
                        handleStartScan(preset.handle);
                      }}
                      className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer group ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
                          : `${currentTheme.cardDark} ${currentTheme.borderDark} hover:border-indigo-500/50`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                          @{preset.handle}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{preset.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'analysis' && (
            <div className="space-y-8">
              {isScanning ? (
                <div className={`p-8 sm:p-12 rounded-3xl border max-w-lg mx-auto text-center space-y-6 shadow-2xl ${
                  isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark} ${currentTheme.borderDark}`
                }`}>
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <Cpu className="w-8 h-8 text-indigo-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold">Running OSINT Intelligence Workflow</h3>
                    <p className="text-xs font-mono text-indigo-400">Target: @{searchUsername}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border text-left space-y-2.5 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>Workflow Execution</span>
                      <span className="font-bold">{Math.round(((scanStage + 1) / 5) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${((scanStage + 1) / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs font-mono pt-1 text-slate-400">
                      {scanStages[scanStage]}
                    </p>
                  </div>
                </div>
              ) : analysisData ? (
                <div className="space-y-8">
                  {/* Executive Summary Banner */}
                  <div className={`p-6 sm:p-8 rounded-3xl border flex flex-wrap items-center justify-between gap-6 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : `${currentTheme.cardDark} ${currentTheme.borderDark}`
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xl font-bold">@{analysisData.username}</span>
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                          analysisData.summary.exposureLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          analysisData.summary.exposureLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {analysisData.summary.exposureLevel} RISK
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Audit generated on {new Date(analysisData.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 sm:space-x-8 text-center overflow-x-auto">
                      <div>
                        <div className="text-2xl font-bold">{analysisData.summary.accountsFound}</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Discovered</div>
                      </div>
                      <div className="w-px h-8 bg-slate-700/40" />
                      <div>
                        <div className="text-2xl font-bold text-amber-400">
                          {Object.values(verifiedMap).filter(Boolean).length} / {analysisData.profiles.length}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Verified</div>
                      </div>
                      <div className="w-px h-8 bg-slate-700/40" />
                      <div>
                        <div className="text-2xl font-bold text-indigo-400">{analysisData.summary.exposureScore}/100</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Exposure Score</div>
                      </div>
                    </div>
                  </div>

                  {/* High-Impact Interactive Identity Graph (SVG UI/UX Redesign) */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <div className="flex items-center justify-between border-b pb-4 border-slate-700/40">
                      <div>
                        <h2 className="text-base font-extrabold flex items-center space-x-2 text-indigo-400">
                          <Network className="w-5 h-5" />
                          <span>Interactive Identity Node Graph</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Hover or tap nodes to inspect cross-platform handles and public identity signals.
                        </p>
                      </div>
                    </div>

                    {/* SVG Interactive Visualizer */}
                    <div className="relative w-full h-80 bg-slate-950/40 rounded-2xl border border-slate-800/80 flex items-center justify-center overflow-hidden p-4">
                      <svg className="w-full h-full max-w-2xl" viewBox="0 0 500 280">
                        {/* Connecting Edge Lines */}
                        {analysisData.profiles.map((p: any, idx: number) => {
                          const angle = (idx / analysisData.profiles.length) * Math.PI * 2;
                          const cx = 250 + Math.cos(angle) * 150;
                          const cy = 140 + Math.sin(angle) * 90;

                          return (
                            <line
                              key={`line-${p.id}`}
                              x1={250}
                              y1={140}
                              x2={cx}
                              y2={cy}
                              stroke={verifiedMap[p.id] ? '#10b981' : '#f59e0b'}
                              strokeWidth={activeNodeHover === p.id ? 3 : 1.5}
                              strokeDasharray={verifiedMap[p.id] ? 'none' : '4 4'}
                              className="transition-all duration-300"
                            />
                          );
                        })}

                        {/* Center Target Node */}
                        <g className="cursor-pointer">
                          <circle cx={250} cy={140} r={28} fill="#6366f1" className="animate-pulse opacity-90" />
                          <circle cx={250} cy={140} r={22} fill="#4f46e5" />
                          <text x={250} y={144} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="bold">
                            @{analysisData.username}
                          </text>
                        </g>

                        {/* Platform Nodes */}
                        {analysisData.profiles.map((p: any, idx: number) => {
                          const angle = (idx / analysisData.profiles.length) * Math.PI * 2;
                          const cx = 250 + Math.cos(angle) * 150;
                          const cy = 140 + Math.sin(angle) * 90;
                          const isVerified = verifiedMap[p.id];

                          return (
                            <g
                              key={`node-${p.id}`}
                              className="cursor-pointer group"
                              onMouseEnter={() => setActiveNodeHover(p.id)}
                              onMouseLeave={() => setActiveNodeHover(null)}
                              onClick={() => toggleVerifiedStatus(p.id)}
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={activeNodeHover === p.id ? 22 : 18}
                                fill={isVerified ? '#10b981' : '#f59e0b'}
                                className="transition-all duration-300"
                              />
                              <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight="bold">
                                {p.platform.substring(0, 3)}
                              </text>
                              <text x={cx} y={cy + 30} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="medium">
                                {p.platform}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Hover Information Tooltip */}
                      {activeNodeHover && (
                        <div className="absolute bottom-4 left-4 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 z-20">
                          {(() => {
                            const p = analysisData.profiles.find((item: any) => item.id === activeNodeHover);
                            if (!p) return null;
                            return (
                              <>
                                <div className="font-bold text-indigo-400">{p.platform} (@{p.username})</div>
                                <div className="text-slate-300 text-[11px]">{p.bio}</div>
                                <div className="text-[10px] text-amber-400 font-mono">
                                  Status: {verifiedMap[p.id] ? 'Verified Entity' : 'Unverified Identity'}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Layer 2: Manual Verification OSINT Layer */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <div className="flex items-center justify-between border-b pb-4 border-slate-700/40">
                      <div>
                        <h2 className="text-base font-extrabold flex items-center space-x-2 text-amber-400">
                          <FileCheck className="w-5 h-5" />
                          <span>Layer 2: Manual OSINT Verification (Validation Checklist)</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Perform manual indicator auditing to verify if discovered handle presences belong to the same entity.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisData.profiles.map((p: any) => {
                        const pCheck = checklists[p.id] || {};
                        const isVerified = verifiedMap[p.id];

                        return (
                          <div
                            key={p.id}
                            className={`p-5 rounded-2xl border transition space-y-4 ${
                              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-indigo-400">{p.platform}</span>
                              <button
                                onClick={() => toggleVerifiedStatus(p.id)}
                                className={`text-[10px] px-3 py-1 rounded-full font-mono border font-bold transition ${
                                  isVerified
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {isVerified ? '✓ Verified Entity' : '⚠ Unverified'}
                              </button>
                            </div>

                            <div className="font-mono text-xs text-slate-300">@{p.username}</div>

                            <div className="space-y-2 pt-2 border-t border-slate-700/30 text-xs">
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                                Verification Indicators:
                              </span>
                              
                              {[
                                { key: 'handle', label: 'Same Username Handle' },
                                { key: 'bio', label: 'Bio / Interests Similarity' },
                                { key: 'avatar', label: 'Profile Picture / Avatar Match' },
                                { key: 'links', label: 'Cross-Linked Public URLs' },
                              ].map((ind) => (
                                <div
                                  key={ind.key}
                                  onClick={() => toggleChecklist(p.id, ind.key)}
                                  className="flex items-center space-x-2.5 cursor-pointer text-slate-300 hover:text-white transition"
                                >
                                  {pCheck[ind.key] ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-600" />
                                  )}
                                  <span>{ind.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Layer 3: Digital Footprint Mapping Matrix */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <div className="flex items-center justify-between border-b pb-4 border-slate-700/40">
                      <div>
                        <h2 className="text-base font-extrabold flex items-center space-x-2 text-sky-400">
                          <Layers className="w-5 h-5" />
                          <span>Layer 3: Digital Footprint Mapping Matrix</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Evidence mapping matrix correlating platform handles, observed evidence, confidence, and verification status.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className={`uppercase text-[10px] ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'}`}>
                          <tr>
                            <th className="p-3.5">Platform</th>
                            <th className="p-3.5">Username</th>
                            <th className="p-3.5">Public Evidence Indicator</th>
                            <th className="p-3.5">Confidence</th>
                            <th className="p-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {analysisData.profiles.map((p: any) => (
                            <tr key={p.id} className="hover:bg-slate-800/20 transition">
                              <td className="p-3.5 font-bold text-indigo-400">{p.platform}</td>
                              <td className="p-3.5">@{p.username}</td>
                              <td className="p-3.5 text-slate-400">{p.evidence}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400' :
                                  p.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {p.confidence}
                                </span>
                              </td>
                              <td className="p-3.5">
                                {verifiedMap[p.id] ? (
                                  <span className="text-emerald-400 font-bold">Verified</span>
                                ) : (
                                  <span className="text-amber-400 font-bold">Unverified</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Layer 4 & 5: Intelligence Findings & Risk Remediation */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <h2 className="text-base font-extrabold flex items-center space-x-2 text-rose-400">
                      <AlertOctagon className="w-5 h-5" />
                      <span>Layer 4 & 5: Intelligence Findings & Risk Remediation</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisData.intelligenceFindings.map((f: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-2xl border space-y-2 text-xs ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{f.category}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold">
                              {f.severity}
                            </span>
                          </div>
                          <p className="text-indigo-400 font-medium">{f.finding}</p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{f.impact}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-700/40 space-y-3">
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Actionable Security Recommendations</span>
                      </span>
                      <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                        {analysisData.recommendations.map((r: any) => (
                          <li key={r.id}>
                            <strong className="text-slate-100">{r.title}:</strong> {r.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {currentView === 'history' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h2 className="text-xl font-bold">OSINT Audit History</h2>
              {history.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border text-xs text-slate-500 ${
                  isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                }`}>
                  No prior audits recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAnalysisData(item.data);
                        setCurrentView('analysis');
                      }}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        isLight ? 'bg-white border-slate-200 hover:border-slate-400' : `${currentTheme.cardDark}${currentTheme.borderDark} hover:border-indigo-500/50`
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold text-indigo-400">@{item.username}</div>
                        <div className="text-[11px] text-slate-400">Audited on {item.date}</div>
                      </div>
                      <div className="flex items-center space-x-6 text-xs">
                        <span className="text-slate-400">{item.accounts} Profiles</span>
                        <span className="font-bold">{item.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'about' && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 text-xs leading-relaxed max-w-3xl mx-auto ${
              isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
            }`}>
              <h2 className="text-lg font-extrabold text-indigo-400">TraceLens OSINT Methodology</h2>
              <p>
                TraceLens implements a 5-layer Open Source Intelligence (OSINT) framework designed for cross-platform handle correlation, manual indicator validation, digital footprint mapping, and privacy risk hardening.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
