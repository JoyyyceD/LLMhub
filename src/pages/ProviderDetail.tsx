import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, ChevronRight, Home as HomeIcon, Loader2, PackageSearch } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ModelSnapshot } from '../types';

const MODALITY_LABEL: Record<string, string> = {
  llm: 'LLM模型',
  text_to_image: '文生图模型',
  text_to_video: '文生视频模型',
  image_editing: '图像编辑模型',
  image_to_video: '图生视频模型',
  text_to_speech: '语音合成 / TTS模型',
};

function decodeName(raw: string | undefined): string {
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export const ProviderDetail = () => {
  const { name } = useParams<{ name: string }>();
  const providerName = decodeName(name);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [models, setModels] = useState<ModelSnapshot[]>([]);

  useEffect(() => {
    if (!providerName) {
      setError('厂商名称无效。');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    supabase
      .from('model_snapshots')
      .select('*')
      .eq('has_aa', true)
      .eq('aa_model_creator_name', providerName)
      .order('aa_release_date', { ascending: false, nullsFirst: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError('厂商数据加载失败，请稍后重试。');
          setModels([]);
        } else {
          setModels((data ?? []) as ModelSnapshot[]);
        }
        setLoading(false);
      });
  }, [providerName]);

  const providerDisplayName = useMemo(() => {
    const first = models[0];
    if (!first) return providerName || '未知厂商';
    if (first.is_cn_provider) {
      return first.aa_model_creator_name_cn ?? first.aa_model_creator_name ?? providerName;
    }
    return first.aa_model_creator_name ?? providerName;
  }, [models, providerName]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> 首页
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/leaderboard" className="hover:text-primary transition-colors">性能榜单</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium">{providerDisplayName}</span>
      </nav>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{providerDisplayName}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                模型总数: {models.length}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-500 text-sm font-medium">{error}</div>
        ) : models.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <PackageSearch className="w-10 h-10 mx-auto mb-3 opacity-70" />
            <p className="text-sm font-bold">暂无该厂商模型数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30 border-y border-slate-100">
                  <th className="px-8 py-4">模型名称</th>
                  <th className="px-8 py-4 text-center">发布时间</th>
                  <th className="px-8 py-4 text-center">模型类型</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {models.map((m) => (
                  <tr key={`${m.aa_modality || 'llm'}:${m.aa_slug}`} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <Link to={`/model/${m.aa_slug}`} className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors hover:underline">
                        {m.aa_name?.replace(/\s*\(.*?\)\s*/g, '')}
                      </Link>
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-bold text-slate-500">{m.aa_release_date ?? 'N/A'}</td>
                    <td className="px-8 py-5 text-center text-sm font-black text-indigo-600">
                      {MODALITY_LABEL[m.aa_modality ?? 'llm'] ?? (m.aa_modality ?? 'LLM模型')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

