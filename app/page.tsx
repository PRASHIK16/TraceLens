'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Cpu, Eye, Network, CheckCircle2,
  ExternalLink, ArrowRight, Activity, History, Info, Sparkles,
  Lock, CheckSquare, Square, Layers, FileCheck, ShieldCheck,
  AlertOctagon, Moon, Sun, Menu, X
} from 'lucide-react';

export default function TraceLensApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'analysis' | 'history' | 'about'>('dashboard');
  const [searchUsername, setSearchUsername] = useState('zyz_123');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Theme & UX State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [colorTheme, setColorTheme] = useState<'whatsapp' | 'tinder' | 'cyber'>('whatsapp');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNodeHover, setActiveNodeHover] = useState<string | null>(null);

  // Manual Verification State
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
      alert('Error conducting scan. Please check your network connection.');
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

  // High-Contrast UX Styling Palette
  const themeStyles = {
    whatsapp: {
      bgDark: 'bg-[#0B141A]',
      cardDark: 'bg-[#111B21]',
      borderDark: 'border-[#222D34]',
      primaryBtn: 'bg-[#00A884] hover:bg-[#008f70] text-white shadow-emerald-900/30',
      badge: 'bg-[#00A884]/20 text-[#00A884] border-[#00A884]/40',
      activeTab: 'bg-[#00A884]/15 text-[#00A884] border-[#00A884]/50 font-bold',
      glow: 'hover:shadow-[0_0_25px_rgba(0,168,132,0.25)]',
      headingText: 'text-emerald-400',
    },
    tinder: {
      bgDark: 'bg-[#0F0C1B]',
      cardDark: 'bg-[#18132A]',
      borderDark: 'border-[#2C2348]',
      primaryBtn: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-rose-900/30',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      activeTab: 'bg-rose-500/15 text-rose-300 border-rose-500/50 font-bold',
      glow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
      headingText: 'text-rose-400',
    },
    cyber: {
      bgDark: 'bg-[#0A0D14]',
      cardDark: 'bg-[#0F131C]',
      borderDark: 'border-slate-800',
      primaryBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      activeTab: 'bg-indigo-600/15 text-indigo-300 border-indigo-500/50 font-bold',
      glow: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]',
      headingText: 'text-indigo-400',
    }
  };

  const currentTheme = themeStyles[colorTheme];
  const isLight = themeMode === 'light';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans antialiased flex flex-col ${
      isLight ? 'bg-slate-50 text-slate-900' : `${currentTheme.bgDark} text-slate-100`
    }`}>
      {/* Top Header Navigation */}
      <header className={`h-16 border-b sticky top-0 z-50 backdrop-blur-md transition-colors px-4 md:px-8 flex items-center justify-between ${
        isLight ? 'bg-white/95 border-slate-200 shadow-sm' : `${currentTheme.cardDark}/95 ${currentTheme.borderDark}`
      }`}>
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView('dashboard')}>
          <div className={`p-2.5 rounded-xl border transition-transform group-hover:scale-105 ${currentTheme.badge}`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wide">TraceLens</span>
            <span className="text-[11px] ml-2 px-2.5 py-0.5 rounded-full border font-mono uppercase font-bold hidden sm:inline-block">
              OSINT v2.5
            </span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden lg:block">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Target handle (e.g. zyz_123)..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
              className={`text-sm pl-9 pr-4 py-2 rounded-xl border focus:outline-none transition-all w-64 font-mono ${
                isLight 
                  ? 'bg-slate-100 border-slate-300 text-slate-900 focus:border-slate-500' 
                  : 'bg-slate-900 border-slate-700/80 text-slate-100 focus:border-indigo-500'
              }`}
            />
          </div>

          <button
            onClick={() => handleStartScan()}
            className={`text-xs px-4 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 shadow-lg hover:scale-105 ${currentTheme.primaryBtn}`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Run OSINT Audit</span>
          </button>

          {/* Theme Presets Toggle */}
          <div className="flex items-center space-x-1 border p-1 rounded-xl border-slate-700/60 bg-slate-800/30">
            <button
              onClick={() => setColorTheme('whatsapp')}
              title="WhatsApp Theme"
              className={`p-1.5 rounded-lg text-xs transition-all ${colorTheme === 'whatsapp' ? 'bg-[#00A884] text-white scale-110 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              💬
            </button>
            <button
              onClick={() => setColorTheme('tinder')}
              title="Tinder Theme"
              className={`p-1.5 rounded-lg text-xs transition-all ${colorTheme === 'tinder' ? 'bg-rose-500 text-white scale-110 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🔥
            </button>
            <button
              onClick={() => setColorTheme('cyber')}
              title="Cyber Indigo Theme"
              className={`p-1.5 rounded-lg text-xs transition-all ${colorTheme === 'cyber' ? 'bg-indigo-600 text-white scale-110 shadow' : 'text-slate-400 hover:text-white'}`}
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

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`w-64 border-r p-5 hidden md:flex flex-col justify-between transition-colors ${
          isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
        }`}>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'history', label: 'Audit History', icon: History },
              { id: 'about', label: 'OSINT Methodology', icon: Info },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setCurrentView(nav.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  currentView === nav.id
                    ? currentTheme.activeTab
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <nav.icon className="w-4 h-4" />
                <span>{nav.label}</span>
              </button>
            ))}
          </nav>

          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isLight ? 'bg-amber-50/90 border-amber-200 text-amber-950' : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center space-x-1.5 font-bold text-amber-500 text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Ethical OSINT Notice</span>
            </div>
            <p className="leading-relaxed text-[12px] opacity-90">
              Only public data indexes are queried. Use test seeds like <code className="font-mono font-bold text-indigo-400">@zyz_123</code>.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              {/* Main Heading Section */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Social Media Intelligence & Digital Footprint Dashboard
                </h1>
                <p className={`text-sm sm:text-base max-w-3xl leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                  TraceLens aggregates publicly observable endpoints, conducts cross-platform handle correlation, supports manual OSINT indicator validation, and generates privacy hardening audits.
                </p>
              </div>

              {/* Main Action Input Box */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all ${currentTheme.glow} ${
                isLight ? 'bg-white border-slate-200 shadow-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
              }`}>
                <h2 className={`text-xs font-black uppercase tracking-wider mb-3 ${currentTheme.headingText}`}>
                  Target Public Identity (Synthetic / Test Handle)
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-mono text-base font-bold">@</span>
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
                      placeholder="e.g. zyz_123, cyber_ninja"
                      className={`w-full border rounded-2xl pl-10 pr-4 py-3.5 text-sm font-mono font-semibold focus:outline-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-500'
                          : 'bg-slate-900/90 border-slate-700 text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleStartScan()}
                    className={`font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg hover:scale-105 flex items-center justify-center space-x-2 ${currentTheme.primaryBtn}`}
                  >
                    <Eye className="w-5 h-5" />
                    <span>Execute OSINT Workflow</span>
                  </button>
                </div>
              </div>

              {/* Preset Identity Seeds */}
              <div className="space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Test Identity Presets (Academic Seeds)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { handle: 'zyz_123', desc: 'Synthetic target with cross-platform handle reuse' },
                    { handle: 'cyber_ninja', desc: 'Developer identity seed with open repository metadata' },
                    { handle: 'shadow_dev', desc: 'Pseudonymous target with manual verification indicators' },
                    { handle: 'test_001', desc: 'Low visibility handle for baseline exposure testing' },
                  ].map((preset) => (
                    <div
                      key={preset.handle}
                      onClick={() => {
                        setSearchUsername(preset.handle);
                        handleStartScan(preset.handle);
                      }}
                      className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer group shadow-sm ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                          : `${currentTheme.cardDark}${currentTheme.borderDark} hover:border-indigo-500/60`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-black text-indigo-400 group-hover:text-indigo-300">
                          @{preset.handle}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className={`text-xs mt-2.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        {preset.desc}
                      </p>
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
                  isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                }`}>
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <Cpu className="w-8 h-8 text-indigo-400" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black">Scanning Public Target</h2>
                    <p className="text-sm font-mono text-indigo-400 font-bold">@{searchUsername}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border text-left space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>Execution Progress</span>
                      <span className="text-indigo-400">{Math.round(((scanStage + 1) / 5) * 100)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-700/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${((scanStage + 1) / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs font-mono pt-1 text-slate-300">
                      {scanStages[scanStage]}
                    </p>
                  </div>
                </div>
              ) : analysisData ? (
                <div className="space-y-8">
                  {/* Executive Summary Banner */}
                  <div className={`p-6 sm:p-8 rounded-3xl border flex flex-wrap items-center justify-between gap-6 shadow-md ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h2 className="font-mono text-2xl font-black">@{analysisData.username}</h2>
                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                          analysisData.summary.exposureLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                          analysisData.summary.exposureLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>
                          {analysisData.summary.exposureLevel} RISK
                        </span>
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                        Audit generated on {new Date(analysisData.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 sm:space-x-10">
                      <div>
                        <div className="text-3xl font-black">{analysisData.summary.accountsFound}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Endpoints</div>
                      </div>
                      <div className="w-px h-10 bg-slate-700/40" />
                      <div>
                        <div className="text-3xl font-black text-amber-400">
                          {Object.values(verifiedMap).filter(Boolean).length} / {analysisData.profiles.length}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified</div>
                      </div>
                      <div className="w-px h-10 bg-slate-700/40" />
                      <div>
                        <div className="text-3xl font-black text-indigo-400">{analysisData.summary.exposureScore}/100</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Exposure</div>
                      </div>
                    </div>
                  </div>

                  {/* High-Contrast Interactive Graph */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <div className="flex items-center justify-between border-b pb-4 border-slate-700/40">
                      <div>
                        <h2 className={`text-xl font-black flex items-center space-x-2 ${currentTheme.headingText}`}>
                          <Network className="w-6 h-6" />
                          <span>Interactive Identity Node Graph</span>
                        </h2>
                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          Hover over nodes to inspect platform handles and public identity signals.
                        </p>
                      </div>
                    </div>

                    <div className="relative w-full h-80 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-center overflow-hidden p-4">
                      <svg className="w-full h-full max-w-2xl" viewBox="0 0 500 280">
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
                              strokeWidth={activeNodeHover === p.id ? 3.5 : 2}
                              strokeDasharray={verifiedMap[p.id] ? 'none' : '4 4'}
                              className="transition-all duration-300"
                            />
                          );
                        })}

                        {/* Center Target Node */}
                        <g className="cursor-pointer">
                          <circle cx={250} cy={140} r={30} fill="#6366f1" className="animate-pulse opacity-90" />
                          <circle cx={250} cy={140} r={24} fill="#4f46e5" />
                          <text x={250} y={145} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold">
                            @{analysisData.username}
                          </text>
                        </g>

                        {/* Outer Platform Nodes */}
                        {analysisData.profiles.map((p: any, idx: number) => {
                          const angle = (idx / analysisData.profiles.length) * Math.PI * 2;
                          const cx = 250 + Math.cos(angle) * 150;
                          const cy = 140 + Math.sin(angle) * 90;
                          const isVerified = verifiedMap[p.id];

                          return (
                            <g
                              key={`node-${p.id}`}
                              className="cursor-pointer transition-transform hover:scale-110"
                              onMouseEnter={() => setActiveNodeHover(p.id)}
                              onMouseLeave={() => setActiveNodeHover(null)}
                              onClick={() => toggleVerifiedStatus(p.id)}
                            >
                              <circle
                                cx={cx}
                                cy={cy}
                                r={activeNodeHover === p.id ? 24 : 20}
                                fill={isVerified ? '#10b981' : '#f59e0b'}
                                className="transition-all duration-300 shadow-xl"
                              />
                              <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="black">
                                {p.platform.substring(0, 3)}
                              </text>
                              <text x={cx} y={cy + 34} textAnchor="middle" fill={isLight ? '#334155' : '#e2e8f0'} fontSize={12} fontWeight="bold">
                                {p.platform}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Hover Tooltip */}
                      {activeNodeHover && (
                        <div className="absolute bottom-4 left-4 bg-slate-900 border-2 border-indigo-500 p-3.5 rounded-xl shadow-2xl text-xs space-y-1 z-20 max-w-xs">
                          {(() => {
                            const p = analysisData.profiles.find((item: any) => item.id === activeNodeHover);
                            if (!p) return null;
                            return (
                              <>
                                <div className="font-extrabold text-indigo-300 text-sm">{p.platform} (@{p.username})</div>
                                <div className="text-slate-200 text-xs leading-snug">{p.bio}</div>
                                <div className="text-[11px] text-amber-400 font-mono font-bold pt-1">
                                  Status: {verifiedMap[p.id] ? '✓ Verified Entity' : '⚠ Unverified Entity'}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual OSINT Checklist */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                    isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                  }`}>
                    <div className="border-b pb-4 border-slate-700/40">
                      <h2 className="text-xl font-black flex items-center space-x-2 text-amber-400">
                        <FileCheck className="w-6 h-6" />
                        <span>Manual Verification Checklist</span>
                      </h2>
                      <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Review public indicators to verify target ownership.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisData.profiles.map((p: any) => {
                        const pCheck = checklists[p.id] || {};
                        const isVerified = verifiedMap[p.id];

                        return (
                          <div
                            key={p.id}
                            className={`p-5 rounded-2xl border transition-all duration-300 hover:border-amber-500/50 space-y-4 ${
                              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-base text-indigo-400">{p.platform}</span>
                              <button
                                onClick={() => toggleVerifiedStatus(p.id)}
                                className={`text-xs px-3 py-1 rounded-full font-mono font-bold border transition-all ${
                                  isVerified
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                }`}
                              >
                                {isVerified ? '✓ Verified' : '⚠ Unverified'}
                              </button>
                            </div>

                            <div className="font-mono text-sm font-bold text-slate-200">@{p.username}</div>

                            <div className="space-y-2.5 pt-3 border-t border-slate-700/30 text-xs">
                              <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider block">
                                Verification Checklist:
                              </span>
                              
                              {[
                                { key: 'handle', label: 'Same Username Handle' },
                                { key: 'bio', label: 'Bio / Interests Similarity' },
                                { key: 'avatar', label: 'Profile Picture Match' },
                                { key: 'links', label: 'Cross-Linked Public URLs' },
                              ].map((ind) => (
                                <div
                                  key={ind.key}
                                  onClick={() => toggleChecklist(p.id, ind.key)}
                                  className="flex items-center space-x-3 cursor-pointer text-slate-200 hover:text-white transition font-medium text-xs"
                                >
                                  {pCheck[ind.key] ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500" />
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
                </div>
              ) : null}
            </div>
          )}

          {currentView === 'history' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h2 className="text-2xl font-black">OSINT Audit History</h2>
              {history.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border text-sm text-slate-400 ${
                  isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
                }`}>
                  No prior audits recorded in history.
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
                      className={`p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                        isLight ? 'bg-white border-slate-200 hover:border-slate-400' : `${currentTheme.cardDark}${currentTheme.borderDark} hover:border-indigo-500/60`
                      }`}
                    >
                      <div>
                        <div className="font-mono font-bold text-base text-indigo-400">@{item.username}</div>
                        <div className="text-xs text-slate-400 mt-1">Audited on {item.date}</div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm font-bold">
                        <span className="text-slate-400">{item.accounts} Profiles</span>
                        <span className="text-amber-400">{item.score}/100 Risk</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'about' && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 text-sm leading-relaxed max-w-3xl mx-auto ${
              isLight ? 'bg-white border-slate-200' : `${currentTheme.cardDark}${currentTheme.borderDark}`
            }`}>
              <h2 className="text-2xl font-black text-indigo-400">TraceLens OSINT Methodology</h2>
              <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                TraceLens implements a 5-layer Open Source Intelligence (OSINT) framework designed for cross-platform handle correlation, manual indicator validation, digital footprint mapping, and privacy risk hardening.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}