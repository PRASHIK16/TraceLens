import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldAlert, Cpu, Eye, Network, CheckCircle2,
  ArrowRight, Activity, History, Info, Sparkles,
  CheckSquare, Square, Layers, FileCheck, ShieldCheck,
  Moon, Sun, AlertTriangle, ArrowDown, ExternalLink,
  ChevronRight, Lock, UserCheck, BarChart3, ListFilter,
  Check, RefreshCw, Database
} from 'lucide-react';

interface ProfileEndpoint {
  id: string;
  platform: string;
  username: string;
  bio: string;
  avatarUrl: string;
  url: string;
  category: string;
  evidence: string;
  initialConfidence: 'High' | 'Medium' | 'Low';
  verified: boolean;
}

interface IntelligenceFinding {
  id: string;
  title: string;
  category: 'Reuse' | 'Exposure' | 'Connection' | 'Footprint' | 'Risk';
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
}

interface AuditRecord {
  id: string;
  username: string;
  timestamp: string;
  accountsFound: number;
  verifiedCount: number;
  exposureScore: number;
  exposureLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  profiles: ProfileEndpoint[];
  findings: IntelligenceFinding[];
  recommendations: string[];
}

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'pipeline' | 'history' | 'about'>('dashboard');
  const [searchUsername, setSearchUsername] = useState('wesbos');
  const [isScanning, setIsScanning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [auditData, setAuditData] = useState<AuditRecord | null>(null);
  const [history, setHistory] = useState<AuditRecord[]>([]);

  // Strict WhatsApp Web Dark/Light Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Manual Verification & Checklist state
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>({});
  const [checklists, setChecklists] = useState<Record<string, Record<string, boolean>>>({});
  const [activeNodeHover, setActiveNodeHover] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const pipelineStages = [
    {
      step: 1,
      name: 'Username Discovery',
      badge: 'LAYER 01',
      action: 'Target Public Handle Query',
      description: 'Queries public handle availability across 500+ global social networks, developer hubs, and index databases.',
      icon: Search
    },
    {
      step: 2,
      name: 'Manual OSINT Verification',
      badge: 'LAYER 02',
      action: 'Signal & Indicator Validation',
      description: 'Analyst checks observable metadata: Bio signals, avatar similarities, handle reuse, and cross-linked URLs.',
      icon: UserCheck
    },
    {
      step: 3,
      name: 'Footprint Mapping Matrix',
      badge: 'LAYER 03',
      action: 'Evidence & Confidence Graph',
      description: 'Structures profile findings into an evidence matrix with assigned confidence levels (High / Medium / Low).',
      icon: Database
    },
    {
      step: 4,
      name: 'Intelligence Findings',
      badge: 'LAYER 04',
      action: 'Pattern & Correlation Analysis',
      description: 'Synthesizes cross-platform handle reuse, public data exposure, node connections, and footprint area.',
      icon: BarChart3
    },
    {
      step: 5,
      name: 'Privacy & Risk Hardening',
      badge: 'LAYER 05',
      action: 'Defense & Remediation Steps',
      description: 'Generates tailored privacy defense steps to reduce exposure surface and harden personal security posture.',
      icon: Lock
    }
  ];

  const generateAudit = (targetHandle: string): AuditRecord => {
    const handle = targetHandle.trim().toLowerCase() || 'wesbos';
    
    const profiles: ProfileEndpoint[] = [
      {
        id: 'p1',
        platform: 'GitHub',
        username: handle,
        bio: 'Full Stack Developer, Educator & Content Creator. Node, React, JS.',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        url: `https://github.com/${handle}`,
        category: 'Development',
        evidence: 'Exact handle match + verified bio metadata & public repositories',
        initialConfidence: 'High',
        verified: true
      },
      {
        id: 'p2',
        platform: 'X (Twitter)',
        username: handle,
        bio: 'Web Developer, Podcaster, building courses and sharing web dev tips.',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        url: `https://x.com/${handle}`,
        category: 'Social Media',
        evidence: 'Cross-linked website in bio matching GitHub profile',
        initialConfidence: 'High',
        verified: true
      },
      {
        id: 'p3',
        platform: 'Instagram',
        username: handle,
        bio: 'Coding, BBQ, woodworking and family life.',
        avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80`,
        url: `https://instagram.com/${handle}`,
        category: 'Personal / Visual',
        evidence: 'Same handle, matching avatar features & verified domain link',
        initialConfidence: 'High',
        verified: true
      },
      {
        id: 'p4',
        platform: 'Reddit',
        username: handle,
        bio: 'Active poster in r/webdev, r/javascript, and r/node.',
        avatarUrl: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80`,
        url: `https://reddit.com/user/${handle}`,
        category: 'Discussion Forum',
        evidence: 'Identical username reuse with correlated technical posting topics',
        initialConfidence: 'Medium',
        verified: false
      },
      {
        id: 'p5',
        platform: 'LinkedIn',
        username: handle,
        bio: 'Independent Web Developer & Software Educator',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
        url: `https://linkedin.com/in/${handle}`,
        category: 'Professional',
        evidence: 'Name alignment and educational content portfolio link',
        initialConfidence: 'High',
        verified: true
      },
      {
        id: 'p6',
        platform: 'Dev.to',
        username: handle,
        bio: 'Sharing JavaScript tutorials & web tools.',
        avatarUrl: `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80`,
        url: `https://dev.to/${handle}`,
        category: 'Blogging',
        evidence: 'Same handle, syndicate link back to personal homepage',
        initialConfidence: 'Medium',
        verified: false
      }
    ];

    const findings: IntelligenceFinding[] = [
      {
        id: 'f1',
        title: 'High Handle Reuse Rate Across Platforms',
        category: 'Reuse',
        severity: 'Warning',
        description: `The username "${handle}" was identified across 6 distinct public index categories. Using an identical handle simplifies cross-platform identity correlation for OSINT queries.`
      },
      {
        id: 'f2',
        title: 'Cross-Linked Domain Verification',
        category: 'Connection',
        severity: 'Info',
        description: 'Multiple profiles (GitHub, X, LinkedIn) explicitly reference the same personal domain URL, confirming single-entity identity ownership.'
      },
      {
        id: 'f3',
        title: 'Public Bio & Interest Correlation',
        category: 'Exposure',
        severity: 'Warning',
        description: 'Consistent mention of specific tech stacks and personal hobbies across both professional and casual platforms allows easy identity profiling.'
      },
      {
        id: 'f4',
        title: 'Digital Footprint Size Exposure',
        category: 'Footprint',
        severity: 'Critical',
        description: 'Broad digital footprint across code repositories, social channels, and forum discussions increases vector surface for targeted phishing or handle takeover.'
      }
    ];

    const recommendations = [
      'Avoid reusing identical usernames across both professional code repositories and personal lifestyle accounts.',
      'Audit and limit personal location or hobby specifics in public social bio sections.',
      'Enable Hardware MFA (FIDO2 / YubiKey) on platforms sharing the target handle to prevent account takeover.',
      'Review privacy settings on secondary forums (e.g. Reddit, Dev.to) to detach personal domain URLs.'
    ];

    return {
      id: Date.now().toString(),
      username: handle,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      accountsFound: profiles.length,
      verifiedCount: profiles.filter(p => p.verified).length,
      exposureScore: 82,
      exposureLevel: 'HIGH',
      profiles,
      findings,
      recommendations
    };
  };

  const handleExecuteScan = (targetOverride?: string) => {
    const query = targetOverride || searchUsername;
    if (!query.trim()) return;

    setIsScanning(true);
    setCurrentView('pipeline');
    setActiveStep(0);

    // Simulate step-by-step pipeline progression
    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      if (stepCount < pipelineStages.length) {
        setActiveStep(stepCount);
      } else {
        clearInterval(interval);
        const newAudit = generateAudit(query);
        setAuditData(newAudit);
        
        // Initialize verified map
        const initialMap: Record<string, boolean> = {};
        newAudit.profiles.forEach(p => { initialMap[p.id] = p.verified; });
        setVerifiedMap(initialMap);

        setIsScanning(false);

        // Save to History
        setHistory(prev => [newAudit, ...prev.filter(h => h.username !== newAudit.username)]);
      }
    }, 600);
  };

  const toggleVerified = (profileId: string) => {
    setVerifiedMap(prev => ({ ...prev, [profileId]: !prev[profileId] }));
  };

  const toggleChecklist = (profileId: string, itemKey: string) => {
    setChecklists(prev => {
      const pCheck = prev[profileId] || {};
      const updated = { ...pCheck, [itemKey]: !pCheck[itemKey] };
      const totalChecked = Object.values(updated).filter(Boolean).length;
      if (totalChecked >= 2) {
        setVerifiedMap(v => ({ ...v, [profileId]: true }));
      }
      return { ...prev, [profileId]: updated };
    });
  };

  useEffect(() => {
    // Initial default scan
    handleExecuteScan('wesbos');
  }, []);

  // WhatsApp Web Signature Color Palette:
  // Dark Mode: Dark Charcoal (#111B21), Body Dark (#0B141A), Teal (#00A884), Border (#222D34)
  // Light Mode: Pure White (#FFFFFF), Body Light (#F0F2F5), Slate (#111B21), Border (#E9EDEF)
  const bgBody = isDarkMode ? 'bg-[#0B141A] text-[#E9EDEF]' : 'bg-[#F0F2F5] text-[#111B21]';
  const bgCard = isDarkMode ? 'bg-[#111B21]' : 'bg-[#FFFFFF]';
  const bgCardAlt = isDarkMode ? 'bg-[#202C33]' : 'bg-[#F0F2F5]';
  const borderColor = isDarkMode ? 'border-[#222D34]' : 'border-[#E9EDEF]';
  const textPrimary = isDarkMode ? 'text-[#E9EDEF]' : 'text-[#111B21]';
  const textSecondary = isDarkMode ? 'text-[#8696A0]' : 'text-[#667781]';
  const tealAccent = '#00A884';

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-200 flex flex-col ${bgBody}`}>
      
      {}
      <header className={`h-16 border-b sticky top-0 z-50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between transition-colors ${bgCard} ${borderColor}`}>
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="p-2.5 rounded-xl bg-[#00A884]/15 border border-[#00A884]/30 text-[#00A884]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-lg tracking-tight ${textPrimary}`}>TraceLens</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider bg-[#00A884] text-white">
                OSINT v2.4
              </span>
            </div>
            <p className={`text-[11px] font-medium ${textSecondary}`}>Digital Footprint & Identity Correlation Engine</p>
          </div>
        </div>

        {/* Global Search Bar & Nav Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block w-72">
            <span className={`absolute left-3.5 top-2.5 text-xs font-mono font-bold ${textSecondary}`}>@</span>
            <input
              type="text"
              placeholder="Search public handle..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteScan()}
              className={`w-full text-xs font-mono font-bold pl-8 pr-4 py-2 rounded-xl border focus:outline-none transition-all ${
                isDarkMode 
                  ? 'bg-[#202C33] border-[#222D34] text-[#E9EDEF] focus:border-[#00A884] placeholder:text-[#8696A0]' 
                  : 'bg-[#F0F2F5] border-[#E9EDEF] text-[#111B21] focus:border-[#00A884] placeholder:text-[#667781]'
              }`}
            />
          </div>

          <button
            onClick={() => handleExecuteScan()}
            className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all duration-150 flex items-center space-x-2 shadow-sm bg-[#00A884] hover:bg-[#008f70] active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Run 5-Stage Audit</span>
          </button>

          <div className="w-px h-6 bg-gray-400/20 mx-1" />

          {/* Clean Light / Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-[#202C33] border-[#222D34] text-amber-400 hover:bg-[#2a3942]' 
                : 'bg-[#F0F2F5] border-[#E9EDEF] text-[#111B21] hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {}
      <div className="flex flex-1 relative">
        {/* Navigation Sidebar */}
        <aside className={`w-64 border-r p-4 hidden md:flex flex-col justify-between transition-colors ${bgCard} ${borderColor}`}>
          <div className="space-y-6">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 ${textSecondary}`}>Navigation</span>
              {[
                { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
                { id: 'pipeline', label: '5-Stage OSINT Audit', icon: Layers },
                { id: 'history', label: 'Audit Log History', icon: History },
                { id: 'about', label: 'Framework Methodology', icon: Info },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentView === item.id
                      ? 'bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30'
                      : `${textSecondary} hover:bg-gray-500/10 hover:${textPrimary}`
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Demo Handles */}
            <div className="space-y-2 pt-4 border-t border-gray-500/10">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 ${textSecondary}`}>Quick Test Targets</span>
              {[
                { name: 'wesbos', label: '@wesbos (Educator)' },
                { name: 'zyz_123', label: '@zyz_123 (Synthetic)' },
                { name: 'shadow_dev', label: '@shadow_dev (Developer)' },
              ].map((target) => (
                <button
                  key={target.name}
                  onClick={() => {
                    setSearchUsername(target.name);
                    handleExecuteScan(target.name);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-medium transition flex items-center justify-between ${
                    isDarkMode ? 'hover:bg-[#202C33] text-[#8696A0]' : 'hover:bg-[#F0F2F5] text-[#667781]'
                  }`}
                >
                  <span>{target.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
            isDarkMode ? 'bg-[#202C33]/60 border-[#222D34]' : 'bg-[#F0F2F5] border-[#E9EDEF]'
          }`}>
            <div className="flex items-center space-x-2 text-[#00A884] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Ethical OSINT Standard</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
              TraceLens strictly queries public, indexable endpoints and open web metadata for threat surface auditing.
            </p>
          </div>
        </aside>

        {/* Content Body Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">

          {}
          {currentView === 'pipeline' && (
            <div className="space-y-8">
              {/* Stepper Flow Banner */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${bgCard} ${borderColor}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-gray-500/10">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#00A884] uppercase tracking-wider">
                      End-To-End Methodology
                    </span>
                    <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${textPrimary}`}>
                      5-Stage Structured OSINT Pipeline Workflow
                    </h1>
                  </div>

                  {auditData && !isScanning && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#00A884]/15 text-[#00A884] border border-[#00A884]/30">
                        ✓ Pipeline Complete
                      </span>
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className="text-xs font-bold px-4 py-1.5 rounded-xl bg-[#00A884] text-white hover:bg-[#008f70] transition"
                      >
                        View Executive Summary
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive 5-Step Pipeline Horizontal Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {pipelineStages.map((stg, idx) => {
                    const isActive = isScanning ? activeStep === idx : true;
                    const isPassed = isScanning ? activeStep > idx : true;

                    return (
                      <div
                        key={stg.step}
                        className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                          isActive
                            ? 'bg-[#00A884]/10 border-[#00A884] shadow-md'
                            : `${bgCardAlt} ${borderColor} opacity-80`
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                              isActive ? 'bg-[#00A884] text-white' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {stg.badge}
                            </span>
                            {isPassed && <Check className="w-4 h-4 text-[#00A884]" />}
                          </div>

                          <div className="flex items-center space-x-2 my-2">
                            <stg.icon className={`w-4 h-4 ${isActive ? 'text-[#00A884]' : textSecondary}`} />
                            <h3 className={`text-xs font-bold leading-snug ${textPrimary}`}>{stg.name}</h3>
                          </div>

                          <p className={`text-[11px] font-normal leading-relaxed mt-1 ${textSecondary}`}>
                            {stg.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-2 border-t border-gray-500/10 flex items-center justify-between text-[10px] font-mono font-bold text-[#00A884]">
                          <span>{stg.action}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Scanner Loading State */}
              {isScanning ? (
                <div className={`p-12 rounded-3xl border text-center space-y-6 max-w-xl mx-auto shadow-lg ${bgCard} ${borderColor}`}>
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-[#00A884]/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#00A884] border-t-transparent rounded-full animate-spin" />
                    <Cpu className="w-7 h-7 text-[#00A884]" />
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className={`text-xl font-bold ${textPrimary}`}>Executing Pipeline Stage 0{activeStep + 1}</h2>
                    <p className={`text-xs font-mono ${textSecondary}`}>Target: @{searchUsername}</p>
                  </div>

                  <div className={`p-4 rounded-2xl border text-left space-y-2 ${bgCardAlt} ${borderColor}`}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span className={textPrimary}>{pipelineStages[activeStep].name}</span>
                      <span className="text-[#00A884]">{Math.round(((activeStep + 1) / 5) * 100)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-500/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00A884] transition-all duration-300 rounded-full"
                        style={{ width: `${((activeStep + 1) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : auditData ? (
                <div className="space-y-8">
                  
                  {/* Stage 1: Username Discovery */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${bgCard} ${borderColor}`}>
                    <div className="flex items-center justify-between border-b pb-4 border-gray-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#00A884]/15 text-[#00A884]">
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${textPrimary}`}>Stage 1 — Username Discovery</h2>
                          <p className={`text-xs ${textSecondary}`}>Identified public account endpoints across target platform databases.</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00A884]">
                        {auditData.accountsFound} Endpoints Queried
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {auditData.profiles.map((p) => (
                        <div key={p.id} className={`p-4 rounded-2xl border flex items-center justify-between ${bgCardAlt} ${borderColor}`}>
                          <div>
                            <div className={`font-bold text-xs ${textPrimary}`}>{p.platform}</div>
                            <div className="text-[11px] font-mono text-[#00A884] font-bold">@{p.username}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 font-bold border border-emerald-500/30">
                            Found
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage 2: Manual Verification & Indicator Validation */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${bgCard} ${borderColor}`}>
                    <div className="flex items-center justify-between border-b pb-4 border-gray-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#00A884]/15 text-[#00A884]">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${textPrimary}`}>Stage 2 — Manual OSINT Validation</h2>
                          <p className={`text-xs ${textSecondary}`}>Verify observable signals to confirm genuine entity ownership.</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00A884]">
                        {Object.values(verifiedMap).filter(Boolean).length} / {auditData.profiles.length} Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {auditData.profiles.map((p) => {
                        const isVer = verifiedMap[p.id];
                        const pCheck = checklists[p.id] || {};

                        return (
                          <div key={p.id} className={`p-5 rounded-2xl border space-y-4 ${bgCardAlt} ${borderColor}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img src={p.avatarUrl} alt={p.platform} className="w-10 h-10 rounded-xl object-cover border border-gray-500/20" />
                                <div>
                                  <div className={`font-bold text-sm ${textPrimary}`}>{p.platform}</div>
                                  <div className="text-xs font-mono text-[#00A884]">@{p.username}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleVerified(p.id)}
                                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border transition ${
                                  isVer
                                    ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-600 border-amber-500/40'
                                }`}
                              >
                                {isVer ? '✓ Verified Entity' : '⚠ Needs Review'}
                              </button>
                            </div>

                            <p className={`text-xs ${textSecondary} leading-relaxed`}>{p.bio}</p>

                            <div className="space-y-2 pt-3 border-t border-gray-500/10 text-xs">
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${textSecondary}`}>
                                Validation Checklist:
                              </span>
                              {[
                                { key: 'handle', label: 'Same Username Handle Reuse' },
                                { key: 'bio', label: 'Bio / Tech Stack Similarity' },
                                { key: 'avatar', label: 'Avatar Feature Match' },
                                { key: 'links', label: 'Cross-Linked Personal URL' },
                              ].map((ind) => (
                                <div
                                  key={ind.key}
                                  onClick={() => toggleChecklist(p.id, ind.key)}
                                  className={`flex items-center space-x-2.5 cursor-pointer font-medium text-xs ${textPrimary}`}
                                >
                                  {pCheck[ind.key] ? (
                                    <CheckSquare className="w-4 h-4 text-[#00A884]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-gray-400" />
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

                  {/* Stage 3: Digital Footprint Mapping Matrix */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${bgCard} ${borderColor}`}>
                    <div className="flex items-center justify-between border-b pb-4 border-gray-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#00A884]/15 text-[#00A884]">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${textPrimary}`}>Stage 3 — Digital Footprint Mapping Matrix</h2>
                          <p className={`text-xs ${textSecondary}`}>Structured evidence log with confidence classification levels.</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b ${borderColor} ${textSecondary} uppercase font-mono text-[10px]`}>
                            <th className="p-3">Platform</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Public Evidence</th>
                            <th className="p-3">Confidence Level</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-500/10 font-medium">
                          {auditData.profiles.map((p) => (
                            <tr key={p.id} className={`hover:bg-gray-500/5 transition ${textPrimary}`}>
                              <td className="p-3 font-bold">{p.platform}</td>
                              <td className="p-3 font-mono text-[#00A884]">@{p.username}</td>
                              <td className={`p-3 max-w-xs ${textSecondary}`}>{p.evidence}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                  p.initialConfidence === 'High'
                                    ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-600 border-amber-500/40'
                                }`}>
                                  {p.initialConfidence}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 text-[#00A884] font-bold hover:underline"
                                >
                                  <span>Inspect Profile</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Stage 4: Intelligence Findings */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${bgCard} ${borderColor}`}>
                    <div className="flex items-center justify-between border-b pb-4 border-gray-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#00A884]/15 text-[#00A884]">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${textPrimary}`}>Stage 4 — Intelligence Findings</h2>
                          <p className={`text-xs ${textSecondary}`}>Identified username reuse patterns, privacy exposure, and connections.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {auditData.findings.map((f) => (
                        <div key={f.id} className={`p-5 rounded-2xl border space-y-2 ${bgCardAlt} ${borderColor}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00A884]/20 text-[#00A884]">
                              {f.category}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              f.severity === 'Critical' ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'
                            }`}>
                              {f.severity}
                            </span>
                          </div>
                          <h3 className={`text-xs font-bold ${textPrimary}`}>{f.title}</h3>
                          <p className={`text-xs ${textSecondary} leading-relaxed`}>{f.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage 5: Privacy & Risk Hardening Recommendations */}
                  <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${bgCard} ${borderColor}`}>
                    <div className="flex items-center justify-between border-b pb-4 border-gray-500/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#00A884]/15 text-[#00A884]">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${textPrimary}`}>Stage 5 — Privacy & Risk Recommendations</h2>
                          <p className={`text-xs ${textSecondary}`}>Actionable defense measures to reduce overall digital exposure surface.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {auditData.recommendations.map((rec, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border flex items-start space-x-3 ${bgCardAlt} ${borderColor}`}>
                          <CheckCircle2 className="w-5 h-5 text-[#00A884] shrink-0 mt-0.5" />
                          <p className={`text-xs font-medium leading-relaxed ${textPrimary}`}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : null}
            </div>
          )}

          {}
          {currentView === 'dashboard' && auditData && (
            <div className="space-y-8">
              {/* Executive Target Banner */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-wrap items-center justify-between gap-6 ${bgCard} ${borderColor}`}>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00A884]">Target Entity</span>
                  <div className="flex items-center space-x-3">
                    <h1 className={`text-2xl sm:text-3xl font-mono font-bold ${textPrimary}`}>@{auditData.username}</h1>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 border border-rose-500/40">
                      HIGH RISK EXPOSURE
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${textSecondary}`}>Audit completed: {auditData.timestamp}</p>
                </div>

                <div className="flex items-center space-x-6 sm:space-x-10">
                  <div>
                    <div className={`text-2xl sm:text-3xl font-black ${textPrimary}`}>{auditData.accountsFound}</div>
                    <div className={`text-[10px] font-mono font-bold uppercase ${textSecondary}`}>Endpoints</div>
                  </div>
                  <div className="w-px h-8 bg-gray-500/20" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#00A884]">
                      {Object.values(verifiedMap).filter(Boolean).length} / {auditData.profiles.length}
                    </div>
                    <div className={`text-[10px] font-mono font-bold uppercase ${textSecondary}`}>Verified</div>
                  </div>
                  <div className="w-px h-8 bg-gray-500/20" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-500">{auditData.exposureScore}/100</div>
                    <div className={`text-[10px] font-mono font-bold uppercase ${textSecondary}`}>Risk Score</div>
                  </div>
                </div>
              </div>

              {/* Identity Node Visualization Graph */}
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${bgCard} ${borderColor}`}>
                <div className="flex items-center justify-between border-b pb-4 border-gray-500/10">
                  <div>
                    <h2 className={`text-lg font-bold flex items-center space-x-2 ${textPrimary}`}>
                      <Network className="w-5 h-5 text-[#00A884]" />
                      <span>Interactive Identity Correlation Graph</span>
                    </h2>
                    <p className={`text-xs ${textSecondary}`}>Node connection graph between public accounts and target handle seed.</p>
                  </div>
                </div>

                <div className="relative w-full h-80 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-4">
                  <svg className="w-full h-full max-w-xl" viewBox="0 0 500 280">
                    {auditData.profiles.map((p, idx) => {
                      const angle = (idx / auditData.profiles.length) * Math.PI * 2;
                      const cx = 250 + Math.cos(angle) * 150;
                      const cy = 140 + Math.sin(angle) * 90;

                      return (
                        <line
                          key={`l-${p.id}`}
                          x1={250}
                          y1={140}
                          x2={cx}
                          y2={cy}
                          stroke={verifiedMap[p.id] ? '#00A884' : '#f59e0b'}
                          strokeWidth={activeNodeHover === p.id ? 3 : 1.5}
                          strokeDasharray={verifiedMap[p.id] ? 'none' : '4 4'}
                        />
                      );
                    })}

                    {/* Central Target Node */}
                    <g className="cursor-pointer">
                      <circle cx={250} cy={140} r={28} fill="#00A884" className="animate-pulse opacity-90" />
                      <circle cx={250} cy={140} r={22} fill="#008f70" />
                      <text x={250} y={144} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="bold">
                        @{auditData.username}
                      </text>
                    </g>

                    {/* Endpoint Nodes */}
                    {auditData.profiles.map((p, idx) => {
                      const angle = (idx / auditData.profiles.length) * Math.PI * 2;
                      const cx = 250 + Math.cos(angle) * 150;
                      const cy = 140 + Math.sin(angle) * 90;
                      const isVer = verifiedMap[p.id];

                      return (
                        <g
                          key={`n-${p.id}`}
                          className="cursor-pointer transition-transform hover:scale-110"
                          onMouseEnter={() => setActiveNodeHover(p.id)}
                          onMouseLeave={() => setActiveNodeHover(null)}
                          onClick={() => toggleVerified(p.id)}
                        >
                          <circle cx={cx} cy={cy} r={18} fill={isVer ? '#00A884' : '#f59e0b'} />
                          <text x={cx} y={cy + 4} textAnchor="middle" fill="#ffffff" fontSize={9} fontWeight="bold">
                            {p.platform.substring(0, 3)}
                          </text>
                          <text x={cx} y={cy + 30} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold">
                            {p.platform}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Node Hover Tooltip */}
                  {activeNodeHover && (
                    <div className="absolute bottom-4 left-4 bg-slate-900 border border-[#00A884] p-3 rounded-xl text-xs space-y-1 shadow-xl max-w-xs z-10">
                      {(() => {
                        const p = auditData.profiles.find(item => item.id === activeNodeHover);
                        if (!p) return null;
                        return (
                          <>
                            <div className="font-bold text-[#00A884]">{p.platform} (@{p.username})</div>
                            <div className="text-slate-300 text-[11px] leading-tight">{p.bio}</div>
                            <div className="text-[10px] text-amber-400 font-mono pt-1">
                              Confidence: {p.initialConfidence}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Pipeline Transition Button */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setCurrentView('pipeline')}
                  className="text-xs font-bold px-6 py-3 rounded-2xl bg-[#00A884] text-white hover:bg-[#008f70] transition inline-flex items-center space-x-2 shadow-md"
                >
                  <span>Explore Full 5-Stage OSINT Audit Workflow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {}
          {currentView === 'history' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h2 className={`text-xl font-bold ${textPrimary}`}>Audit History Log</h2>
              {history.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border text-xs ${bgCard} ${borderColor} ${textSecondary}`}>
                  No audit history logged.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAuditData(item);
                        setCurrentView('dashboard');
                      }}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition hover:border-[#00A884] ${bgCard} ${borderColor}`}
                    >
                      <div>
                        <div className="font-mono font-bold text-sm text-[#00A884]">@{item.username}</div>
                        <div className={`text-xs ${textSecondary}`}>{item.timestamp}</div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs font-bold">
                        <span className={textPrimary}>{item.accountsFound} Endpoints</span>
                        <span className="text-rose-500">{item.exposureScore}/100 Risk</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {}
          {currentView === 'about' && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-4 text-xs leading-relaxed max-w-3xl mx-auto ${bgCard} ${borderColor}`}>
              <h2 className={`text-xl font-bold text-[#00A884]`}>TraceLens OSINT Methodology</h2>
              <p className={textSecondary}>
                TraceLens implements a 5-layer Open Source Intelligence framework designed for public identity discovery, manual signal verification, footprint mapping, and privacy hardening.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}