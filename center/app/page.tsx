'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Locale, t, timeAgo } from '@/lib/i18n';

// ==================== Types ====================
interface Agent {
  id: string;
  name: string;
  species: string;
  status: string;
  last_heartbeat: string;
  memory_count: number;
  dream_count: number;
}

interface AgentDetail {
  agent: Agent & { avg_importance: number };
  recentMemories: { id: number; digest: string; type: string; importance: number; tags: string; created_at: string }[];
  recentDreams: { id: number; summary: string; status: string; health_score: number; dreamed_at: string }[];
}

interface DashboardData {
  stats: {
    total_agents: number;
    online_agents: number;
    total_memories: number;
    total_dreams: number;
    avg_importance: number;
  };
  memoryByType: { type: string; count: number }[];
  agentsSummary: Agent[];
  recentActivity: { id: number; agent_name: string; sync_type: string; details: string; created_at: string }[];
  dreamsByDay: { date: string; count: number }[];
}

interface SearchResult {
  id: number;
  digest: string;
  type: string;
  importance: number;
  tags: string;
  agent_name: string;
  content_preview: string;
  created_at: string;
}

// ==================== Constants ====================
const SPECIES_MAP: Record<string, { emoji: string; label: string; labelZh: string }> = {
  lobster: { emoji: '🦞', label: 'LOBSTER', labelZh: '龙虾' },
  ai: { emoji: '🤖', label: 'AI AGENT', labelZh: 'AI 智能体' },
  human: { emoji: '👤', label: 'HUMAN', labelZh: '人类' },
};

const TYPE_COLORS: Record<string, string> = {
  lesson: '#ffe600',
  decision: '#39ff14',
  fact: '#00f0ff',
  project: '#b44dff',
  procedure: '#00f0ff',
  person: '#ff2d78',
  observation: '#ff8c00',
  reflection: '#b44dff',
};

