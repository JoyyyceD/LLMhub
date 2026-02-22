import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  List,
  Check,
  RefreshCcw,
  Search,
  Info,
  Zap
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { MODELS } from '../constants';

export const Comparison = () => {
  const location = useLocation();
  
  // Default: Top 4 models by MMLU score
  const defaultTopModelIds = useMemo(() => 
    [...MODELS].sort((a, b) => b.benchmarks.mmlu - a.benchmarks.mmlu).slice(0, 4).map(m => m.id),
    []
  );

  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    open: true,
    closed: true,
    vendors: ['国内大厂', '新锐创业公司', '国际巨头']
  });

  // Initialize selection based on location state or default top models
  useEffect(() => {
    if (location.state?.selectedModelIds) {
      setSelectedModelIds(location.state.selectedModelIds);
    } else {
      setSelectedModelIds(defaultTopModelIds);
    }
  }, [location.state, defaultTopModelIds]);

  const selectedModels = useMemo(() => 
    MODELS.filter(m => selectedModelIds.includes(m.id)),
    [selectedModelIds]
  );

  const getModelCategory = (vendor: string) => {
    const v = vendor.toLowerCase();
    if (v.includes('alibaba') || v.includes('tencent') || v.includes('baidu')) return '国内大厂';
    if (v.includes('deepseek') || v.includes('zhipu') || v.includes('01.ai')) return '新锐创业公司';
    if (v.includes('openai') || v.includes('google') || v.includes('anthropic')) return '国际巨头';
    return '其他';
  };

  const filteredModels = useMemo(() => {
    return MODELS.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      
      // If no type filters are selected, show all types
      const noTypeFilters = !filters.open && !filters.closed;
      const matchesType = noTypeFilters || (filters.open && m.type === 'open') || (filters.closed && m.type === 'closed');
      
      // If no vendor filters are selected, show all vendors
      const noVendorFilters = filters.vendors.length === 0;
      const category = getModelCategory(m.vendor);
      const matchesVendor = noVendorFilters || filters.vendors.includes(category);

      return matchesSearch && matchesType && matchesVendor;
    });
  }, [searchQuery, filters]);

  const toggleModel = (id: string) => {
    setSelectedModelIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const radarData = [
    { subject: '通用能力', fullMark: 100 },
    { subject: '代码能力', fullMark: 100 },
    { subject: '数学能力', fullMark: 100 },
    { subject: '逻辑推理', fullMark: 100 },
    { subject: '响应速度', fullMark: 100 },
    { subject: '性价比', fullMark: 100 },
  ].map(item => {
    const dataPoint: any = { ...item };
    selectedModels.forEach(model => {
      if (item.subject === '通用能力') dataPoint[model.name] = model.benchmarks.mmlu;
      if (item.subject === '代码能力') dataPoint[model.name] = model.benchmarks.humanEval;
      if (item.subject === '数学能力') dataPoint[model.name] = model.benchmarks.gsm8k;
      if (item.subject === '逻辑推理') dataPoint[model.name] = model.benchmarks.math || 70;
      if (item.subject === '响应速度') {
        const tps = parseInt(model.performance.throughput);
        dataPoint[model.name] = Math.min(100, (tps / 150) * 100);
      }
      if (item.subject === '性价比') {
        const avgScore = (model.benchmarks.mmlu + model.benchmarks.humanEval + model.benchmarks.gsm8k) / 3;
        dataPoint[model.name] = Math.min(100, (avgScore / 80) * 90);
      }
    });
    return dataPoint;
  });

  const colors = ['#137fec', '#10b981', '#8b5cf6', '#f59e0b'];
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 flex gap-8">
      {/* Sidebar Filters */}
      <aside className="w-80 flex-shrink-0 flex flex-col gap-6 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">开源/闭源</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.open}
                onChange={() => setFilters(f => ({ ...f, open: !f.open }))}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">开源模型</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.closed}
                onChange={() => setFilters(f => ({ ...f, closed: !f.closed }))}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">闭源模型</span>
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">厂商选择</h3>
          <div className="space-y-3">
            {[
              { label: '国内大厂', desc: '阿里, 腾讯, 百度等' },
              { label: '新锐创业公司', desc: 'DeepSeek, 智谱等' },
              { label: '国际巨头', desc: 'OpenAI, Google等' }
            ].map((vendor) => (
              <label key={vendor.label} className="flex items-center justify-between text-sm group cursor-pointer">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={filters.vendors.includes(vendor.label)}
                    onChange={() => {
                      setFilters(f => ({
                        ...f,
                        vendors: f.vendors.includes(vendor.label) 
                          ? f.vendors.filter(v => v !== vendor.label)
                          : [...f.vendors, vendor.label]
                      }));
                    }}
                    className="rounded border-slate-300 text-primary focus:ring-primary" 
                  />
                  <span>{vendor.label}</span>
                </div>
                <span className="text-slate-400 text-xs text-right">{vendor.desc}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">选择对比模型</h3>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {selectedModelIds.length}/4
            </span>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="搜索模型或厂商..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {filteredModels.map((model) => (
              <label 
                key={model.id} 
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                  selectedModelIds.includes(model.id) 
                    ? 'bg-primary/5 border-primary/20 border' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={selectedModelIds.includes(model.id)}
                  onChange={() => toggleModel(model.id)}
                  disabled={!selectedModelIds.includes(model.id) && selectedModelIds.length >= 4}
                  className="rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-30"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate">{model.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{model.vendor}</span>
                </div>
              </label>
            ))}
            {filteredModels.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                未找到匹配的模型
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilters({ open: true, closed: true, vendors: ['国内大厂', '新锐创业公司', '国际巨头'] });
              setSelectedModelIds(defaultTopModelIds);
            }}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            重置所有选项
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Stats & Radar Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">模型多维度对比</h2>
                <p className="text-sm text-slate-500">综合能力雷达分布图 (最多对比 4 个)</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-end">
                {selectedModels.map((model, idx) => (
                  <div key={model.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }}></span>
                    <span className="text-xs font-bold">{model.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedModels.map((model, idx) => (
                    <Radar
                      key={model.id}
                      name={model.name}
                      dataKey={model.name}
                      stroke={colors[idx]}
                      fill={colors[idx]}
                      fillOpacity={0.2}
                      strokeWidth={3}
                    />
                  ))}
                  {selectedModels.length > 0 && (
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 opacity-80 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">对比分析概览</span>
              </div>
              <h3 className="text-3xl font-bold leading-tight">
                {selectedModels.length > 0 ? selectedModels[0].name : 'N/A'} 
                <span className="block text-lg font-medium opacity-70 mt-1">在当前选择中综合表现最佳</span>
              </h3>
              
              <div className="mt-8 space-y-4">
                <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-sky-300" />
                    <span className="text-xs font-bold uppercase tracking-wider">核心优势</span>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {selectedModels.length > 0 ? selectedModels[0].recommendationReason : '请选择模型进行对比'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 relative z-10">
              <button className="w-full bg-white text-primary py-3.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                生成详细对比报告
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <List className="w-5 h-5 text-primary" />
              对比模型详细数据
            </h3>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm">
                <Download className="w-4 h-4" />
                导出对比数据
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 min-w-[200px]">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  <th className="px-6 py-4 text-center">通用 (MMLU)</th>
                  <th className="px-6 py-4 text-center">代码 (Eval)</th>
                  <th className="px-6 py-4 text-center">数学 (GSM8K)</th>
                  <th className="px-6 py-4 text-center">吞吐量</th>
                  <th className="px-6 py-4 text-right">价格</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedModels.map((model, idx) => (
                  <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx] }}></div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm group-hover:text-primary transition-colors">{model.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{model.type === 'open' ? '开源' : '闭源'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{model.vendor}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {model.benchmarks.mmlu.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{model.benchmarks.humanEval.toFixed(1)}</td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{model.benchmarks.gsm8k.toFixed(1)}</td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{model.performance.throughput}</td>
                    <td className="px-6 py-5 text-right font-mono text-xs font-bold text-slate-500">{model.pricing.input}</td>
                  </tr>
                ))}
                {selectedModels.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                      请在左侧侧边栏选择模型进行对比
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
