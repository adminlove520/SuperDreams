import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>超梦 SuperDreams - 记忆管理中心</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Noto Sans SC', sans-serif; }
    .font-orbit { font-family: 'Orbitron', sans-serif; }
    body { background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d1a 100%); min-height: 100vh; }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
    .glow-cyan { box-shadow: 0 0 30px rgba(34,211,238,0.15), 0 0 60px rgba(34,211,238,0.05); }
    .glow-purple { box-shadow: 0 0 30px rgba(168,85,247,0.15), 0 0 60px rgba(168,85,247,0.05); }
    .text-cyan { color: #22d3ee; }
    .text-purple { color: #a855f7; }
    .text-pink { color: #ec4899; }
    .bg-cyan { background: linear-gradient(135deg, #22d3ee, #06b6d4); }
    .bg-purple { background: linear-gradient(135deg, #a855f7, #9333ea); }
    .bg-pink { background: linear-gradient(135deg, #ec4899, #db2777); }
    .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .health-ring { filter: drop-shadow(0 0 8px currentColor); }
    .type-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; }
    .scroll-hidden::-webkit-scrollbar { width: 6px; }
    .scroll-hidden::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
    .scroll-hidden::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    .btn-primary { background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); transition: all 0.3s; }
    .btn-primary:hover { box-shadow: 0 0 30px rgba(34,211,238,0.4); transform: scale(1.02); }
    .btn-dream { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); transition: all 0.3s; }
    .btn-dream:hover { box-shadow: 0 0 30px rgba(236,72,153,0.4); transform: scale(1.02); }
    .modal { transition: all 0.3s ease-out; }
    .modal.hidden { opacity: 0; pointer-events: none; transform: scale(0.95); }
    .stat-card { position: relative; overflow: hidden; }
    .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .stat-card.cyan::before { background: linear-gradient(90deg, transparent, #22d3ee, transparent); }
    .stat-card.purple::before { background: linear-gradient(90deg, transparent, #a855f7, transparent); }
    .stat-card.pink::before { background: linear-gradient(90deg, transparent, #ec4899, transparent); }
    .stat-card.green::before { background: linear-gradient(90deg, transparent, #10b981, transparent); }
    .memory-item { transition: all 0.2s; border-left: 3px solid transparent; }
    .memory-item:hover { background: rgba(255,255,255,0.03); border-left-color: #22d3ee; }
    .dream-item { transition: all 0.2s; }
    .dream-item:hover { background: rgba(168,85,247,0.05); }
    .loading-spinner { border: 3px solid rgba(255,255,255,0.1); border-top-color: #22d3ee; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .dream-status { animation: fadeIn 0.5s ease-out; }
  </style>
</head>
<body class="text-white overflow-hidden">
  <div id="app" class="h-screen flex flex-col">
    <header class="glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="text-3xl font-orbit font-bold">
          <span class="text-cyan">超梦</span><span class="text-purple">SuperDreams</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 rounded-full glass">
          <div id="statusDot" class="w-2 h-2 rounded-full bg-green-500"></div>
          <span id="statusText" class="text-xs text-gray-400">连接中...</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button onclick="openCreateModal()" class="btn-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          添加记忆
        </button>
        <button onclick="triggerDream()" class="btn-dream px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          触发做梦
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-hidden flex gap-6 p-6">
      <div class="w-80 flex flex-col gap-6">
        <div class="glass rounded-2xl p-6 glow-cyan flex flex-col items-center">
          <h3 class="text-sm font-medium text-gray-400 mb-4">记忆健康度</h3>
          <div class="relative w-48 h-48">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"/>
              <circle id="healthCircle" cx="50" cy="50" r="42" fill="none" stroke="#22d3ee" stroke-width="8" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="264" style="filter: drop-shadow(0 0 8px #22d3ee)"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span id="healthValue" class="text-4xl font-orbit font-bold text-cyan">--</span>
              <span class="text-sm text-gray-500">健康指数</span>
            </div>
          </div>
          <div id="healthLabel" class="mt-4 text-center">
            <span class="text-gray-400 text-sm">正在分析记忆状态...</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="stat-card cyan glass rounded-xl p-4 text-center">
            <div id="statMemories" class="text-2xl font-orbit font-bold text-cyan">--</div>
            <div class="text-xs text-gray-500 mt-1">记忆总数</div>
          </div>
          <div class="stat-card purple glass rounded-xl p-4 text-center">
            <div id="statAvgImportance" class="text-2xl font-orbit font-bold text-purple">--</div>
            <div class="text-xs text-gray-500 mt-1">平均重要性</div>
          </div>
          <div class="stat-card pink glass rounded-xl p-4 text-center">
            <div id="statDreams" class="text-2xl font-orbit font-bold text-pink">--</div>
            <div class="text-xs text-gray-500 mt-1">做梦次数</div>
          </div>
          <div class="stat-card green glass rounded-xl p-4 text-center">
            <div id="statConnections" class="text-2xl font-orbit font-bold text-green-400">--</div>
            <div class="text-xs text-gray-500 mt-1">记忆连接</div>
          </div>
        </div>

        <div class="glass rounded-2xl p-5">
          <h3 class="text-sm font-medium text-gray-400 mb-4">记忆类型分布</h3>
          <div id="typeDistribution" class="flex flex-wrap gap-2">
            <span class="text-gray-500 text-sm">加载中...</span>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-6 overflow-hidden">
        <div class="flex-1 glass rounded-2xl p-5 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">最近记忆</h3>
            <span id="memoryCount" class="text-sm text-gray-500">-- 条记忆</span>
          </div>
          <div id="memoriesList" class="flex-1 overflow-y-auto scroll-hidden space-y-2">
            <div class="flex items-center justify-center h-full"><div class="loading-spinner"></div></div>
          </div>
        </div>

        <div class="h-72 glass rounded-2xl p-5 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">做梦历史</h3>
            <span id="dreamCount" class="text-sm text-gray-500">-- 次做梦</span>
          </div>
          <div id="dreamsList" class="flex-1 overflow-y-auto scroll-hidden space-y-2">
            <div class="flex items-center justify-center h-full"><div class="loading-spinner"></div></div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <div id="createModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="glass rounded-2xl p-6 w-full max-w-lg mx-4 glow-purple">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-medium">创建新记忆</h3>
        <button onclick="closeCreateModal()" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <form id="createForm" onsubmit="createMemory(event)" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-2">记忆类型</label>
          <select id="memType" required class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan/50">
            <option value="lesson">💡 教训</option>
            <option value="decision">🎯 决策</option>
            <option value="fact">📚 事实</option>
            <option value="procedure">⚙️ 流程</option>
            <option value="person">👤 人物</option>
            <option value="project">📦 项目</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-2">内容</label>
          <textarea id="memContent" required rows="4" placeholder="输入记忆内容..." class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 resize-none"></textarea>
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-2">重要性 <span id="importanceValue" class="text-cyan">5</span>/10</label>
          <input id="memImportance" type="range" min="1" max="10" value="5" class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" oninput="document.getElementById('importanceValue').textContent = this.value">
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-2">标签 (逗号分隔)</label>
          <input id="memTags" type="text" placeholder="例如: 工作, 重要" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50">
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeCreateModal()" class="flex-1 px-4 py-3 rounded-lg border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors">取消</button>
          <button type="submit" class="flex-1 btn-primary px-4 py-3 rounded-lg font-medium">创建记忆</button>
        </div>
      </form>
    </div>
  </div>

  <div id="dreamModal" class="modal hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="glass rounded-2xl p-8 w-full max-w-md mx-4 text-center dream-status">
      <div class="text-6xl mb-6 animate-bounce">🦞</div>
      <h3 class="text-2xl font-orbit font-bold text-purple mb-2">正在做梦...</h3>
      <p id="dreamStatusText" class="text-gray-400">小龙虾正在整理记忆碎片</p>
      <div class="mt-6 flex justify-center"><div class="loading-spinner"></div></div>
    </div>
  </div>

  <script>
    const API = 'http://localhost:18793';

    async function loadData() {
      try {
        const [healthRes, statsRes, memRes, dreamRes] = await Promise.all([
          fetch(API + '/api/health').then(r => r.json()),
          fetch(API + '/api/stats').then(r => r.json()),
          fetch(API + '/api/memories?limit=20').then(r => r.json()),
          fetch(API + '/api/dreams?limit=10').then(r => r.json())
        ]);
        updateHealth(healthRes);
        updateStats(statsRes);
        updateMemories(memRes.memories || []);
        updateDreams(dreamRes.dreams || []);
        updateTypeDistribution(memRes.memories || []);
        updateStatus(true);
      } catch (e) {
        updateStatus(false);
      }
    }

    function updateStatus(online) {
      document.getElementById('statusDot').className = 'w-2 h-2 rounded-full ' + (online ? 'bg-green-500' : 'bg-red-500');
      document.getElementById('statusText').textContent = online ? '在线' : '离线';
    }

    function updateHealth(data) {
      const h = data.health || 0;
      document.getElementById('healthValue').textContent = Math.round(h);
      const circle = document.getElementById('healthCircle');
      circle.style.strokeDashoffset = 264 - (h / 100) * 264;
      let color = '#22d3ee', label = '健康';
      if (h < 40) { color = '#ef4444'; label = '急需整理'; }
      else if (h < 60) { color = '#f59e0b'; label = '需要关注'; }
      else if (h < 80) { color = '#22d3ee'; label = '良好'; }
      else { color = '#10b981'; label = '优秀'; }
      circle.style.stroke = color;
      circle.style.filter = 'drop-shadow(0 0 8px ' + color + ')';
      document.getElementById('healthLabel').innerHTML = '<span style="color:' + color + '">' + label + '</span>';
    }

    function updateStats(data) {
      document.getElementById('statMemories').textContent = data.totalMemories || 0;
      document.getElementById('statAvgImportance').textContent = (data.avgImportance || 0).toFixed(1);
      document.getElementById('statDreams').textContent = data.totalDreams || 0;
      document.getElementById('statConnections').textContent = data.totalConnections || 0;
    }

    function updateTypeDistribution(memories) {
      const counts = {};
      memories.forEach(m => { counts[m.type] = (counts[m.type] || 0) + 1; });
      const colors = { lesson: '#22d3ee', decision: '#a855f7', fact: '#10b981', procedure: '#f59e0b', person: '#ec4899', project: '#3b82f6' };
      document.getElementById('typeDistribution').innerHTML = Object.entries(counts).map(([t, c]) =>
        '<span class="type-badge" style="background:' + colors[t] + '22;color:' + colors[t] + ';">' + t + ' ' + c + '</span>'
      ).join('') || '<span class="text-gray-500 text-sm">暂无数据</span>';
    }

    function updateMemories(memories) {
      document.getElementById('memoryCount').textContent = memories.length + ' 条记忆';
      const container = document.getElementById('memoriesList');
      if (!memories.length) { container.innerHTML = '<div class="text-center text-gray-500 py-8">暂无记忆，添加第一条吧！</div>'; return; }
      const colors = { lesson: '#22d3ee', decision: '#a855f7', fact: '#10b981', procedure: '#f59e0b', person: '#ec4899', project: '#3b82f6' };
      container.innerHTML = memories.map(m => {
        const c = colors[m.type] || '#666';
        return '<div class="memory-item glass rounded-lg p-4">' +
          '<div class="flex items-start justify-between gap-4">' +
            '<div class="flex-1"><div class="flex items-center gap-2 mb-2">' +
              '<span class="type-badge" style="background:' + c + '22;color:' + c + ';">' + m.type + '</span>' +
              '<span class="text-xs text-gray-500">' + new Date(m.created_at).toLocaleDateString() + '</span></div>' +
              '<p class="text-sm text-gray-300">' + (m.content || '').substring(0, 100) + '</p></div>' +
            '<div class="text-cyan font-medium">' + m.importance + '⭐</div></div></div>';
      }).join('');
    }

    function updateDreams(dreams) {
      document.getElementById('dreamCount').textContent = dreams.length + ' 次做梦';
      const container = document.getElementById('dreamsList');
      if (!dreams.length) { container.innerHTML = '<div class="text-center text-gray-500 py-8">还没有做过梦</div>'; return; }
      container.innerHTML = dreams.map(d => {
        const st = d.status === 'completed' ? 'bg-green-500' : d.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500';
        const stText = d.status === 'completed' ? '完成' : d.status === 'failed' ? '失败' : '运行中';
        return '<div class="dream-item glass rounded-lg p-4">' +
          '<div class="flex items-center justify-between mb-2">' +
            '<span class="text-purple font-medium">做梦 #' + d.id + '</span>' +
            '<span class="text-xs text-gray-500">' + new Date(d.dreamed_at).toLocaleString() + '</span></div>' +
          '<div class="flex items-center gap-2"><span class="type-badge ' + st + ' text-white">' + stText + '</span>' +
            (d.scanned_files !== undefined ? '<span class="text-xs text-gray-500">📁 ' + d.scanned_files + '</span>' : '') +
            (d.new_memories !== undefined ? '<span class="text-xs text-gray-500">✨ ' + d.new_memories + '</span>' : '') + '</div>' +
          '<p class="text-sm text-gray-300 mt-2">' + (d.summary || '...') + '</p></div>';
      }).join('');
    }

    function openCreateModal() { document.getElementById('createModal').classList.remove('hidden'); }
    function closeCreateModal() { document.getElementById('createModal').classList.add('hidden'); document.getElementById('createForm').reset(); }

    async function createMemory(e) {
      e.preventDefault();
      const res = await fetch(API + '/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: document.getElementById('memType').value,
          content: document.getElementById('memContent').value,
          importance: parseInt(document.getElementById('memImportance').value),
          tags: document.getElementById('memTags').value
        })
      });
      if (res.ok) { closeCreateModal(); loadData(); }
    }

    async function triggerDream() {
      const modal = document.getElementById('dreamModal');
      document.getElementById('dreamModal').classList.remove('hidden');
      try {
        await fetch(API + '/api/dreams/trigger', { method: 'POST' });
        document.getElementById('dreamStatusText').textContent = '做梦完成！';
        setTimeout(() => { modal.classList.add('hidden'); loadData(); }, 2000);
      } catch (e) {
        document.getElementById('dreamStatusText').textContent = '失败: ' + e.message;
        setTimeout(() => modal.classList.add('hidden'), 2000);
      }
    }

    loadData();
    setInterval(loadData, 30000);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), html);
console.log('Done! HTML written to public/index.html');