// ==================== Main Component ====================
export default function Dashboard() {
  const [locale, setLocale] = useState<Locale>('zh');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Register
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentSpecies, setNewAgentSpecies] = useState('lobster');
  const [newApiKey, setNewApiKey] = useState('');
  const [newAgentToken, setNewAgentToken] = useState('');
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const T = useCallback((key: any) => t(locale, key), [locale]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) { console.error('Dashboard fetch error:', e); }
    finally { setLoading(false); }
  }

  async function fetchAgentDetail(id: string) {
    try {
      const res = await fetch(`/api/agents/${id}`);
      setSelectedAgent(await res.json());
    } catch (e) { console.error(e); }
  }

  async function deleteAgent(id: string) {
    if (!confirm(T('detail.delete_confirm'))) return;
    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      setSelectedAgent(null);
      fetchDashboard();
    } catch (e) { console.error(e); }
  }

  async function registerAgent() {
    if (!newAgentName.trim()) return;
    setRegistering(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgentName, species: newAgentSpecies }),
      });
      const json = await res.json();
      if (json.success) {
        setNewApiKey(json.apiKey);
        setNewAgentToken(json.token);
        fetchDashboard();
      }
    } catch (e) { console.error(e); }
    finally { setRegistering(false); }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const json = await res.json();
      setSearchResults(json.results || []);
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  }

  function copyClip(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function resetRegister() {
    setShowRegister(false);
    setNewApiKey('');
    setNewAgentToken('');
    setNewAgentName('');
  }

  // ========== Loading ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center grid-bg scanline relative">
        <div className="text-center">
          <div className="text-4xl font-orbitron font-bold neon-text-cyan mb-4 glitch-text">{T('loading.title')}</div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            <span className="text-cyber-cyan/60 text-sm font-mono">{T('loading.subtitle')}</span>
          </div>
          {/* Loading bar */}
          <div className="mt-6 w-64 h-1 bg-cyber-dark rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full animate-data-flow" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 grid-bg scanline relative overflow-x-hidden">
      {/* ======== HEADER ======== */}
      <header className="sticky top-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-cyber-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-pink/20 flex items-center justify-center border border-cyber-cyan/30 shadow-neon-cyan">
                <span className="text-xl">🧠</span>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyber-green pulse-dot-green" />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-lg tracking-wider">
                <span className="neon-text-cyan">{T('header.title_1')}</span>
                <span className="neon-text-pink">{T('header.title_2')}</span>
              </h1>
              <p className="text-[10px] text-cyber-cyan/40 font-mono tracking-[0.2em] uppercase">{T('header.subtitle')}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System status */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-cyber-border bg-cyber-dark/50">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-green pulse-dot-green" />
                <span className="text-xs text-cyber-green font-mono">{data?.stats.online_agents || 0} {T('header.online')}</span>
              </div>
              <div className="w-px h-4 bg-cyber-border" />
              <span className="text-xs text-gray-500 font-mono">{data?.stats.total_agents || 0} {T('header.total')}</span>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="px-2.5 py-1.5 rounded-lg border border-cyber-border hover:border-cyber-purple/50 hover:bg-cyber-purple/5 transition-all font-mono text-xs text-gray-400 hover:text-cyber-purple"
              title="Switch Language"
            >
              {T('header.lang')}
            </button>

            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 transition-all group"
              title={T('header.search')}
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-cyber-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Register */}
            <button
              onClick={() => setShowRegister(true)}
              className="px-3 sm:px-4 py-2 rounded-lg font-mono text-sm font-semibold bg-gradient-to-r from-cyber-cyan/20 to-cyber-pink/20 border border-cyber-cyan/40 hover:border-cyber-cyan hover:shadow-neon-cyan transition-all text-cyber-cyan"
            >
              {T('header.register')}
            </button>
          </div>
        </div>
      </header>

      {/* ======== SEARCH BAR ======== */}
      {showSearch && (
        <div className="sticky top-16 z-30 bg-[#050508]/95 backdrop-blur-xl border-b border-cyber-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan/50 font-mono text-sm">{'>'}</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={T('search.placeholder')}
                  className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-2.5 pl-8 pr-4 text-sm font-mono text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-cyber-cyan/60 focus:shadow-neon-cyan transition-all"
                  autoFocus
                />
              </div>
              <button onClick={handleSearch} disabled={searching}
                className="px-4 py-2 rounded-lg border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan font-mono text-sm hover:bg-cyber-cyan/20 transition-all disabled:opacity-50">
                {searching ? T('search.scanning') : T('search.button')}
              </button>
              <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}
                className="px-3 py-2 rounded-lg border border-cyber-border text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-all">
                ✕
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
                {searchResults.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-cyber-panel border border-cyber-border hover:border-cyber-cyan/30 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase"
                        style={{ color: TYPE_COLORS[r.type] || '#00f0ff', backgroundColor: `${TYPE_COLORS[r.type] || '#00f0ff'}15`, border: `1px solid ${TYPE_COLORS[r.type] || '#00f0ff'}30` }}>
                        {r.type}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">← {r.agent_name}</span>
                      <span className="text-[10px] text-gray-600 font-mono ml-auto">{timeAgo(locale, r.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300">{r.digest}</p>
                    {r.content_preview && <p className="text-xs text-gray-500 mt-1 truncate">{r.content_preview}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======== MAIN ======== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={T('stats.agents')} value={data?.stats.total_agents || 0} icon="🤖" color="cyan" />
          <StatCard label={T('stats.online')} value={data?.stats.online_agents || 0} icon="⚡" color="green" />
          <StatCard label={T('stats.memories')} value={data?.stats.total_memories || 0} icon="🧠" color="purple" />
          <StatCard label={T('stats.dreams')} value={data?.stats.total_dreams || 0} icon="💭" color="pink" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Agents */}
          <div className="lg:col-span-2">
            <SectionPanel title={T('agents.title')} color="cyan" sub={`${data?.agentsSummary.length || 0} ${T('agents.nodes')}`}>
              {(!data?.agentsSummary || data.agentsSummary.length === 0) ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-mono text-sm">{T('agents.empty')}</p>
                  <p className="text-gray-700 font-mono text-xs mt-1">{T('agents.empty_hint')}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {data.agentsSummary.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} locale={locale} onClick={() => fetchAgentDetail(agent.id)} />
                  ))}
                </div>
              )}
            </SectionPanel>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Memory Matrix */}
            <SectionPanel title={T('memory.title')} color="purple">
              {(!data?.memoryByType || data.memoryByType.length === 0) ? (
                <p className="text-gray-600 font-mono text-xs text-center py-4">{T('memory.no_data')}</p>
              ) : (
                <div className="space-y-3">
                  {data.memoryByType.map(({ type, count }) => {
                    const total = data.stats.total_memories || 1;
                    const pct = Math.round((count / total) * 100);
                    const color = TYPE_COLORS[type] || '#00f0ff';
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                            <span className="text-xs font-mono font-semibold uppercase" style={{ color }}>{type}</span>
                          </div>
                          <span className="text-xs font-mono text-gray-500">{count} <span className="text-gray-700">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 rounded-full bg-cyber-dark overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionPanel>

            {/* Sync Log */}
            <SectionPanel title={T('sync.title')} color="green">
              <div className="max-h-56 overflow-y-auto">
                {(!data?.recentActivity || data.recentActivity.length === 0) ? (
                  <p className="text-gray-600 font-mono text-xs text-center py-4">{T('sync.no_activity')}</p>
                ) : (
                  <div className="space-y-2">
                    {data.recentActivity.slice(0, 8).map((act) => (
                      <div key={act.id} className="flex items-start gap-2 text-xs font-mono group">
                        <span className={`mt-0.5 ${act.sync_type === 'memory' ? 'text-cyber-cyan' : 'text-cyber-purple'}`}>
                          {act.sync_type === 'memory' ? '◆' : '◇'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-300 group-hover:text-cyber-cyan transition-colors">{act.agent_name}</span>
                          <span className="text-gray-600"> {T('sync.synced')} </span>
                          <span className="text-gray-400">{act.sync_type}</span>
                        </div>
                        <span className="text-gray-600 shrink-0">{timeAgo(locale, act.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionPanel>

            {/* Dreams Timeline */}
            {data?.dreamsByDay && data.dreamsByDay.length > 0 && (
              <SectionPanel title={locale === 'zh' ? '梦境趋势' : 'DREAM TREND'} color="pink">
                <div className="flex items-end gap-1 h-20">
                  {data.dreamsByDay.map((d) => {
                    const maxCount = Math.max(...data.dreamsByDay.map(x => x.count), 1);
                    const h = Math.max((d.count / maxCount) * 100, 8);
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
                        <span className="text-[8px] text-gray-600 font-mono">{d.count}</span>
                        <div className="w-full rounded-t-sm transition-all duration-700" style={{ height: `${h}%`, background: `linear-gradient(to top, #ff2d78, #b44dff)`, boxShadow: '0 0 6px rgba(255,45,120,0.3)' }} />
                        <span className="text-[8px] text-gray-700 font-mono">{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </SectionPanel>
            )}
          </div>
        </div>
      </main>

      {/* ======== FOOTER ======== */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-cyber-border mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 font-mono text-xs">
            <span className="neon-text-cyan text-[11px]">SUPERDREAMS</span> <span className="text-gray-600">//</span> Control Center v4.1.0
          </p>
          <p className="text-gray-500 font-mono text-xs">
            {T('footer.powered')} <span className="text-cyber-pink">{T('footer.engine')}</span> {T('footer.powered_suffix')} 🦞
          </p>
        </div>
      </footer>

      {/* ======== REGISTER MODAL ======== */}
      {showRegister && (
        <Modal onClose={resetRegister}>
          {!newApiKey ? (
            <div className="p-6">
              <ModalHeader color="cyan">{T('register.title')}</ModalHeader>
              <div className="space-y-4">
                <FormField label={T('register.name')}>
                  <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder={T('register.name_placeholder')}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-cyber-cyan/60 transition-all" />
                </FormField>
                <FormField label={T('register.species')}>
                  <select value={newAgentSpecies} onChange={(e) => setNewAgentSpecies(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300 focus:outline-none focus:border-cyber-cyan/60 transition-all">
                    <option value="lobster">{T('register.species_lobster')}</option>
                    <option value="ai">{T('register.species_ai')}</option>
                    <option value="human">{T('register.species_human')}</option>
                  </select>
                </FormField>
                <div className="flex gap-3 pt-2">
                  <button onClick={resetRegister}
                    className="flex-1 px-4 py-2.5 border border-cyber-border rounded-lg font-mono text-sm text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all">
                    {T('register.cancel')}
                  </button>
                  <button onClick={registerAgent} disabled={registering || !newAgentName.trim()}
                    className="flex-1 px-4 py-2.5 rounded-lg font-mono text-sm font-semibold bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/30 hover:shadow-neon-cyan disabled:opacity-40 transition-all">
                    {registering ? T('register.creating') : T('register.create')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <ModalHeader color="green">{T('register.success_title')}</ModalHeader>
              <div className="space-y-4">
                <FormField label={T('register.api_key')}>
                  <CopyField value={newApiKey} copied={copied === 'key'} onCopy={() => copyClip(newApiKey, 'key')} T={T} textClass="text-cyber-cyan" />
                </FormField>
                <FormField label={T('register.token')}>
                  <CopyField value={newAgentToken} copied={copied === 'token'} onCopy={() => copyClip(newAgentToken, 'token')} T={T} textClass="text-cyber-purple text-[10px]" />
                  <p className="text-[10px] text-cyber-yellow/60 mt-2 font-mono">{T('register.warning')}</p>
                </FormField>
                <button onClick={resetRegister}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg font-mono text-sm font-semibold bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan hover:shadow-neon-cyan transition-all">
                  {T('register.done')}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ======== AGENT DETAIL MODAL ======== */}
      {selectedAgent && (
        <Modal onClose={() => setSelectedAgent(null)}>
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-4px)]">
            {/* Agent header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyber-cyan/20 to-cyber-pink/20 border border-cyber-cyan/30 flex items-center justify-center text-3xl shadow-neon-cyan">
                  {SPECIES_MAP[selectedAgent.agent.species]?.emoji || '🤖'}
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-xl tracking-wider text-gray-200">{selectedAgent.agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedAgent.agent.status} locale={locale} />
                    <span className="text-xs font-mono text-gray-600">
                      {locale === 'zh' ? SPECIES_MAP[selectedAgent.agent.species]?.labelZh : SPECIES_MAP[selectedAgent.agent.species]?.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => deleteAgent(selectedAgent.agent.id)}
                  className="px-3 py-1.5 rounded-lg border border-cyber-pink/30 text-cyber-pink/60 font-mono text-xs hover:bg-cyber-pink/10 hover:border-cyber-pink/60 transition-all">
                  {T('detail.delete')}
                </button>
                <button onClick={() => setSelectedAgent(null)}
                  className="px-3 py-1.5 rounded-lg border border-cyber-border text-gray-500 font-mono text-xs hover:text-gray-300 hover:border-gray-500 transition-all">
                  {T('detail.close')}
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <MiniStat value={selectedAgent.agent.memory_count} label={T('detail.memories')} color="cyan" />
              <MiniStat value={selectedAgent.agent.dream_count} label={T('detail.dreams')} color="purple" />
              <MiniStat value={selectedAgent.agent.avg_importance ? selectedAgent.agent.avg_importance.toFixed(1) : 'N/A'} label={T('detail.avg_importance')} color="green" />
            </div>

            {/* Heartbeat */}
            <div className="mb-6 p-3 rounded-lg bg-cyber-dark border border-cyber-border">
              <span className="text-xs font-mono text-gray-500">{T('detail.last_heartbeat')}: </span>
              <span className="text-xs font-mono text-gray-400">
                {selectedAgent.agent.last_heartbeat ? new Date(selectedAgent.agent.last_heartbeat).toLocaleString('zh-CN') : T('detail.never')}
              </span>
              <span className="text-xs font-mono text-gray-600 ml-2">({timeAgo(locale, selectedAgent.agent.last_heartbeat)})</span>
            </div>

            {/* Recent Memories */}
            <DetailSection title={T('detail.recent_memories')} color="cyan">
              {selectedAgent.recentMemories.length === 0 ? (
                <p className="text-xs font-mono text-gray-600 text-center py-3">{T('detail.no_memories')}</p>
              ) : (
                <div className="space-y-2">
                  {selectedAgent.recentMemories.map((m) => (
                    <div key={m.id} className="p-3 rounded-lg bg-cyber-dark/50 border border-cyber-border hover:border-cyber-cyan/20 transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type={m.type} />
                        <span className="text-[10px] text-gray-600 font-mono">IMP: {m.importance}</span>
                        <span className="text-[10px] text-gray-600 font-mono ml-auto">{timeAgo(locale, m.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-300">{m.digest}</p>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            {/* Recent Dreams */}
            <DetailSection title={T('detail.recent_dreams')} color="purple">
              {selectedAgent.recentDreams.length === 0 ? (
                <p className="text-xs font-mono text-gray-600 text-center py-3">{T('detail.no_dreams')}</p>
              ) : (
                <div className="space-y-2">
                  {selectedAgent.recentDreams.map((d) => (
                    <div key={d.id} className="p-3 rounded-lg bg-cyber-dark/50 border border-cyber-border hover:border-cyber-purple/20 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-bold ${d.status === 'completed' ? 'text-cyber-green' : 'text-cyber-pink'}`}>
                          {d.status?.toUpperCase() || 'COMPLETED'}
                        </span>
                        {d.health_score && <span className="text-xs font-mono text-cyber-cyan">HEALTH: {d.health_score}</span>}
                      </div>
                      <p className="text-sm text-gray-300 truncate">{d.summary || T('detail.no_summary')}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-1">{timeAgo(locale, d.dreamed_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            <div className="mt-6 pt-4 border-t border-cyber-border">
              <p className="text-[10px] text-gray-700 font-mono">AGENT_ID: {selectedAgent.agent.id}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==================== Sub-Components ====================

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const styles: Record<string, { text: string; border: string; bg: string; glow: string; labelColor: string }> = {
    cyan: { text: 'neon-text-cyan', border: 'border-cyber-cyan/30', bg: 'bg-cyber-cyan/5', glow: 'hover:shadow-neon-cyan', labelColor: 'text-cyan-400/70' },
    green: { text: 'neon-text-green', border: 'border-cyber-green/30', bg: 'bg-cyber-green/5', glow: 'hover:shadow-neon-green', labelColor: 'text-green-400/70' },
    purple: { text: 'neon-text-purple', border: 'border-cyber-purple/30', bg: 'bg-cyber-purple/5', glow: 'hover:shadow-neon-purple', labelColor: 'text-purple-400/70' },
    pink: { text: 'neon-text-pink', border: 'border-cyber-pink/30', bg: 'bg-cyber-pink/5', glow: 'hover:shadow-neon-pink', labelColor: 'text-pink-400/70' },
  };
  const s = styles[color] || styles.cyan;
  return (
    <div className={`rounded-xl p-5 border ${s.border} ${s.bg} ${s.glow} transition-all holo-card group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className={`text-[11px] font-mono font-semibold uppercase tracking-wider ${s.labelColor}`}>{label}</span>
      </div>
      <div className={`text-4xl font-bold font-mono ${s.text}`}>{value}</div>
    </div>
  );
}

function SectionPanel({ title, color, sub, children }: { title: string; color: string; sub?: string; children: React.ReactNode }) {
  const barColors: Record<string, string> = { cyan: 'bg-cyber-cyan', green: 'bg-cyber-green', purple: 'bg-cyber-purple', pink: 'bg-cyber-pink' };
  return (
    <div className="rounded-xl border border-cyber-border bg-cyber-panel/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-cyber-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-4 rounded-full ${barColors[color] || barColors.cyan}`} />
          <h2 className="font-orbitron font-semibold text-sm tracking-wider text-gray-100">{title}</h2>
        </div>
        {sub && <span className="text-xs text-gray-600 font-mono">{sub}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function AgentCard({ agent, locale, onClick }: { agent: Agent; locale: Locale; onClick: () => void }) {
  const isOnline = agent.status === 'online';
  const species = SPECIES_MAP[agent.species] || SPECIES_MAP.ai;
  return (
    <div onClick={onClick}
      className="p-4 rounded-xl border border-cyber-border bg-cyber-dark/50 hover:border-cyber-cyan/40 hover:bg-cyber-dark transition-all cursor-pointer group holo-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-cyan/10 to-cyber-pink/10 border border-cyber-border flex items-center justify-center text-xl group-hover:border-cyber-cyan/30 group-hover:shadow-neon-cyan transition-all">
            {species.emoji}
          </div>
          <div>
            <p className="font-mono font-semibold text-sm text-gray-200 group-hover:text-cyber-cyan transition-colors">{agent.name}</p>
            <p className="text-[10px] font-mono text-gray-600">{locale === 'zh' ? species.labelZh : species.label}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} locale={locale} />
      </div>
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5"><span className="text-cyber-cyan/60">🧠</span><span className="text-gray-400">{agent.memory_count || 0}</span></div>
        <div className="flex items-center gap-1.5"><span className="text-cyber-purple/60">💭</span><span className="text-gray-400">{agent.dream_count || 0}</span></div>
        <span className="text-gray-700 ml-auto">{timeAgo(locale, agent.last_heartbeat)}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status, locale }: { status: string; locale: Locale }) {
  const isOnline = status === 'online';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
      isOnline ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30' : 'bg-gray-800/50 text-gray-600 border border-gray-700/50'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyber-green pulse-dot-green' : 'bg-gray-600'}`} />
      {isOnline ? t(locale, 'agents.status_online') : t(locale, 'agents.status_offline')}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || '#00f0ff';
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase"
      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
      {type}
    </span>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-cyber-panel border border-cyber-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink" />
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ color, children }: { color: string; children: React.ReactNode }) {
  const barColors: Record<string, string> = { cyan: 'bg-cyber-cyan', green: 'bg-cyber-green', purple: 'bg-cyber-purple', pink: 'bg-cyber-pink' };
  const textColors: Record<string, string> = { cyan: '', green: 'neon-text-green', purple: 'neon-text-purple', pink: 'neon-text-pink' };
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className={`w-1.5 h-5 rounded-full ${barColors[color]}`} />
      <h3 className={`font-orbitron font-bold text-lg tracking-wider text-gray-200 ${textColors[color] || ''}`}>{children}</h3>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function CopyField({ value, copied, onCopy, T, textClass = '' }: { value: string; copied: boolean; onCopy: () => void; T: (k: any) => string; textClass?: string }) {
  return (
    <div className="flex gap-2">
      <input type="text" value={value} readOnly className={`flex-1 bg-cyber-dark border border-cyber-border rounded-lg px-3 py-2 font-mono text-xs overflow-hidden ${textClass}`} />
      <button onClick={onCopy} className={`px-3 py-2 rounded-lg border font-mono text-xs transition-all ${
        copied ? 'border-cyber-green text-cyber-green bg-cyber-green/10' : 'border-cyber-border text-gray-400 hover:border-cyber-cyan hover:text-cyber-cyan'
      }`}>
        {copied ? T('register.copied') : T('register.copy')}
      </button>
    </div>
  );
}

function MiniStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  const textColors: Record<string, string> = { cyan: 'neon-text-cyan', purple: 'neon-text-purple', green: 'neon-text-green', pink: 'neon-text-pink' };
  const labelColors: Record<string, string> = { cyan: 'text-cyan-400/60', purple: 'text-purple-400/60', green: 'text-green-400/60', pink: 'text-pink-400/60' };
  return (
    <div className="p-3 rounded-lg bg-cyber-dark border border-cyber-border text-center">
      <div className={`text-2xl font-bold font-mono ${textColors[color]}`}>{value}</div>
      <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider mt-1 ${labelColors[color] || 'text-gray-400'}`}>{label}</div>
    </div>
  );
}

function DetailSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const barColors: Record<string, string> = { cyan: 'bg-cyber-cyan', purple: 'bg-cyber-purple', green: 'bg-cyber-green', pink: 'bg-cyber-pink' };
  return (
    <div className="mb-6">
      <h4 className="font-orbitron text-xs font-semibold tracking-wider text-gray-400 mb-3 flex items-center gap-2">
        <span className={`w-1 h-3 rounded-full ${barColors[color]}`} />
        {title}
      </h4>
      {children}
    </div>
  );
}
