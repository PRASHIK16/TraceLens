'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShieldAlert, Cpu, Eye, Network, CheckCircle2,
  ExternalLink, ArrowRight, Activity, History, Info, Sparkles,
  Lock, CheckSquare, Square, Layers, FileCheck, ShieldCheck,
  AlertOctagon
} from 'lucide-react';

export default function TraceLensApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'analysis' | 'history' | 'about'>('dashboard');
  const [searchUsername, setSearchUsername] = useState('zyz_123');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Verification Checklist State
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const interval = setInterval(() => {
      setScanStage((prev) => {
        if (prev < scanStages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 500);

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

      // Pre-populate initial verification state from API
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

  useEffect(() => {
    if (!analysisData || isScanning || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: any[] = [
      { id: 'center', label: `@${analysisData.username}`, type: 'central', x: 250, y: 140, radius: 22, color: '#6366f1' },
    ];

    const edges: any[] = [];

    analysisData.profiles.forEach((p: any, idx: number) => {
      const angle = (idx / analysisData.profiles.length) * Math.PI * 2;
      const x = 250 + Math.cos(angle) * 120;
      const y = 140 + Math.sin(angle) * 85;
      const nodeId = `profile-${p.id}`;
      
      nodes.push({
        id: nodeId,
        label: p.platform,
        subLabel: `@${p.username}`,
        type: 'profile',
        x,
        y,
        radius: 15,
        color: verifiedMap[p.id] ? '#10b981' : '#f59e0b',
        details: p,
      });

      edges.push({ from: 'center', to: nodeId });
    });

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      edges.forEach((edge) => {
        const source = nodes.find((n) => n.id === edge.from);
        const target = nodes.find((n) => n.id === edge.to);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = node.type === 'central' ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 13);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [analysisData, isScanning, verifiedMap]);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0F131C]/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wider text-slate-100">TraceLens</span>
            <span className="text-[10px] ml-2 px-2 py-0.5 bg-slate-800 text-indigo-400 rounded-full border border-indigo-500/20 font-mono">
              OSINT FRAMEWORK
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Target username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
              className="bg-[#161B26] border border-slate-700/60 text-xs pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 w-64 font-mono"
            />
          </div>
          <button
            onClick={() => handleStartScan()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-medium transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run OSINT Audit</span>
          </button>
        </div>
      </header>

      {/* OSINT Workflow Pipeline Bar */}
      <div className="bg-[#121722] border-b border-slate-800/60 px-6 py-2.5 text-[11px] font-mono text-slate-400 flex items-center justify-between overflow-x-auto">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">OSINT Workflow Pipeline:</span>
        <div className="flex items-center space-x-2">
          <span className="text-indigo-400 font-bold">1. Discovery</span>
          <span>➔</span>
          <span className="text-amber-400 font-bold">2. Manual Verification</span>
          <span>➔</span>
          <span className="text-sky-400 font-bold">3. Footprint Mapping</span>
          <span>➔</span>
          <span className="text-purple-400 font-bold">4. Intelligence Findings</span>
          <span>➔</span>
          <span className="text-emerald-400 font-bold">5. Risk Analysis</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-60 border-r border-slate-800/80 bg-[#0F131C] p-4 hidden md:flex flex-col justify-between">
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                currentView === 'dashboard' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                currentView === 'history' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit History</span>
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                currentView === 'about' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>OSINT Methodology</span>
            </button>
          </nav>

          <div className="bg-[#161B26] p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Ethical Boundary</span>
            </div>
            <p className="leading-relaxed">
              Analyzes strictly publicly available indicators. Use synthetic test identities (e.g., <code className="text-indigo-300">@zyz_123</code>) for demonstration.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-[#0A0D14] p-6 overflow-y-auto">
          {currentView === 'dashboard' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Social Media Intelligence & Digital Footprint Framework
                </h1>
                <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
                  TraceLens combines automated endpoint discovery with manual OSINT validation, digital footprint mapping, and intelligence correlation to audit publicly observable identity exposures.
                </p>
              </div>

              <div className="bg-[#0F131C] border border-slate-800 p-6 rounded-2xl shadow-xl relative">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Target Public Identity (Test / Synthetic Handle)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-slate-500 text-sm font-mono">@</span>
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartScan()}
                      placeholder="e.g. zyz_123, cyber_ninja"
                      className="w-full bg-[#161B26] border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => handleStartScan()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Execute OSINT Workflow</span>
                  </button>
                </div>

                <div className="mt-4 flex items-center space-x-2 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Educational Use Notice: No private scraping or authentication bypass is performed.</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Test Identity Presets (Academic / Demo Seeds)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="bg-[#0F131C] border border-slate-800/80 p-4 rounded-xl hover:border-indigo-500/50 hover:bg-[#131824] cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                          @{preset.handle}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">{preset.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'analysis' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {isScanning ? (
                <div className="bg-[#0F131C] border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-6 shadow-2xl">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <Cpu className="w-6 h-6 text-indigo-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Running OSINT Intelligence Workflow</h3>
                    <p className="text-xs font-mono text-indigo-400">Target: @{searchUsername}</p>
                  </div>

                  <div className="bg-[#161B26] p-4 rounded-xl border border-slate-800 text-left space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Workflow Progress</span>
                      <span>{Math.round(((scanStage + 1) / 5) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${((scanStage + 1) / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono pt-1">
                      {scanStages[scanStage]}
                    </p>
                  </div>
                </div>
              ) : analysisData ? (
                <div className="space-y-8">
                  {/* Summary Bar */}
                  <div className="bg-[#0F131C] border border-slate-800 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-bold text-white">@{analysisData.username}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          analysisData.summary.exposureLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          analysisData.summary.exposureLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {analysisData.summary.exposureLevel} RISK LEVEL
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        OSINT Audit generated on {new Date(analysisData.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 text-center">
                      <div>
                        <div className="text-xl font-bold text-white">{analysisData.summary.accountsFound}</div>
                        <div className="text-[10px] uppercase text-slate-400">Discovered Profiles</div>
                      </div>
                      <div className="w-px h-8 bg-slate-800" />
                      <div>
                        <div className="text-xl font-bold text-amber-400">
                          {Object.values(verifiedMap).filter(Boolean).length} / {analysisData.profiles.length}
                        </div>
                        <div className="text-[10px] uppercase text-slate-400">Verified Profiles</div>
                      </div>
                      <div className="w-px h-8 bg-slate-800" />
                      <div>
                        <div className="text-xl font-bold text-indigo-400">{analysisData.summary.exposureScore}/100</div>
                        <div className="text-[10px] uppercase text-slate-400">Exposure Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Manual Verification Layer */}
                  <div className="bg-[#0F131C] border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h2 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                          <FileCheck className="w-4 h-4" />
                          <span>Layer 2: Manual OSINT Verification (Validation Checklist)</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Cross-check publicly observable indicators to confirm if discovered profiles belong to the same entity.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisData.profiles.map((p: any) => {
                        const pCheck = checklists[p.id] || {};
                        const isVerified = verifiedMap[p.id];

                        return (
                          <div key={p.id} className="bg-[#141923] border border-slate-800 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-indigo-300">{p.platform}</span>
                              <button
                                onClick={() => toggleVerifiedStatus(p.id)}
                                className={`text-[10px] px-2 py-0.5 rounded font-mono border font-medium ${
                                  isVerified
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {isVerified ? '✓ Verified' : '⚠ Pending Verification'}
                              </button>
                            </div>

                            <div className="text-xs font-mono text-slate-200">@{p.username}</div>

                            <div className="space-y-1.5 pt-1 border-t border-slate-800/80 text-[11px]">
                              <span className="text-slate-400 text-[10px] font-semibold uppercase">Verification Indicators:</span>
                              
                              {[
                                { key: 'handle', label: 'Same Username Handle' },
                                { key: 'bio', label: 'Bio / Interests Similarity' },
                                { key: 'avatar', label: 'Profile Picture / Avatar Match' },
                                { key: 'links', label: 'Cross-Linked Public URLs' },
                              ].map((ind) => (
                                <div
                                  key={ind.key}
                                  onClick={() => toggleChecklist(p.id, ind.key)}
                                  className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white"
                                >
                                  {pCheck[ind.key] ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-600" />
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

                  {/* Section 3: Digital Footprint Mapping Table */}
                  <div className="bg-[#0F131C] border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h2 className="text-sm font-bold text-sky-400 flex items-center space-x-2">
                          <Layers className="w-4 h-4" />
                          <span>Layer 3: Digital Footprint Mapping Matrix</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Structured evidence mapping table linking platforms, handles, public evidence, and confidence ratings.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#141923] text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Platform</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Public Evidence Indicator</th>
                            <th className="p-3">Confidence</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {analysisData.profiles.map((p: any) => (
                            <tr key={p.id} className="hover:bg-[#131824]">
                              <td className="p-3 font-semibold text-indigo-400">{p.platform}</td>
                              <td className="p-3 font-mono">@{p.username}</td>
                              <td className="p-3 text-slate-400">{p.evidence}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  p.confidence === 'High' ? 'bg-emerald-500/10 text-emerald-400' :
                                  p.confidence === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {p.confidence}
                                </span>
                              </td>
                              <td className="p-3">
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

                  {/* Section 4 & Graph: Intelligence Findings & Risk Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-[#0F131C] border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                          <Network className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Identity Graph Visualization</span>
                        </span>
                      </div>
                      <div className="flex justify-center items-center py-2">
                        <canvas ref={canvasRef} width={500} height={280} className="w-full h-auto max-h-56" />
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-[#0F131C] border border-slate-800 p-6 rounded-2xl space-y-4">
                      <h2 className="text-sm font-bold text-purple-400 flex items-center space-x-2">
                        <AlertOctagon className="w-4 h-4" />
                        <span>Layer 4 & 5: Intelligence Findings & Risk Analysis</span>
                      </h2>

                      <div className="space-y-3">
                        {analysisData.intelligenceFindings.map((f: any, idx: number) => (
                          <div key={idx} className="bg-[#141923] border border-slate-800 p-3.5 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{f.category}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                                {f.severity} SEVERITY
                              </span>
                            </div>
                            <p className="text-indigo-300">{f.finding}</p>
                            <p className="text-slate-400 text-[11px]">{f.impact}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Actionable Recommendations</span>
                        </span>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {analysisData.recommendations.map((r: any) => (
                            <li key={r.id}>
                              <strong className="text-slate-100">{r.title}:</strong> {r.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {currentView === 'history' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-slate-100">OSINT Audit History</h2>
              {history.length === 0 ? (
                <div className="bg-[#0F131C] border border-slate-800 p-8 text-center rounded-2xl text-slate-500 text-xs">
                  No previous audits saved.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAnalysisData(item.data);
                        setCurrentView('analysis');
                      }}
                      className="bg-[#0F131C] border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-indigo-500/40 cursor-pointer transition"
                    >
                      <div>
                        <div className="font-mono font-bold text-sm text-indigo-400">@{item.username}</div>
                        <div className="text-[11px] text-slate-500">Audited on {item.date}</div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-slate-400">{item.accounts} Profiles</span>
                        <span className="font-bold text-slate-200">{item.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'about' && (
            <div className="max-w-3xl mx-auto bg-[#0F131C] border border-slate-800 p-6 rounded-2xl space-y-4 text-slate-300 text-xs leading-relaxed">
              <h2 className="text-lg font-bold text-slate-100">TraceLens OSINT Methodology</h2>
              <p>
                TraceLens implements a 5-stage Open Source Intelligence (OSINT) framework designed to demonstrate cross-platform handle correlation, manual indicator verification, footprint mapping, and privacy risk assessment.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}