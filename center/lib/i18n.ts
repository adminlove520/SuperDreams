// ==================== i18n System ====================
export type Locale = 'zh' | 'en';

export const translations = {
  zh: {
    // Header
    'header.title_1': '超梦',
    'header.title_2': '中控',
    'header.subtitle': '控制中心 v5.1',
    'header.online': '在线',
    'header.total': '总计',
    'header.search': '神经搜索',
    'header.register': '+ 注册节点',
    'header.lang': 'EN',

    // Stats
    'stats.agents': '节点',
    'stats.online': '在线',
    'stats.memories': '记忆',
    'stats.dreams': '梦境',

    // Agents
    'agents.title': '已注册节点',
    'agents.nodes': '个节点',
    'agents.empty': '未检测到任何节点',
    'agents.empty_hint': '注册一个 Agent 以启动认知操作',
    'agents.status_online': '在线',
    'agents.status_offline': '离线',

    // Memory Matrix
    'memory.title': '记忆矩阵',
    'memory.no_data': '暂无数据',

    // Sync Log
    'sync.title': '同步日志',
    'sync.no_activity': '暂无活动',
    'sync.synced': '同步了',

    // Search
    'search.placeholder': '搜索所有节点的记忆...',
    'search.button': '搜索',
    'search.scanning': '扫描中...',
    'search.no_results': '未找到结果',

    // Register Modal
    'register.title': '新建节点',
    'register.name': '节点名称',
    'register.name_placeholder': '例如: Superdreams-Alpha',
    'register.species': '物种类型',
    'register.species_lobster': '🦞 龙虾',
    'register.species_ai': '🤖 AI 智能体',
    'register.species_human': '👤 人类',
    'register.cancel': '取消',
    'register.create': '创建',
    'register.creating': '创建中...',
    'register.success_title': '节点已创建',
    'register.api_key': 'API 密钥',
    'register.token': 'JWT 令牌',
    'register.warning': '⚠ 凭证仅显示一次 — 请立即保存',
    'register.copy': '复制',
    'register.copied': '✓ 已复制',
    'register.done': '确认',

    // Agent Detail
    'detail.memories': '记忆',
    'detail.dreams': '梦境',
    'detail.avg_importance': '平均重要度',
    'detail.last_heartbeat': '最后心跳',
    'detail.never': '从未',
    'detail.recent_memories': '最近记忆',
    'detail.recent_dreams': '最近梦境',
    'detail.no_memories': '尚未同步记忆',
    'detail.no_dreams': '尚未同步梦境',
    'detail.delete': '删除',
    'detail.delete_confirm': '确定要删除这个 Agent 吗？所有相关的记忆和梦境数据都将丢失。',
    'detail.close': '关闭',
    'detail.no_summary': '无摘要',

    // Footer
    'footer.powered': '由',
    'footer.engine': '超梦引擎',
    'footer.powered_suffix': '驱动',

    // Loading
    'loading.title': '初始化中',
    'loading.subtitle': '正在加载神经网络...',

    // Time
    'time.seconds_ago': '秒前',
    'time.minutes_ago': '分钟前',
    'time.hours_ago': '小时前',
    'time.days_ago': '天前',
    'time.na': '无',
  },
  en: {
    // Header
    'header.title_1': 'SUPER',
    'header.title_2': 'DREAMS',
    'header.subtitle': 'Control Center v5.1',
    'header.online': 'ONLINE',
    'header.total': 'TOTAL',
    'header.search': 'Neural Search',
    'header.register': '+ REGISTER',
    'header.lang': '中',

    // Stats
    'stats.agents': 'AGENTS',
    'stats.online': 'ONLINE',
    'stats.memories': 'MEMORIES',
    'stats.dreams': 'DREAMS',

    // Agents
    'agents.title': 'REGISTERED AGENTS',
    'agents.nodes': 'nodes',
    'agents.empty': 'NO AGENTS DETECTED',
    'agents.empty_hint': 'Register an agent to begin cognitive operations',
    'agents.status_online': 'ONLINE',
    'agents.status_offline': 'OFFLINE',

    // Memory Matrix
    'memory.title': 'MEMORY MATRIX',
    'memory.no_data': 'NO DATA',

    // Sync Log
    'sync.title': 'SYNC LOG',
    'sync.no_activity': 'NO RECENT ACTIVITY',
    'sync.synced': 'synced',

    // Search
    'search.placeholder': 'Search memories across all agents...',
    'search.button': 'SEARCH',
    'search.scanning': 'SCANNING...',
    'search.no_results': 'No results found',

    // Register Modal
    'register.title': 'NEW AGENT',
    'register.name': 'Agent Name',
    'register.name_placeholder': 'e.g., Superdreams-Alpha',
    'register.species': 'Species',
    'register.species_lobster': '🦞 Lobster',
    'register.species_ai': '🤖 AI Agent',
    'register.species_human': '👤 Human',
    'register.cancel': 'CANCEL',
    'register.create': 'CREATE',
    'register.creating': 'CREATING...',
    'register.success_title': 'AGENT CREATED',
    'register.api_key': 'API Key',
    'register.token': 'JWT Token',
    'register.warning': '⚠ CREDENTIALS SHOWN ONCE — SAVE IMMEDIATELY',
    'register.copy': 'COPY',
    'register.copied': '✓ COPIED',
    'register.done': 'ACKNOWLEDGED',

    // Agent Detail
    'detail.memories': 'Memories',
    'detail.dreams': 'Dreams',
    'detail.avg_importance': 'Avg Importance',
    'detail.last_heartbeat': 'LAST HEARTBEAT',
    'detail.never': 'Never',
    'detail.recent_memories': 'RECENT MEMORIES',
    'detail.recent_dreams': 'RECENT DREAMS',
    'detail.no_memories': 'No memories synced',
    'detail.no_dreams': 'No dreams synced',
    'detail.delete': 'DELETE',
    'detail.delete_confirm': 'Delete this agent? All related memory and dream data will be lost.',
    'detail.close': 'CLOSE',
    'detail.no_summary': 'No summary',

    // Footer
    'footer.powered': 'Powered by',
    'footer.engine': 'Neural Lobster Engine',
    'footer.powered_suffix': '',

    // Loading
    'loading.title': 'INITIALIZING',
    'loading.subtitle': 'Loading neural networks...',

    // Time
    'time.seconds_ago': 's ago',
    'time.minutes_ago': 'm ago',
    'time.hours_ago': 'h ago',
    'time.days_ago': 'd ago',
    'time.na': 'N/A',
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || key;
}

export function timeAgo(locale: Locale, dateStr: string | null): string {
  if (!dateStr) return t(locale, 'time.na');
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  if (diff < 60000) return `${Math.floor(diff / 1000)}${t(locale, 'time.seconds_ago')}`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}${t(locale, 'time.minutes_ago')}`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}${t(locale, 'time.hours_ago')}`;
  return `${Math.floor(diff / 86400000)}${t(locale, 'time.days_ago')}`;
}
