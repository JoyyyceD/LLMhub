import React from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Info,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Filter,
  ArrowUpRight
} from 'lucide-react';

const STATS = [
  { label: '收录模型', value: '56', change: '+2 本周', icon: LayoutGrid },
  { label: '最高 MMLU PRO', value: '78.5%', icon: Zap },
  { label: '更新时间', value: '2024-03-20', sub: '09:00', icon: Zap },
];

const TABLE_DATA = [
  { id: 'v3', name: 'DeepSeek-V3', sub: 'deepseek-v3', vendor: '深度求索', date: '2024-12-26', ttft: '180', tps: '135.0', input: '¥0.14', output: '¥0.28', score: '92.1', mmlu: '78.5', other: '89.2', color: 'bg-orange-500' },
  { id: 'qm', name: 'Qwen-Max', sub: 'qwen-max-latest', vendor: '通义千问', date: '2024-02-15', ttft: '320', tps: '88.5', input: '¥20.00', output: '¥60.00', score: '91.5', mmlu: '75.2', other: '88.1', color: 'bg-blue-500' },
  { id: 'yl', name: 'Yi-Lightning', sub: 'yi-lightning', vendor: '零一万物', date: '2024-10-16', ttft: '210', tps: '118.2', input: '¥0.99', output: '¥0.99', score: '90.8', mmlu: '74.6', other: '86.5', color: 'bg-emerald-500' },
  { id: 'dp', name: 'Doubao-Pro-128k', sub: 'doubao-pro-latest', vendor: '字节跳动', date: '2024-05-15', ttft: '240', tps: '92.0', input: '¥0.80', output: '¥2.00', score: '89.4', mmlu: '72.3', other: '87.0', color: 'bg-sky-500' },
  { id: 'g4', name: 'GLM-4-Plus', sub: 'glm-4-plus', vendor: '智谱 AI', date: '2024-08-16', ttft: '450', tps: '65.4', input: '¥50.00', output: '¥50.00', score: '88.2', mmlu: '71.5', other: '84.2', color: 'bg-purple-500' },
  { id: 'm6', name: 'abab-6.5s', sub: 'abab-6.5s-chat', vendor: 'MiniMax', date: '2024-04-17', ttft: '310', tps: '74.5', input: '¥1.00', output: '¥1.00', score: '87.5', mmlu: '70.4', other: '82.1', color: 'bg-slate-800' },
  { id: 'km', name: 'Kimi-Latest', sub: 'moonshot-v1-auto', vendor: '月之暗面', date: '2024-03-12', ttft: '550', tps: '42.8', input: '¥12.00', output: '¥36.00', score: '86.8', mmlu: '68.5', other: '81.4', color: 'bg-amber-500' },
  { id: 'bc', name: 'Baichuan-4', sub: 'baichuan-4', vendor: '百川智能', date: '2024-05-22', ttft: '380', tps: '62.0', input: '¥10.00', output: '¥10.00', score: '85.4', mmlu: '67.2', other: '80.5', color: 'bg-rose-500' },
  { id: 'sn', name: 'SenseNova 5.5', sub: 'sensenova-5-5', vendor: '商汤科技', date: '2024-07-05', ttft: '340', tps: '78.0', input: '¥0.50', output: '¥2.00', score: '84.1', mmlu: '65.8', other: '78.2', color: 'bg-indigo-600' },
  { id: 'sk', name: '讯飞星火 v4.0', sub: 'spark-v4-ultra', vendor: '科大讯飞', date: '2024-06-27', ttft: '420', tps: '58.5', input: '¥2.10', output: '¥2.10', score: '83.5', mmlu: '64.5', other: '77.4', color: 'bg-blue-400' },
];

export const Leaderboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Tabs */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button className="px-6 py-2 text-sm font-bold text-slate-500">全球模型</button>
          <button className="px-6 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-700 text-primary rounded-lg shadow-sm">国内优化</button>
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          当前视图: <span className="text-primary">中国内地市场优化版</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <stat.icon className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">{stat.value}</span>
                {stat.change && <span className="text-xs font-bold text-emerald-500">{stat.change}</span>}
                {stat.sub && <span className="text-xs font-bold text-slate-400">{stat.sub}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {['全部类别', '通用能力', '极速响应', '高性价比'].map((tag, i) => (
              <button key={tag} className={`px-5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                i === 0 ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:border-primary transition-all">
              <Filter className="w-4 h-4" /> 高级筛选
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:border-primary transition-all">
              <Download className="w-4 h-4" /> 导出数据 (CSV)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">模型名称</th>
                <th className="px-6 py-4">核心厂商</th>
                <th className="px-6 py-4">发布日期</th>
                <th className="px-6 py-4 text-center">首字延迟 (ms)</th>
                <th className="px-6 py-4 text-center">吞吐速度 (tps)</th>
                <th className="px-6 py-4 text-center">输入价格 (¥/1M)</th>
                <th className="px-6 py-4 text-center">输出价格 (¥/1M)</th>
                <th className="px-6 py-4 text-center">智力总分</th>
                <th className="px-6 py-4 text-center">MMLU</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {TABLE_DATA.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black text-white ${row.color}`}>
                        {row.id.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{row.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{row.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{row.vendor}</td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{row.date}</td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-primary font-display">{row.ttft}</td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-primary font-display">{row.tps}</td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-emerald-600 font-display">{row.input}</td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-emerald-600 font-display">{row.output}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-display">{row.score}</span>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-slate-600 dark:text-slate-300 font-display">{row.mmlu}</td>
                  <td className="px-6 py-5 text-center">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">显示前 10 个模型 (共 56 个国内优化模型)</p>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-slate-300" disabled><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm">3</button>
            <span className="text-slate-400 mx-1">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm">6</button>
            <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Info className="w-4 h-4 text-primary" /> 指标说明
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300">CMMLU/CEval:</span> 针对中文语境的权威基础综合能力评估榜单。<br />
            <span className="font-bold text-slate-700 dark:text-slate-300">价格数据:</span> 单位均为人民币 (¥)，基于 1M Token 标准。
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Zap className="w-4 h-4 text-primary" /> 本地化优势
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            收录模型均支持国内主流云服务商 (如阿里云、腾讯云、火山引擎) 直接接入，且均已通过互联网信息服务深度合成服务算法备案。
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-primary" /> 合规与即时性
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            数据每日自动抓取自各大厂商官方 API 定价页，包含 6% 增值税。所有展示厂商均符合中国内地监管要求，保障业务连续性。
          </p>
        </div>
      </div>
    </div>
  );
};

